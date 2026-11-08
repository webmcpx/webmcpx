//! Scan one public page: which WebMCP tools it registers, what `webmcpx lint` says about them, and
//! roughly how much an agent must read without them. Backs `GET /api/scan?url=` (see `server.rs`).
//!
//! Safety:
//! - The scan browser connects only through [`proxy`](crate::proxy), which resolves every host itself and
//!   refuses non-public addresses ([`Egress::Public`]) before any byte is sent: redirects, subresources,
//!   fetches and DNS rebinding included. WebRTC is limited to the proxy too.
//! - One isolated browser context per scan, closed even when the scan times out; if closing fails, the
//!   browser is replaced. A few scans at a time, each with a deadline.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::{Duration, Instant};

use anyhow::Result;
use reqwest::Url;
use serde::Serialize;
use serde_json::{Value, json};
use tokio::sync::{Mutex, OnceCell, Semaphore};

use crate::arm::{INIT_SCRIPTS, registered_tools};
use crate::cdp::{Browser, Page};
use crate::proxy::{self, Egress};

/// Scans running at once by default (`Scanner::parallel` overrides); more wait in line for a slot, up to
/// `QUEUE_WAIT`, and no more than `MAX_WAITING` wait at a time.
const PARALLEL: usize = 2;
const QUEUE_WAIT: Duration = Duration::from_secs(30);
const MAX_WAITING: usize = 100;
/// A site's report is reused for this long: many people scanning the same site (a shared link, a
/// popular page) cost one browser visit.
const CACHE_FOR: Duration = Duration::from_mins(5);
/// Memory the cache may hold (reports as JSON); the oldest go first. Pages control their reports' size
/// (tool descriptions), so a report bigger than `CACHE_ENTRY_MAX` is never kept.
const CACHE_BYTES: usize = 64 * 1024 * 1024;
/// A site's latest verdict feeds its README badge for this long (a few bytes per site).
const VERDICT_FOR: Duration = Duration::from_hours(24 * 7);
const VERDICTS_MAX: usize = 50_000;
/// Share cards kept rendered (about 50 KB each), and requests that may wait for one.
const CARDS_MAX: usize = 200;
const CARD_WAITERS: usize = 8;
const CACHE_ENTRY_MAX: usize = 256 * 1024;
/// Whole scan, navigation included.
const DEADLINE: Duration = Duration::from_secs(45);
/// Resolving the site's host before a scan (and after its redirects).
const RESOLVE_WAIT: Duration = Duration::from_secs(5);
/// The longest a scan request can take with the default deadline: resolving, waiting in line, the scan,
/// then closing its page. A server stopping for a deploy waits this long for requests in flight.
pub const LONGEST_SCAN: Duration = RESOLVE_WAIT
    .saturating_add(QUEUE_WAIT)
    .saturating_add(DEADLINE)
    .saturating_add(CLOSE_WAIT);
/// Kept free at the end of a scan's deadline for building the report after the best-effort steps.
const REPORT_MARGIN: Duration = Duration::from_secs(1);
/// Closing a context after a scan; longer means the browser is stuck and gets replaced.
const CLOSE_WAIT: Duration = Duration::from_secs(10);
/// How long to wait for tools after the page loaded (sites register them after hydration).
const TOOL_WAIT: Duration = Duration::from_secs(6);
/// Characters per token for the estimate (OpenAI's rule of thumb for English text).
const CHARS_PER_TOKEN: usize = 4;

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub url: String,
    pub final_url: String,
    pub title: String,
    pub verdict: Verdict,
    pub tools: Vec<Tool>,
    pub diagnostics: Vec<Finding>,
    /// Estimated tokens of the text snapshot a DOM-reading agent gets for this page.
    pub page_tokens: usize,
    /// The agent-ready score, 0 to 100: the sum of `score_items` (see [`score`]).
    pub score: u8,
    /// What the score is made of, item by item, so the page can say what to fix.
    pub score_items: Vec<ScoreItem>,
    /// The site's icon as a small `data:image/...` URI, fetched by the scan browser (through the egress
    /// proxy), so the page showing the report never requests anything from the scanned site.
    pub favicon: Option<String>,
    pub elapsed_ms: u64,
    /// The day the scan ran, `YYYY-MM-DD` (UTC): what the share card's date shows.
    pub scanned_on: String,
    /// Set when this report comes from the cache (an earlier scan of the same URL), not a scan just now.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cached: Option<Cached>,
}

/// How old a cached report is, and when its copy expires (then the next request scans again).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub struct Cached {
    /// Seconds since the scan that made this report.
    pub age_s: u64,
    /// Seconds until the cache drops it (at least 1).
    pub expires_in_s: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Verdict {
    /// Registers tools, the linter finds no errors and the score is at least [`READY_SCORE`].
    Ready,
    /// Registers tools, but the linter finds errors or the score is under [`READY_SCORE`].
    Issues,
    /// Registers no WebMCP tools.
    Missing,
}

#[derive(Debug, Serialize, Clone)]
pub struct Tool {
    pub name: String,
    pub description: String,
    pub params: Vec<String>,
    pub read_only: Option<bool>,
}

#[derive(Debug, Serialize, Clone)]
pub struct Finding {
    pub rule: &'static str,
    pub severity: &'static str,
    pub message: String,
}

/// The lowest score of an agent-ready site (with WebMCP tools and no lint errors).
pub const READY_SCORE: u8 = 70;

/// What the scan found besides the tools, read from the site by the scan browser (see `AGENT_CHECKS_JS`).
/// Only booleans: nothing the site wrote travels back.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "independent yes/no checks, one per agent basic; not states of one thing"
)]
pub struct Checks {
    /// `/llms.txt`, not an HTML page.
    pub llms_txt: bool,
    /// The page as Markdown: served for `Accept: text/markdown`, or linked as `rel="alternate"`.
    pub markdown: bool,
    /// robots.txt lets AI agents fetch the home page (`*` and each known AI agent: effective rules, wildcards and
    /// Allow precedence included); a 4xx (no robots.txt) allows all, a 5xx or no answer doesn't count (RFC 9309).
    pub robots_allows_agents: bool,
    /// A sitemap: `/sitemap.xml` or a `Sitemap:` line in robots.txt.
    pub sitemap: bool,
    /// `Link` response headers on the page (RFC 8288).
    pub link_headers: bool,
    /// `/.well-known/agent-skills/index.json` (Agent Skills Discovery).
    pub agent_skills: bool,
    /// `/.well-known/api-catalog` (RFC 9727).
    pub api_catalog: bool,
}

/// One line of the score: what was checked, its points and their maximum.
#[derive(Debug, Clone, Serialize)]
pub struct ScoreItem {
    pub id: &'static str,
    pub points: u8,
    pub max: u8,
}

