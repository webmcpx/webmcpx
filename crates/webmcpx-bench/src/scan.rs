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
const CACHE_FOR: Duration = Duration::from_mins(10);
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
    /// The site's icon as a small `data:image/...` URI, fetched by the scan browser (through the egress
    /// proxy), so the page showing the report never requests anything from the scanned site.
    pub favicon: Option<String>,
    pub elapsed_ms: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Verdict {
    /// Registers tools and the linter finds no errors.
    Ready,
    /// Registers tools, but the linter finds errors.
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
    verdicts: std::sync::Mutex<HashMap<String, (Verdict, Instant)>>,
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
        let host = host
            .strip_prefix("www.")
            .unwrap_or(host)
            .to_ascii_lowercase();
        let verdicts = lock(&self.verdicts);
        let (verdict, at) = verdicts.get(&host)?;
        (at.elapsed() < VERDICT_FOR).then_some(*verdict)
    }

    fn remember(&self, key: String, report: Report) {
        {
            let mut verdicts = lock(&self.verdicts);
            if verdicts.len() >= VERDICTS_MAX {
                verdicts.retain(|_, (_, at)| at.elapsed() < VERDICT_FOR);
                if verdicts.len() >= VERDICTS_MAX {
                    verdicts.clear();
                }
            }
            for url in [report.url.as_str(), report.final_url.as_str()] {
                let host = crate::card::host_of(url).to_ascii_lowercase();
                verdicts.insert(host, (report.verdict, Instant::now()));
            }
        }
        lock(&self.cache).put(key, report, CACHE_BYTES);
    }

    /// The share card (1200×630 PNG) for a report, rendered by the scan browser and kept.
    pub async fn card(&self, report: &Report) -> Result<Arc<Vec<u8>>, ScanError> {
        let summary = crate::card::Summary::of(report);
        let key = format!("{summary:?}");
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
        self.render(&key, &crate::card::html(summary)).await
    }

    /// Renders `html` as a 1200×630 PNG with the scan browser, kept under `key`.
    async fn render(&self, key: &str, html: &str) -> Result<Arc<Vec<u8>>, ScanError> {
        let _slot = tokio::time::timeout(QUEUE_WAIT, self.slots.acquire())
            .await
            .map_err(|_| ScanError::Busy)?
            .map_err(|_| ScanError::Busy)?;
        let browser = self.browser().await.map_err(failed)?;
        let page = browser.browser.page(&[]).await.map_err(failed)?;
        let png = tokio::time::timeout(CLOSE_WAIT, page.render_png(html, 1200, 630)).await;
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
        self.render("generic", &crate::card::generic_html()).await
    }

    /// One browser visit, after waiting in line for a slot.
    async fn scan_now(&self, url: Url) -> Result<Report, ScanError> {
        let _place = self.places.try_acquire().map_err(|_| ScanError::Busy)?;
        let _slot = tokio::time::timeout(QUEUE_WAIT, self.slots.acquire())
            .await
            .map_err(|_| ScanError::Busy)?
            .map_err(|_| ScanError::Busy)?;
        let started = Instant::now();
        let browser = self.browser().await.map_err(failed)?;
        let page = match browser.browser.page(&INIT_SCRIPTS).await {
            Ok(page) => page,
            Err(e) => {
                // The browser is unusable (crashed, killed): start a fresh one next time.
                self.browser.lock().await.take();
                return Err(failed(e));
            }
        };
        let outcome = tokio::time::timeout(self.deadline, self.inspect(&page, &url)).await;
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
        self.egress
            .resolve(host, port)
            .await
            .map(drop)
            .map_err(|e| ScanError::BadUrl(format!("{e:#}")))
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

    async fn inspect(&self, page: &Page, url: &Url) -> Result<Report, ScanError> {
        page.goto(url.as_str()).await.map_err(failed)?;
        let final_url = page.eval("location.href").await.map_err(failed)?;
        let final_url = final_url.as_str().unwrap_or(url.as_str()).to_owned();
        // A refused redirect leaves Chrome on an error page for that URL: say why.
        self.check(&parse_url(&final_url)?).await?;
        let tools = registered_tools(page, TOOL_WAIT).await.map_err(failed)?;
        let snapshot = page.eval("__bench.snapshot()").await.map_err(failed)?;
        let title = page.eval("document.title").await.map_err(failed)?;
        let mut report = report(
            url.as_str(),
            final_url,
            title.as_str().unwrap_or_default(),
            &tools,
            snapshot.as_str().unwrap_or_default(),
        );
        // Best effort: a site without a readable icon still gets its report.
        report.favicon = tokio::time::timeout(FAVICON_WAIT, page.eval(FAVICON_JS))
            .await
            .ok()
            .and_then(Result::ok)
            .and_then(|v| v.as_str().map(str::to_owned))
            .filter(|uri| is_icon_data_uri(uri));
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
    fn get(&self, key: &str) -> Option<Report> {
        let (at, _, report) = self.entries.get(key)?;
        (at.elapsed() < CACHE_FOR).then(|| report.clone())
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
    snapshot: &str,
) -> Report {
    let diagnostics = lint(tools);
    let verdict = if tools.is_empty() {
        Verdict::Missing
    } else if diagnostics.iter().any(|d| d.severity == "error") {
        Verdict::Issues
    } else {
        Verdict::Ready
    };
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
    Report {
        url: url.to_owned(),
        final_url,
        title: title.trim().to_owned(),
        verdict,
        tools,
        diagnostics,
        page_tokens: snapshot.chars().count().div_ceil(CHARS_PER_TOKEN),
        favicon: None,
        elapsed_ms: 0,
    }
}

/// Runs `webmcpx lint` over the registered tools, as a manifest. Rules that only make sense for source
/// code still apply to what the page actually registered.
fn lint(tools: &[Value]) -> Vec<Finding> {
    if tools.is_empty() {
        return Vec::new();
    }
    let manifest = serde_json::to_string_pretty(&json!({ "tools": tools })).unwrap_or_default();
    let report = webmcpx_lint::lint(
        std::path::Path::new("page.webmcp.json"),
        &manifest,
        &webmcpx_lint::Options::default(),
    );
    report
        .diagnostics
        .into_iter()
        .map(|d| Finding {
            rule: d.rule,
            severity: d.severity.as_str(),
            message: d.message,
        })
        .collect()
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
            "abcdefgh",
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
        let r = report("u", "u".into(), "t", &tools, "");
        assert_eq!(r.verdict, Verdict::Ready, "{:?}", r.diagnostics);
        assert_eq!(r.tools[0].params, ["query"]);
        assert_eq!(r.tools[0].read_only, Some(true));
    }

    #[test]
    fn lint_errors_mean_issues() {
        let tools = [tool("Search Products", "", &json!({}))];
        let r = report("u", "u".into(), "t", &tools, "");
        assert_eq!(r.verdict, Verdict::Issues);
        let rules: Vec<_> = r.diagnostics.iter().map(|d| d.rule).collect();
        assert!(rules.contains(&"invalid-name"), "{rules:?}");
        assert!(rules.contains(&"missing-description"), "{rules:?}");
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
        report(url, url.to_owned(), "", &tools, "")
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
        assert!(cache.get("k19").is_some(), "the newest stays");
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