/// The agent-ready score, item by item (100 in all). WebMCP weighs half: tools (25), no lint errors (15),
/// every tool described (5) and every tool saying what it does to the page (5: `readOnlyHint`,
/// `consequentialHint` or `destructiveHint`). Agent cost (15): full with tools, else by
/// what reading the page costs. Readable (20) and discoverable (15): the agent basics, 5 each.
pub fn score(
    tools: &[Tool],
    diagnostics: &[Finding],
    page_tokens: usize,
    annotated: bool,
    c: &Checks,
) -> Vec<ScoreItem> {
    let has = !tools.is_empty();
    let item = |id, ok: bool, max: u8| ScoreItem {
        id,
        points: if ok { max } else { 0 },
        max,
    };
    let cost = if has {
        15
    } else {
        match page_tokens {
            0..=2_000 => 15,
            2_001..=5_000 => 10,
            5_001..=10_000 => 5,
            _ => 0,
        }
    };
    vec![
        item("tools", has, 25),
        item(
            "lint",
            has && !diagnostics.iter().any(|d| d.severity == "error"),
            15,
        ),
        item(
            "descriptions",
            has && tools.iter().all(|t| !t.description.trim().is_empty()),
            5,
        ),
        item("annotations", has && annotated, 5),
        ScoreItem {
            id: "cost",
            points: cost,
            max: 15,
        },
        item("llms_txt", c.llms_txt, 5),
        item("markdown", c.markdown, 5),
        item("robots", c.robots_allows_agents, 5),
        item("sitemap", c.sitemap, 5),
        item("link_headers", c.link_headers, 5),
        item("agent_skills", c.agent_skills, 5),
        item("api_catalog", c.api_catalog, 5),
    ]
}

/// Why a scan did not produce a report; each maps to an HTTP status in `server.rs`.
#[derive(Debug, Clone)]
pub enum ScanError {
    /// Not an http(s) URL, or a host we refuse to open.
    BadUrl(String),
    Busy,
    TimedOut,
    /// The page could not be opened or read.
    Failed(String),
}

/// A Chrome running in another container (production): the `host:port` of its DevTools endpoint, and
/// where our egress proxy listens for it. That Chrome must be started with `--proxy-server` pointing at
/// this proxy and must have no other route to the network.
#[derive(Debug, Clone)]
pub struct Remote {
    pub chrome: String,
    pub proxy: std::net::SocketAddr,
}

/// One scan's result, awaited by everyone who asked for that URL meanwhile.
type SharedScan = Arc<OnceCell<Result<Report, ScanError>>>;
/// Shared scans by URL, with how many callers are waiting on each.
type Inflight = std::sync::Mutex<HashMap<String, (SharedScan, usize)>>;

/// Today's date in UTC, `YYYY-MM-DD` (days to civil date, as in Howard Hinnant's `civil_from_days`).
fn today() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| d.as_secs());
    let z = i64::try_from(secs / 86_400).unwrap_or(0) + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

/// A site's latest scan in a few numbers, kept a week (a few dozen bytes per site): its badge, and its share
/// card and link preview after the full report has left the cache.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Kept {
    pub host: String,
    pub verdict: Verdict,
    pub tools: usize,
    pub page_tokens: usize,
    pub score: u8,
    pub lint_errors: bool,
    pub scanned_on: String,
    at: Instant,
}

impl Kept {
    pub fn summary(&self) -> crate::card::Summary<'_> {
        crate::card::Summary {
            host: &self.host,
            verdict: self.verdict,
            tools: self.tools,
            page_tokens: self.page_tokens,
            score: self.score,
            lint_errors: self.lint_errors,
            scanned_on: &self.scanned_on,
        }
    }
}

/// Shares one headless Chrome (behind the egress proxy) between scans.
pub struct Scanner {
    chrome: Option<PathBuf>,
    remote: Option<Remote>,
    /// The proxy a remote Chrome uses: it lives as long as the scanner, since that Chrome's address for it
    /// is fixed when it starts.
    remote_proxy: tokio::sync::OnceCell<proxy::Proxy>,
    egress: Egress,
    deadline: Duration,
    browser: Mutex<Option<Arc<Session>>>,
    slots: Semaphore,
    /// Places in the building: a slot or a place in line. Held for the whole scan and released on drop,
    /// so a caller who gives up (a closed tab) frees its place too.
    places: Semaphore,
    /// Recent reports by URL.
    cache: std::sync::Mutex<Cache>,
    /// Scans in flight by URL: callers asking for the same URL meanwhile share the one result.
    inflight: Inflight,
    /// Each site's latest verdict, by host, for its badge.
    verdicts: std::sync::Mutex<HashMap<String, Kept>>,
    /// Each scanned URL's latest summary, for its share card and link preview after the report expires.
    summaries: std::sync::Mutex<HashMap<String, Kept>>,
    /// Rendered share cards, by what they show.
    cards: std::sync::Mutex<HashMap<String, Arc<Vec<u8>>>>,
    /// Cards render one at a time; a few more requests may wait (the rest get the generic image).
    card_turn: Mutex<()>,
    card_waiting: Semaphore,
}

/// A browser and the proxy it is locked to; both stop when the last scan using them ends (a remote
/// browser's proxy belongs to the scanner instead).
struct Session {
    browser: Browser,
    _proxy: Option<proxy::Proxy>,
}

impl Scanner {
    /// `allow_private` lets scans open localhost and private networks (local testing only).
    pub fn new(chrome: Option<PathBuf>, allow_private: bool) -> Self {
        Self::with_egress(
            chrome,
            if allow_private {
                Egress::Any
            } else {
                Egress::Public
            },
        )
    }

    pub fn with_egress(chrome: Option<PathBuf>, egress: Egress) -> Self {
        Self {
            chrome,
            remote: None,
            remote_proxy: tokio::sync::OnceCell::new(),
            egress,
            deadline: DEADLINE,
            browser: Mutex::new(None),
            slots: Semaphore::new(PARALLEL),
            places: Semaphore::new(PARALLEL + MAX_WAITING),
            cache: std::sync::Mutex::default(),
            inflight: std::sync::Mutex::default(),
            verdicts: std::sync::Mutex::default(),
            summaries: std::sync::Mutex::default(),
            cards: std::sync::Mutex::default(),
            card_turn: Mutex::new(()),
            card_waiting: Semaphore::new(CARD_WAITERS),
        }
    }

    /// Runs up to `n` scans at once (default 2).
    #[must_use]
    pub fn parallel(self, n: usize) -> Self {
        self.capacity(n, MAX_WAITING)
    }

    /// Runs up to `parallel` scans at once, with up to `waiting` more in line.
    #[must_use]
    pub fn capacity(mut self, parallel: usize, waiting: usize) -> Self {
        self.slots = Semaphore::new(parallel.max(1));
        self.places = Semaphore::new(parallel.max(1) + waiting);
        self
    }

    /// Uses a Chrome running elsewhere instead of starting one (see [`Remote`]).
    #[must_use]
    pub fn remote(mut self, remote: Remote) -> Self {
        self.remote = Some(remote);
        self
    }

    /// Overrides the per-scan deadline (tests).
    #[must_use]
    pub const fn deadline(mut self, deadline: Duration) -> Self {
        self.deadline = deadline;
        self
    }

    /// Scans `raw`: a recent report of the same URL is reused, and callers asking for a URL that is
    /// being scanned share that scan.
    pub async fn scan(&self, raw: &str) -> Result<Report, ScanError> {
        let url = parse_url(raw)?;
        self.check(&url).await?;
        let key = url.as_str().to_owned();
        if let Some(report) = self.cached(&key) {
            return Ok(report);
        }
        let caller = Caller::join(&self.inflight, key.clone());
        caller
            .cell
            .get_or_init(|| async {
                let result = self.scan_now(url).await;
                if let Ok(report) = &result {
                    self.remember(key, report.clone());
                }
                result
            })
            .await
            .clone()
    }

    /// URLs being scanned right now (tests).
    pub fn in_flight(&self) -> usize {
        lock(&self.inflight).len()
    }

    fn cached(&self, key: &str) -> Option<Report> {
        lock(&self.cache).get(key)
    }

    /// A report of `raw` from the last few minutes, without scanning: what a shared link shows.
    pub fn recent(&self, raw: &str) -> Option<Report> {
        self.cached(parse_url(raw).ok()?.as_str())
    }

    /// The latest verdict for `host` (without `www.`), if it was scanned this week.
    pub fn verdict_for(&self, host: &str) -> Option<Verdict> {
        self.kept(host).map(|k| k.verdict)
    }

    /// What the latest scan of the URL `raw` found, if it was scanned this week: what its share card and
    /// link preview show once the report itself has left the cache (per URL: another page of the same site
    /// is another scan).
    pub fn latest(&self, raw: &str) -> Option<Kept> {
        let key = parse_url(raw).ok()?;
        let summaries = lock(&self.summaries);
        let kept = summaries.get(key.as_str())?;
        (kept.at.elapsed() < VERDICT_FOR).then(|| kept.clone())
    }

    fn kept(&self, host: &str) -> Option<Kept> {
        let host = host
            .strip_prefix("www.")
            .unwrap_or(host)
            .to_ascii_lowercase();
        let verdicts = lock(&self.verdicts);
        let kept = verdicts.get(&host)?;
        (kept.at.elapsed() < VERDICT_FOR).then(|| kept.clone())
    }

    fn remember(&self, key: String, report: Report) {
        {
            let mut verdicts = lock(&self.verdicts);
            if verdicts.len() >= VERDICTS_MAX {
                verdicts.retain(|_, k| k.at.elapsed() < VERDICT_FOR);
                if verdicts.len() >= VERDICTS_MAX {
                    verdicts.clear();
                }
            }
            let s = crate::card::Summary::of(&report);
            let kept = Kept {
                host: s.host.to_owned(),
                verdict: s.verdict,
                tools: s.tools,
                page_tokens: s.page_tokens,
                score: s.score,
                lint_errors: s.lint_errors,
                scanned_on: s.scanned_on.to_owned(),
                at: Instant::now(),
            };
            for url in [report.url.as_str(), report.final_url.as_str()] {
                let host = crate::card::host_of(url).to_ascii_lowercase();
                verdicts.insert(host, kept.clone());
            }
            let mut summaries = lock(&self.summaries);
            if summaries.len() >= VERDICTS_MAX {
                summaries.retain(|_, k| k.at.elapsed() < VERDICT_FOR);
                if summaries.len() >= VERDICTS_MAX {
                    summaries.clear();
                }
            }
            summaries.insert(key.clone(), kept);
        }
        lock(&self.cache).put(key, report, CACHE_BYTES);
    }

    /// A browser and a new tab in it, within the deadline: a Chrome that accepts connections but never
    /// answers must not hold the browser lock (and every slot) forever. On failure the browser is
    /// unusable (crashed, killed, stuck) and a fresh one starts next time.
    async fn open_page(
        &self,
        scripts: &[&str],
        within: Duration,
    ) -> Result<(Arc<Session>, Page), ScanError> {
        let opened = tokio::time::timeout(within, async {
            let browser = self.browser().await.map_err(failed)?;
            let page = browser.browser.page(scripts).await.map_err(failed)?;
            Ok::<_, ScanError>((browser, page))
        })
        .await;
        match opened {
            Ok(Ok(opened)) => Ok(opened),
            failure => {
                self.browser.lock().await.take();
                Err(match failure {
                    Ok(Err(e)) => e,
                    _ => ScanError::TimedOut,
                })
            }
        }
    }

    /// The share card (1200×630 PNG) for a report, rendered by the scan browser and kept.
    pub async fn card(&self, report: &Report) -> Result<Arc<Vec<u8>>, ScanError> {
        self.card_of(crate::card::Summary::of(report), crate::card::Format::Link)
            .await
    }

    /// The share card for what a scan found (a report's summary, or a site's [`Kept`] one).
    pub async fn card_of(
        &self,
        summary: crate::card::Summary<'_>,
        format: crate::card::Format,
    ) -> Result<Arc<Vec<u8>>, ScanError> {
        let key = format!("{format:?} {summary:?}");
        if let Some(png) = lock(&self.cards).get(&key) {
            return Ok(Arc::clone(png));
        }
        // Bounded: a burst of requests for an unrendered card waits in a short line, renders once.
        let _waiting = self
            .card_waiting
            .try_acquire()
            .map_err(|_| ScanError::Busy)?;
        let _turn = tokio::time::timeout(QUEUE_WAIT, self.card_turn.lock())
            .await
            .map_err(|_| ScanError::Busy)?;
        if let Some(png) = lock(&self.cards).get(&key) {
            return Ok(Arc::clone(png));
        }
        self.render(&key, &crate::card::html(summary, format), format)
            .await
    }

    /// Renders `html` as a 1200×630 PNG with the scan browser, kept under `key`.
    async fn render(
        &self,
        key: &str,
        html: &str,
        format: crate::card::Format,
    ) -> Result<Arc<Vec<u8>>, ScanError> {
        let (width, height, scale) = format.size();
        let _slot = tokio::time::timeout(QUEUE_WAIT, self.slots.acquire())
            .await
            .map_err(|_| ScanError::Busy)?
            .map_err(|_| ScanError::Busy)?;
        let (_browser, page) = self.open_page(&[], self.deadline).await?;
        let png =
            tokio::time::timeout(CLOSE_WAIT, page.render_png(html, width, height, scale)).await;
        let _ = tokio::time::timeout(CLOSE_WAIT, page.close()).await;
        let png = Arc::new(png.map_err(|_| ScanError::TimedOut)?.map_err(failed)?);
        let mut cards = lock(&self.cards);
        if cards.len() >= CARDS_MAX {
            cards.clear();
        }
        cards.insert(key.to_owned(), Arc::clone(&png));
        Ok(png)
    }

    /// The site's generic preview image (see [`crate::card::generic_html`]).
    pub async fn generic_card(&self) -> Result<Arc<Vec<u8>>, ScanError> {
        self.render(
            "generic",
            &crate::card::generic_html(),
            crate::card::Format::Link,
        )
        .await
    }

    /// Renders any card HTML (the build-time benchmark cards), cached under its own text.
    pub async fn render_html(&self, html: &str) -> Result<Arc<Vec<u8>>, ScanError> {
        self.render(html, html, crate::card::Format::Link).await
    }

    /// One browser visit, after waiting in line for a slot.
    async fn scan_now(&self, url: Url) -> Result<Report, ScanError> {
        let _place = self.places.try_acquire().map_err(|_| ScanError::Busy)?;
        let _slot = tokio::time::timeout(QUEUE_WAIT, self.slots.acquire())
            .await
            .map_err(|_| ScanError::Busy)?
            .map_err(|_| ScanError::Busy)?;
        let started = Instant::now();
        // One deadline for the whole scan, browser and tab included; best-effort steps inside get what is
        // left of it (see `inspect`).
        let until = started + self.deadline;
        let left = || until.saturating_duration_since(Instant::now());
        // The browser is held until this scan is done: another scan's recovery (taking the shared slot)
        // must not drop it while this page still runs.
        let (_browser, page) = self.open_page(&INIT_SCRIPTS, left()).await?;
        let outcome = tokio::time::timeout(left(), self.inspect(&page, &url, until)).await;
        // Always close, also after a timeout: a page left running (say, an endless script) would keep
        // using CPU and memory after its slot is released. A browser that cannot close it is replaced.
        if !matches!(
            tokio::time::timeout(CLOSE_WAIT, page.close()).await,
            Ok(Ok(()))
        ) {
            self.browser.lock().await.take();
        }
        let mut report = outcome.map_err(|_| ScanError::TimedOut)??;
        report.elapsed_ms = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
        Ok(report)
    }

    /// Isolated contexts still open in the current browser (0 when none is running).
    pub async fn open_contexts(&self) -> Result<usize> {
        let browser = self.browser.lock().await.clone();
        match browser {
            Some(s) => s.browser.open_contexts().await,
            None => Ok(0),
        }
    }

    async fn check(&self, url: &Url) -> Result<(), ScanError> {
        let host = url.host_str().unwrap_or_default();
        let port = url.port_or_known_default().unwrap_or(443);
        // Bounded: a resolver that never answers must not hold the visitor's place outside any deadline.
        match tokio::time::timeout(RESOLVE_WAIT, self.egress.resolve(host, port)).await {
            Ok(resolved) => resolved
                .map(drop)
                .map_err(|e| ScanError::BadUrl(format!("{e:#}"))),
            Err(_) => Err(ScanError::BadUrl(format!(
                "{host} took too long to resolve"
            ))),
        }
    }

    async fn browser(&self) -> Result<Arc<Session>> {
        let mut slot = self.browser.lock().await;
        if let Some(b) = slot.as_ref() {
            return Ok(Arc::clone(b));
        }
        if let Some(remote) = &self.remote {
            let host = endpoint_host(&remote.chrome);
            self.remote_proxy
                .get_or_try_init(|| {
                    proxy::spawn_on(self.egress.clone(), remote.proxy, host.to_owned())
                })
                .await?;
            let session = Arc::new(Session {
                browser: Browser::connect(&remote.chrome).await?,
                _proxy: None,
            });
            *slot = Some(Arc::clone(&session));
            return Ok(session);
        }
        let proxy = proxy::spawn(self.egress.clone()).await?;
        let args = [
            format!("--proxy-server=http://{}", proxy.addr),
            // Send loopback through the proxy too (Chrome bypasses it by default).
            "--proxy-bypass-list=<-loopback>".to_owned(),
            "--force-webrtc-ip-handling-policy=disable_non_proxied_udp".to_owned(),
            "--disable-quic".to_owned(),
        ];
        let browser = Browser::launch_with(self.chrome.as_deref(), &args).await?;
        let session = Arc::new(Session {
            browser,
            _proxy: Some(proxy),
        });
        *slot = Some(Arc::clone(&session));
        Ok(session)
    }

    /// Reads the page into a report. The best-effort steps (icon, agent checks) stop in time to leave
    /// `REPORT_MARGIN` before `until`, so a site that never answers them costs its score, not its report.
    async fn inspect(&self, page: &Page, url: &Url, until: Instant) -> Result<Report, ScanError> {
        let left = || until.saturating_duration_since(Instant::now() + REPORT_MARGIN);
        page.goto(url.as_str()).await.map_err(failed)?;
        // Everything read from the page is bounded inside Chrome: the CDP connection is shared by every
        // scan, and a message past its size limit would end it for all of them. Reads run in an isolated
        // world, where the page's scripts can't redefine `slice` or the getters.
        let final_url = page
            .eval_isolated("location.href.slice(0, 4096)")
            .await
            .map_err(failed)?;
        let final_url = final_url.as_str().unwrap_or(url.as_str()).to_owned();
        // A refused redirect leaves Chrome on an error page for that URL: say why.
        self.check(&parse_url(&final_url)?).await?;
        let tools = registered_tools(page, TOOL_WAIT).await.map_err(failed)?;
        // Only the snapshot's size travels: that is all the token estimate needs. It is read from the
        // page's world (the snapshot script lives there), so it is forced to a number there.
        let snapshot_chars = page
            // A throw is caught here: its message, page-made, could be megabytes.
            .eval(
                "(() => { try { return +__bench.snapshot().length || 0; } catch { return 0; } })()",
            )
            .await
            .map_err(failed)?;
        let title = page
            .eval_isolated("document.title.slice(0, 300)")
            .await
            .map_err(failed)?;
        // The agent checks run last, from the site's robots.txt with CSP bypassed (the page's CSP would block
        // their fetches): the one thing read from the page itself, a Markdown alternate link, comes first.
        // Best effort and bounded: a site that answers none of them still gets its report, scored without.
        let markdown_link = page
            .eval_isolated(
                r#"!!document.querySelector('link[rel~="alternate" i][type="text/markdown" i]')"#,
            )
            .await
            .ok()
            .and_then(|v| v.as_bool())
            .unwrap_or(false);
        // Best effort: a site without a readable icon still gets its report. Read from the page itself,
        // before the agent checks move this tab to robots.txt.
        let favicon =
            tokio::time::timeout(FAVICON_WAIT.min(left()), page.eval_isolated(FAVICON_JS))
                .await
                .ok()
                .and_then(Result::ok)
                .and_then(|v| v.as_str().map(str::to_owned))
                .filter(|uri| is_icon_data_uri(uri));
        let mut checks =
            tokio::time::timeout(CHECKS_WAIT.min(left()), agent_checks(page, &final_url))
                .await
                .ok()
                .and_then(Result::ok)
                .unwrap_or_default();
        checks.markdown |= markdown_link;
        let mut report = report(
            url.as_str(),
            final_url,
            title.as_str().unwrap_or_default(),
            &tools,
            usize::try_from(snapshot_chars.as_u64().unwrap_or(0)).unwrap_or(usize::MAX),
            &checks,
        );
        report.favicon = favicon;
        Ok(report)
    }
}

/// The host of a `host:port` endpoint, without the brackets of an IPv6 address (`[::1]:9222` → `::1`).
fn endpoint_host(endpoint: &str) -> &str {
    let host = endpoint.rsplit_once(':').map_or(endpoint, |(h, _)| h);
    host.strip_prefix('[')
        .and_then(|h| h.strip_suffix(']'))
        .unwrap_or(host)
}

/// One caller of a shared scan. Callers are counted under the map's lock; the last to leave, finished or
/// cancelled (a closed tab), removes the entry, so abandoned scans never pile up.
struct Caller<'a> {
    inflight: &'a Inflight,
    key: String,
    cell: SharedScan,
}

impl<'a> Caller<'a> {
    fn join(inflight: &'a Inflight, key: String) -> Self {
        let mut map = lock(inflight);
        let (cell, callers) = map.entry(key.clone()).or_default();
        *callers += 1;
        let cell = Arc::clone(cell);
        Self {
            inflight,
            key,
            cell,
        }
    }
}

impl Drop for Caller<'_> {
    fn drop(&mut self) {
        let mut map = lock(self.inflight);
        if let Some((cell, callers)) = map.get_mut(&self.key)
            && Arc::ptr_eq(cell, &self.cell)
        {
            *callers -= 1;
            if *callers == 0 {
                map.remove(&self.key);
            }
        }
    }
}

/// Recent reports by URL, within a memory budget (sizes as JSON).
#[derive(Default)]
struct Cache {
    entries: HashMap<String, (Instant, usize, Report)>,
    bytes: usize,
}

impl Cache {
    /// The report kept for `key`, marked as cached, while it is fresh.
    fn get(&self, key: &str) -> Option<Report> {
        let (at, _, report) = self.entries.get(key)?;
        let age = at.elapsed();
        let left = CACHE_FOR.checked_sub(age).filter(|d| !d.is_zero())?;
        let mut report = report.clone();
        report.cached = Some(Cached {
            age_s: age.as_secs(),
            // Rounded up: a copy that lives 0.4 s more is still "1 s".
            expires_in_s: left.as_secs() + u64::from(left.subsec_nanos() > 0),
        });
        Some(report)
    }

    /// Keeps `report` unless it is too big; drops expired entries, then the oldest, to stay in `budget`.
    fn put(&mut self, key: String, report: Report, budget: usize) {
        let size = serde_json::to_vec(&report).map_or(usize::MAX, |v| v.len() + key.len());
        if size > CACHE_ENTRY_MAX.min(budget) {
            return;
        }
        if let Some((_, old, _)) = self.entries.remove(&key) {
            self.bytes -= old;
        }
        self.entries
            .retain(|_, (at, _, _)| at.elapsed() < CACHE_FOR);
        self.bytes = self.entries.values().map(|(_, n, _)| n).sum();
        while self.bytes + size > budget {
            let Some(oldest) = self
                .entries
                .iter()
                .min_by_key(|(_, (at, _, _))| *at)
                .map(|(k, _)| k.clone())
            else {
                break;
            };
            if let Some((_, n, _)) = self.entries.remove(&oldest) {
                self.bytes -= n;
            }
        }
        self.bytes += size;
        self.entries.insert(key, (Instant::now(), size, report));
    }
}

fn lock<T>(m: &std::sync::Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    // No code panics while holding these locks; recover the data if one ever does.
    m.lock().unwrap_or_else(std::sync::PoisonError::into_inner)
}

#[expect(clippy::needless_pass_by_value, reason = "used as `map_err(failed)`")]
fn failed(e: anyhow::Error) -> ScanError {
    ScanError::Failed(format!("{e:#}"))
}

/// Reads the page's declared icon (else `/favicon.ico`) as a data URI. Bounded on both ends: the request is
/// aborted after `FAVICON_WAIT` in the page, and the body is read in chunks and dropped (with the request
/// aborted) as soon as it passes 64 KiB, so a slow or endless icon never costs more than that.
const FAVICON_JS: &str = r#"(async () => {
  const link = document.querySelector('link[rel~="icon" i], link[rel="apple-touch-icon" i]');
  const href = link?.href || new URL('/favicon.ico', location.origin).href;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    const res = await fetch(href, { credentials: 'omit', signal: ctrl.signal });
    if (!res.ok || !res.body) return null;
    const type = (res.headers.get('content-type') || '').split(';')[0];
    const reader = res.body.getReader();
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) {
        ctrl.abort();
        return null;
      }
      chunks.push(value);
    }
    const blob = new Blob(chunks, { type });
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
})()"#;

/// Reads the agent basics from the scanned site, same-origin, in the isolated world (the page's scripts
/// can't change `fetch` there), through the scan browser and its egress proxy like every other request.
/// Each request is aborted after 3 s and its body dropped past 64 KiB. Only booleans come back.
const AGENT_CHECKS_JS: &str = r#"(async () => {
  const get = async (path, init = {}) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    try {
      const res = await fetch(new URL(path, location.origin).href, { credentials: 'omit', signal: ctrl.signal, ...init });
      const out = { status: res.status, ok: res.ok, type: (res.headers.get('content-type') || '').toLowerCase(), link: res.headers.get('link') || '', text: '', cut: false };
      if (res.ok && init.method !== 'HEAD' && res.body) {
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let size = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          out.text += dec.decode(value, { stream: true });
          if (size > 65536) { out.cut = true; ctrl.abort(); break; }
        }
      }
      return out;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };
  const [robots, llms, sitemap, md, head, skills, catalog] = await Promise.all([
    get('/robots.txt'),
    get('/llms.txt'),
    get('/sitemap.xml'),
    get(PAGE, { headers: { accept: 'text/markdown' } }),
    get(PAGE, { method: 'HEAD' }),
    get('/.well-known/agent-skills/index.json'),
    get('/.well-known/api-catalog'),
  ]);
  const good = (r) => !!r && r.ok;
  const html = (r) => r.type.includes('text/html');
  // robots.txt (RFC 9309): a 4xx means no rules (all allowed); a 5xx or no answer means we can't tell.
  // A robots.txt cut at 64 KiB may hide a ban past the cut: unknown, so no points.
  const robotsRead = good(robots) && !html(robots) && !robots.cut;
  const robotsText = robotsRead ? robots.text : '';
  const groups = [];
  let group = null;
  for (const raw of robotsText.split(/\r?\n/)) {
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(raw.replace(/#.*/, '').trim());
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      // A user-agent line after any rule (an empty `Disallow:` included) starts a new group.
      if (!group || group.closed) groups.push((group = { agents: [], rules: [], closed: false }));
      group.agents.push(value.toLowerCase());
    } else if (group && (key === 'allow' || key === 'disallow')) {
      group.closed = true;
      if (value) group.rules.push({ allow: key === 'allow', pattern: value });
    }
  }
  const matches = (pattern, path) => {
    const anchored = pattern.endsWith('$');
    const body = (anchored ? pattern.slice(0, -1) : pattern).split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    return new RegExp('^' + body + (anchored ? '$' : '')).test(path);
  };
  // Can this agent fetch the home page? Its own group, else `*`; the longest matching rule wins, Allow on ties.
  const blocked = (agent) => {
    const own = groups.filter((g) => g.agents.includes(agent));
    const rules = (own.length ? own : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
    let best = null;
    for (const r of rules) {
      if (!matches(r.pattern, '/')) continue;
      if (!best || r.pattern.length > best.pattern.length || (r.pattern.length === best.pattern.length && r.allow)) best = r;
    }
    return !!best && !best.allow;
  };
  const AI = ['*', 'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-user', 'claude-searchbot', 'anthropic-ai', 'perplexitybot', 'perplexity-user', 'google-extended', 'ccbot', 'meta-externalagent', 'applebot-extended'];
  const robotsMissing = !!robots && robots.status >= 400 && robots.status < 500;
  return {
    llms_txt: good(llms) && !html(llms) && llms.text.trim().length > 0,
    markdown: good(md) && md.type.includes('markdown'),
    robots_allows_agents: robotsMissing || (robotsRead && !AI.some(blocked)),
    sitemap: (good(sitemap) && /<(urlset|sitemapindex)\b/i.test(sitemap.text)) || /^\s*sitemap\s*:/im.test(robotsText),
    link_headers: good(head) && /rel\s*=/i.test(head.link),
    agent_skills: good(skills) && /"skills"\s*:\s*\[/.test(skills.text),
    api_catalog: good(catalog) && /"linkset"\s*:\s*\[/.test(catalog.text),
  };
})()"#;

/// Longest the scan spends on the agent checks: loading robots.txt, then the probes (each also aborts
/// itself after 3 s).
const CHECKS_WAIT: Duration = Duration::from_secs(10);

/// Runs `AGENT_CHECKS_JS` from the scanned site's own robots.txt (else the page), CSP bypassed, so the probes are
/// same-origin whatever the page's policy; requests still go through the scan browser's egress proxy.
async fn agent_checks(page: &Page, final_url: &str) -> anyhow::Result<Checks> {
    let url = Url::parse(final_url)?;
    let path = format!(
        "{}{}",
        url.path(),
        url.query().map(|q| format!("?{q}")).unwrap_or_default()
    );
    page.bypass_csp().await?;
    // A robots.txt Chrome won't show (a 404 with no body fails the navigation) or shows its own error page
    // for is not on the site's origin: run from the page itself instead, reloaded with CSP bypassed.
    let origin = url.origin().ascii_serialization();
    let landed = page.goto(url.join("/robots.txt")?.as_str()).await.is_ok()
        && page
            .eval_isolated("location.origin")
            .await
            .is_ok_and(|here| here.as_str() == Some(origin.as_str()));
    if !landed {
        page.goto(url.as_str()).await?;
    }
    let script = format!(
        "{}{AGENT_CHECKS_JS}",
        format_args!("const PAGE = {};\n", serde_json::to_string(&path)?)
    );
    Ok(checks_from(&page.eval_isolated(&script).await?))
}

/// The checks from what `AGENT_CHECKS_JS` returned: only `true` counts.
fn checks_from(v: &Value) -> Checks {
    let on = |k: &str| v[k].as_bool() == Some(true);
    Checks {
        llms_txt: on("llms_txt"),
        markdown: on("markdown"),
        robots_allows_agents: on("robots_allows_agents"),
        sitemap: on("sitemap"),
        link_headers: on("link_headers"),
        agent_skills: on("agent_skills"),
        api_catalog: on("api_catalog"),
    }
}

/// Longest the scan waits for the icon, on top of the page's own 3 s abort; then the report goes out
/// without one.
const FAVICON_WAIT: Duration = Duration::from_secs(5);

/// Largest icon accepted, as a data URI (base64 of 64 KiB, plus the header).
const MAX_ICON_URI: usize = 90_000;

/// Only small raster or SVG images: `<img>` never runs scripts, but anything else is dropped.
pub fn is_icon_data_uri(uri: &str) -> bool {
    const TYPES: [&str; 7] = [
        "data:image/png;",
        "data:image/x-icon;",
        "data:image/vnd.microsoft.icon;",
        "data:image/svg+xml;",
        "data:image/jpeg;",
        "data:image/webp;",
        "data:image/gif;",
    ];
    uri.len() <= MAX_ICON_URI && TYPES.iter().any(|t| uri.starts_with(t))
}

/// Builds the report from what the page exposed. Pure, so it is tested without a browser.
pub fn report(
    url: &str,
    final_url: String,
    title: &str,
    tools: &[Value],
    snapshot_chars: usize,
    checks: &Checks,
) -> Report {
    let diagnostics = lint(tools);
    let has_tools = !tools.is_empty();
    // Each tool says what it does to the page: read only, consequential or destructive.
    let annotated = tools.iter().all(|t| {
        t["annotations"].as_object().is_some_and(|a| {
            ["readOnlyHint", "consequentialHint", "destructiveHint"]
                .iter()
                .any(|k| a.get(*k).is_some_and(Value::is_boolean))
        })
    });
    let mut tools: Vec<Tool> = tools
        .iter()
        .map(|t| Tool {
            name: t["name"].as_str().unwrap_or_default().to_owned(),
            description: t["description"].as_str().unwrap_or_default().to_owned(),
            params: t["inputSchema"]["properties"]
                .as_object()
                .map(|p| p.keys().cloned().collect())
                .unwrap_or_default(),
            read_only: t["annotations"]["readOnlyHint"].as_bool(),
        })
        .collect();
    tools.sort_by(|a, b| a.name.cmp(&b.name));
    let page_tokens = snapshot_chars.div_ceil(CHARS_PER_TOKEN);
    let score_items = score(&tools, &diagnostics, page_tokens, annotated, checks);
    let total = score_items.iter().map(|i| u32::from(i.points)).sum::<u32>();
    let total = u8::try_from(total.min(100)).unwrap_or(100);
    let verdict = if !has_tools {
        Verdict::Missing
    } else if diagnostics.iter().any(|d| d.severity == "error") || total < READY_SCORE {
        Verdict::Issues
    } else {
        Verdict::Ready
    };
    Report {
        url: url.to_owned(),
        final_url,
        title: title.trim().to_owned(),
        verdict,
        tools,
        diagnostics,
        page_tokens,
        score: total,
        score_items,
        favicon: None,
        elapsed_ms: 0,
        scanned_on: today(),
        cached: None,
    }
}

/// Runs `webmcpx lint` over the registered tools, as a manifest. Rules that only make sense for source
/// code still apply to what the page actually registered.
fn lint(tools: &[Value]) -> Vec<Finding> {
    if tools.is_empty() {
        return Vec::new();
    }
    // The host reports a schema it could not read or send (`schemaError`): an error, as an invalid one is.
    let unread = tools.iter().filter_map(|t| {
        let why = t["schemaError"].as_str()?;
        Some(Finding {
            rule: "invalid-input-schema",
            severity: "error",
            message: format!("{}: {why}", t["name"].as_str().unwrap_or("a tool")),
        })
    });
    let unread: Vec<Finding> = unread.collect();
    // Each document (the page, each same-origin frame) is its own set of tools: the same name in two of
    // them is not a duplicate, but every definition is checked.
    let mut documents: Vec<(String, Vec<Value>)> = Vec::new();
    for t in tools {
        let doc = t["document"].as_str().unwrap_or("0").to_owned();
        let mut t = t.clone();
        if let Some(o) = t.as_object_mut() {
            o.remove("schemaError");
            o.remove("document");
        }
        match documents.iter_mut().find(|(d, _)| *d == doc) {
            Some((_, list)) => list.push(t),
            None => documents.push((doc, vec![t])),
        }
    }
    let mut findings: Vec<Finding> = Vec::new();
    for (_, list) in &documents {
        let manifest = serde_json::to_string_pretty(&json!({ "tools": list })).unwrap_or_default();
        let report = webmcpx_lint::lint(
            std::path::Path::new("page.webmcp.json"),
            &manifest,
            &webmcpx_lint::Options::default(),
        );
        findings.extend(report.diagnostics.into_iter().map(|d| Finding {
            rule: d.rule,
            severity: d.severity.as_str(),
            message: d.message,
        }));
    }
    findings.extend(unread);
    findings
}

fn parse_url(raw: &str) -> Result<Url, ScanError> {
    let raw = raw.trim();
    // People paste bare hosts: "example.com".
    let with_scheme = if raw.contains("://") {
        raw.to_owned()
    } else {
        format!("https://{raw}")
    };
    let url = Url::parse(&with_scheme).map_err(|e| ScanError::BadUrl(format!("not a URL: {e}")))?;
    if !matches!(url.scheme(), "http" | "https") {
        return Err(ScanError::BadUrl(
            "only http and https URLs can be scanned".into(),
        ));
    }
    if url.host_str().is_none_or(str::is_empty) {
        return Err(ScanError::BadUrl("the URL has no host".into()));
    }
    Ok(url)
}

/// Whether `ip` is a public internet address (not loopback, private, link-local, reserved, ...).
pub fn is_public(ip: std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(v4) => {
            let [a, b, ..] = v4.octets();
            !(v4.is_private()
                || v4.is_loopback()
                || v4.is_link_local()
                || v4.is_unspecified()
                || v4.is_broadcast()
                || v4.is_documentation()
                || v4.is_multicast()
                || a == 0
                || (a == 100 && (64..128).contains(&b)) // shared address space (CGNAT)
                || (a == 198 && (b == 18 || b == 19)) // benchmarking
                || a >= 240) // reserved
        }
        std::net::IpAddr::V6(v6) => {
            if let Some(v4) = v6.to_ipv4_mapped() {
                return is_public(std::net::IpAddr::V4(v4));
            }
            let first = v6.segments()[0];
            !(v6.is_loopback()
                || v6.is_unspecified()
                || v6.is_multicast()
                || (first & 0xfe00) == 0xfc00 // unique local
                || (first & 0xffc0) == 0xfe80 // link local
                || first == 0x2001 && v6.segments()[1] == 0x0db8) // documentation
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tool(name: &str, description: &str, annotations: &Value) -> Value {
        json!({
            "name": name,
            "description": description,
            "inputSchema": { "type": "object", "properties": { "query": { "type": "string", "description": "Words to find." } } },
            "annotations": annotations,
        })
    }

    #[test]
    fn no_tools_means_missing() {
        let r = report(
            "https://a.example",
            "https://a.example/".into(),
            " A ",
            &[],
            "abcdefgh".len(),
            &Checks::default(),
        );
        assert_eq!(r.verdict, Verdict::Missing);
        assert_eq!(r.page_tokens, 2);
        assert_eq!(r.title, "A");
        assert!(r.diagnostics.is_empty());
    }

    #[test]
    fn clean_tools_are_ready() {
        let tools = [tool(
            "search_page",
            "Find passages on the current page that match a query.",
            &json!({ "readOnlyHint": true, "untrustedContentHint": true }),
        )];
        // Clean tools plus the basics (robots.txt and a sitemap): 75, agent-ready.
        let basics = Checks {
            robots_allows_agents: true,
            sitemap: true,
            ..Checks::default()
        };
        let r = report("u", "u".into(), "t", &tools, 0, &basics);
        assert_eq!(r.verdict, Verdict::Ready, "{:?}", r.diagnostics);
        assert_eq!(r.score, 75);
        assert_eq!(r.tools[0].params, ["query"]);
        assert_eq!(r.tools[0].read_only, Some(true));
    }

    #[test]
    fn a_schema_the_host_could_not_read_is_an_error() {
        let mut t = tool("search", "Find a product.", &json!({ "type": "object" }));
        t["schemaError"] = json!("the input schema is over 50,000 chars");
        let r = report("u", "u".into(), "t", &[t], 0, &Checks::default());
        assert_eq!(r.verdict, Verdict::Issues);
        assert!(
            r.diagnostics
                .iter()
                .any(|d| d.rule == "invalid-input-schema" && d.message.contains("50,000"))
        );
    }

    #[test]
    fn lint_errors_mean_issues() {
        let tools = [tool("Search Products", "", &json!({}))];
        let r = report("u", "u".into(), "t", &tools, 0, &Checks::default());
        assert_eq!(r.verdict, Verdict::Issues);
        let rules: Vec<_> = r.diagnostics.iter().map(|d| d.rule).collect();
        assert!(rules.contains(&"invalid-name"), "{rules:?}");
        assert!(rules.contains(&"missing-description"), "{rules:?}");
    }

    #[test]
    fn clean_tools_without_the_agent_basics_are_almost() {
        let tools = [tool(
            "search_page",
            "Find passages on the current page that match a query.",
            &json!({ "readOnlyHint": true }),
        )];
        let r = report("u", "u".into(), "t", &tools, 0, &Checks::default());
        assert_eq!(r.score, 65, "{:?}", r.score_items);
        assert_eq!(r.verdict, Verdict::Issues);
        let all = Checks {
            llms_txt: true,
            markdown: true,
            robots_allows_agents: true,
            sitemap: true,
            link_headers: true,
            agent_skills: true,
            api_catalog: true,
        };
        let r = report("u", "u".into(), "t", &tools, 0, &all);
        assert_eq!(r.score, 100);
        assert_eq!(
            r.score_items.iter().map(|i| u32::from(i.max)).sum::<u32>(),
            100
        );
    }

    #[test]
    fn without_tools_the_cost_follows_the_page_and_the_verdict_is_missing() {
        let all = Checks {
            llms_txt: true,
            sitemap: true,
            ..Checks::default()
        };
        let light = report("u", "u".into(), "t", &[], 4_000, &all);
        let heavy = report("u", "u".into(), "t", &[], 400_000, &all);
        assert_eq!(light.score, 25);
        assert_eq!(heavy.score, 10);
        assert_eq!(heavy.verdict, Verdict::Missing);
    }

    #[test]
    fn only_true_counts_in_the_checks() {
        let c = checks_from(&json!({ "llms_txt": true, "sitemap": "yes", "markdown": 1 }));
        assert!(c.llms_txt && !c.sitemap && !c.markdown);
    }

    #[test]
    fn only_small_image_data_uris_are_icons() {
        assert!(is_icon_data_uri("data:image/png;base64,iVBORw0KGgo="));
        assert!(is_icon_data_uri("data:image/svg+xml;base64,PHN2Zz4="));
        assert!(!is_icon_data_uri("data:text/html;base64,PHNjcmlwdD4="));
        assert!(!is_icon_data_uri("https://example.com/favicon.ico"));
        assert!(!is_icon_data_uri(&format!(
            "data:image/png;base64,{}",
            "A".repeat(MAX_ICON_URI)
        )));
    }

    fn sized_report(url: &str, description_len: usize) -> Report {
        let tools = vec![tool(
            "t",
            &"x".repeat(description_len),
            &json!({ "readOnlyHint": true }),
        )];
        report(url, url.to_owned(), "", &tools, 0, &Checks::default())
    }

    /// After the report leaves the cache, its site's card still shows that scan (not the generic image).
    #[test]
    fn a_site_keeps_its_summary_after_the_report_expires() {
        let scanner = Scanner::new(None, false);
        let docs = sized_report("https://a.example/docs", 10);
        // Another page of the same site, scanned later, with a different result.
        let mut login = sized_report("https://a.example/login", 10);
        login.tools.clear();
        login.score = 20;
        login.verdict = Verdict::Missing;
        scanner.remember("https://a.example/docs".into(), docs.clone());
        scanner.remember("https://a.example/login".into(), login.clone());
        lock(&scanner.cache).entries.clear();
        assert!(scanner.recent("https://a.example/docs").is_none());
        let kept = scanner
            .latest("https://a.example/docs")
            .expect("kept a week");
        assert_eq!(kept.summary(), crate::card::Summary::of(&docs));
        assert_eq!(
            scanner.latest("https://a.example/login").unwrap().summary(),
            crate::card::Summary::of(&login)
        );
        assert!(scanner.latest("https://a.example/other").is_none());
    }

    #[test]
    fn the_cache_skips_huge_reports_and_stays_in_budget() {
        let mut cache = Cache::default();
        cache.put(
            "big".into(),
            sized_report("https://a.example/", CACHE_ENTRY_MAX),
            CACHE_BYTES,
        );
        assert!(
            cache.get("big").is_none(),
            "a page-sized report must not be kept"
        );

        let budget = 64 * 1024;
        for i in 0..20 {
            cache.put(
                format!("k{i}"),
                sized_report("https://a.example/", 10_000),
                budget,
            );
            assert!(cache.bytes <= budget, "{} > {budget}", cache.bytes);
        }
        let newest = cache.get("k19").expect("the newest stays");
        let cached = newest.cached.expect("a report from the cache says so");
        assert_eq!(cached.age_s, 0);
        assert_eq!(cached.expires_in_s, CACHE_FOR.as_secs());
        assert!(cache.get("k0").is_none(), "the oldest went first");
    }

    #[test]
    fn callers_leaving_at_once_never_leave_an_entry_behind() {
        let inflight: Inflight = std::sync::Mutex::default();
        for _ in 0..200 {
            std::thread::scope(|scope| {
                for _ in 0..8 {
                    scope.spawn(|| drop(Caller::join(&inflight, "k".into())));
                }
            });
            assert!(lock(&inflight).is_empty());
        }
        // Callers that overlap share one entry until the last leaves.
        let a = Caller::join(&inflight, "k".into());
        let b = Caller::join(&inflight, "k".into());
        assert!(Arc::ptr_eq(&a.cell, &b.cell));
        drop(a);
        assert_eq!(lock(&inflight).len(), 1);
        drop(b);
        assert!(lock(&inflight).is_empty());
    }

    #[test]
    fn endpoint_hosts() {
        assert_eq!(endpoint_host("chrome:9222"), "chrome");
        assert_eq!(endpoint_host("127.0.0.1:9222"), "127.0.0.1");
        assert_eq!(endpoint_host("[::1]:9222"), "::1");
        assert_eq!(endpoint_host("chrome"), "chrome");
    }

    #[test]
    fn urls_need_http_and_a_host() {
        assert_eq!(
            parse_url("example.com").unwrap().as_str(),
            "https://example.com/"
        );
        assert!(matches!(
            parse_url("file:///etc/passwd"),
            Err(ScanError::BadUrl(_))
        ));
        assert!(matches!(
            parse_url("javascript:alert(1)"),
            Err(ScanError::BadUrl(_))
        ));
        assert!(matches!(parse_url("http://"), Err(ScanError::BadUrl(_))));
    }

    #[test]
    fn private_addresses_are_not_public() {
        for ip in [
            "127.0.0.1",
            "10.1.2.3",
            "172.16.0.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "0.0.0.0",
            "::1",
            "fd00::1",
            "fe80::1",
            "::ffff:127.0.0.1",
        ] {
            assert!(!is_public(ip.parse().unwrap()), "{ip}");
        }
        for ip in ["1.1.1.1", "93.184.216.34", "2606:4700::1111"] {
            assert!(is_public(ip.parse().unwrap()), "{ip}");
        }
    }

    #[tokio::test]
    async fn localhost_is_refused() {
        let scanner = Scanner::new(None, false);
        let url = parse_url("http://localhost:4173/").unwrap();
        assert!(matches!(
            scanner.check(&url).await,
            Err(ScanError::BadUrl(_))
        ));
    }
}
