//! Local HTTP server (axum): the benchmark sites, the webmcpx loader they import, the built landing and
//! the scan API.
//!
//! - `/sites/<name>/`  → `bench/sites/<name>/`
//! - `/webmcpx/src/*`, `/webmcpx/dist/*`, `/webmcpx/wasm/*` → the npm package as shipped (the code under
//!   test: what npm imports resolve to, and the minified drop-in script)
//! - `/api/scan?url=`  → [`scan::Report`] as JSON (when a scanner is given)
//! - `/`               → `site/build/` (the landing, after `just site`)

use std::net::SocketAddr;
use std::path::Path;
use std::sync::Arc;

use anyhow::{Context as _, Result};
use axum::Json;
use axum::Router;
use axum::extract::{ConnectInfo, Query, State};
use axum::http::HeaderMap;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use serde::Deserialize;
use serde_json::json;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

use crate::scan::{ScanError, Scanner};
use crate::visitors::{Refused, Visitors};

/// What `/api/scan` needs: the scanner, and per-visitor limits when the scanner is public.
#[derive(Clone)]
struct ScanState {
    scanner: Arc<Scanner>,
    visitors: Option<Arc<Visitors>>,
    /// The built site (`site/build`).
    site: Arc<std::path::PathBuf>,
}

pub fn router(root: &Path, scanner: Option<Arc<Scanner>>) -> Router {
    router_with(root, scanner, None)
}

/// Like [`router`], with per-visitor scan limits (the public scanner).
pub fn router_with(
    root: &Path,
    scanner: Option<Arc<Scanner>>,
    visitors: Option<Arc<Visitors>>,
) -> Router {
    let package = root.join("packages/webmcpx");
    let site = root.join("site/build");
    let app = Router::new()
        .nest_service("/sites", ServeDir::new(root.join("bench/sites")))
        .nest_service("/webmcpx/src", ServeDir::new(package.join("src")))
        .nest_service("/webmcpx/dist", ServeDir::new(package.join("dist")))
        .nest_service("/webmcpx/wasm", ServeDir::new(package.join("wasm")));
    let Some(scanner) = scanner else {
        return app.fallback_service(ServeDir::new(site));
    };
    let state = ScanState {
        scanner,
        visitors,
        site: Arc::new(site),
    };
    let scanning = Router::new()
        .route("/api/scan", get(scan))
        .route("/og/scan.png", get(scan_card))
        .route("/badge/{file}", get(badge))
        .fallback(page)
        .with_state(state);
    app.merge(scanning)
}

/// A site page. A shared scan link (`/?scan=<url>`, any language) gets that site's preview tags, so a
/// post shows its scan card; everything else is the prerendered page as is.
async fn page(
    State(state): State<ScanState>,
    headers: HeaderMap,
    request: axum::extract::Request,
) -> Response {
    let scanned = request.uri().query().and_then(|q| {
        reqwest::Url::parse(&format!("http://x/?{q}"))
            .ok()?
            .query_pairs()
            .find(|(k, _)| k == "scan")
            .map(|(_, v)| v.into_owned())
    });
    let path = request.uri().path().to_owned();
    // A shared scan link that reads as itself (`/scan/notion.com`): on to the scan, `/?scan=<url>`.
    // Crawlers follow, and read the preview tags there.
    if let Some((home, target)) = pretty_scan(&path) {
        let query = reqwest::Url::parse_with_params("http://x/", [("scan", target.as_str())])
            .map(|u| u.query().unwrap_or_default().to_owned())
            .unwrap_or_default();
        return axum::response::Redirect::temporary(&format!("{home}?{query}")).into_response();
    }
    if let Some(target) = scanned.filter(|t| !t.is_empty())
        && path.ends_with('/')
        && !path.contains("..")
        && let Ok(html) = tokio::fs::read_to_string(
            state
                .site
                .join(path.trim_start_matches('/'))
                .join("index.html"),
        )
        .await
    {
        let origin = origin(&headers);
        let report = state.scanner.recent(&target);
        let kept = report
            .is_none()
            .then(|| state.scanner.latest(&target))
            .flatten();
        let summary = report
            .as_ref()
            .map(crate::card::Summary::of)
            .or_else(|| kept.as_ref().map(crate::scan::Kept::summary));
        return (
            [(axum::http::header::CONTENT_TYPE, "text/html; charset=utf-8")],
            share_page(&html, &origin, &target, summary, language_of(&path)),
        )
            .into_response();
    }
    // Agents that ask for Markdown (Accept: text/markdown) get a page's Markdown twin when it has one.
    let wants_markdown = headers
        .get(axum::http::header::ACCEPT)
        .and_then(|h| h.to_str().ok())
        .is_some_and(prefers_markdown);
    if wants_markdown
        && path.ends_with('/')
        && !path.contains("..")
        && let Ok(md) = tokio::fs::read_to_string(
            state
                .site
                .join(path.trim_start_matches('/'))
                .join("index.md"),
        )
        .await
    {
        return (
            [
                (
                    axum::http::header::CONTENT_TYPE,
                    "text/markdown; charset=utf-8",
                ),
                (axum::http::header::VARY, "Accept"),
            ],
            md,
        )
            .into_response();
    }
    let mut response = match ServeDir::new(state.site.as_ref()).try_call(request).await {
        Ok(response) => response.into_response(),
        // try_call hands back I/O errors: a missing file is a 404, not a server error.
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => StatusCode::NOT_FOUND.into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    // The same URL can also answer in Markdown: caches must key on Accept.
    if path.ends_with('/') {
        response.headers_mut().append(
            axum::http::header::VARY,
            axum::http::HeaderValue::from_static("Accept"),
        );
    }
    response
}

/// Whether an `Accept` header names `text/markdown` with a quality above zero and at least that of HTML
/// (`text/html`, else `text/*`, else `*/*`). Browsers never name Markdown, so they always get HTML.
fn prefers_markdown(accept: &str) -> bool {
    let mut markdown = None;
    let (mut html, mut text, mut any) = (None, None, None);
    for range in accept.split(',') {
        let mut parts = range.split(';');
        let media = parts.next().unwrap_or("").trim().to_ascii_lowercase();
        let q = parts
            .filter_map(|p| p.trim().strip_prefix("q="))
            .find_map(|q| q.trim().parse::<f32>().ok())
            .unwrap_or(1.0);
        let slot = match media.as_str() {
            "text/markdown" => &mut markdown,
            "text/html" => &mut html,
            "text/*" => &mut text,
            "*/*" => &mut any,
            _ => continue,
        };
        *slot = Some(q);
    }
    markdown.is_some_and(|md| md > 0.0 && md >= html.or(text).or(any).unwrap_or(0.0))
}

/// `https://host`, from our proxy's headers (plain `http://` locally).
fn origin(headers: &HeaderMap) -> String {
    let host = headers
        .get(axum::http::header::HOST)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("webmcpx.dev");
    let proto = headers
        .get("x-forwarded-proto")
        .and_then(|h| h.to_str().ok())
        .unwrap_or("http");
    format!("{proto}://{host}")
}

fn attr(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('"', "&quot;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

/// `/scan/<host>[/<path>]` (or `/<lang>/scan/...`): the landing to scan on and the https address. None
/// for any other path, or for an address that isn't a plain https one.
fn pretty_scan(path: &str) -> Option<(String, String)> {
    let rest = path.strip_prefix('/')?;
    let (home, rest) = match rest.split_once('/') {
        Some((lang, after))
            if lang != "en" && crate::card::LANGUAGES.iter().any(|t| t.code == lang) =>
        {
            (format!("/{lang}/"), after)
        }
        _ => ("/".to_owned(), rest),
    };
    let site = rest.strip_prefix("scan/")?;
    let url = reqwest::Url::parse(&format!("https://{site}")).ok()?;
    let plain = url.host_str().is_some_and(|h| h.contains('.'))
        && url.username().is_empty()
        && url.password().is_none()
        && url.port().is_none();
    plain.then(|| (home, url.to_string()))
}

/// The link that re-runs a scan, as the site's Share button copies it (scan.ts, `shareLink`): a plain https
/// address reads as itself (`/pt-br/scan/notion.com/docs`), anything else is `/?scan=<url>`.
fn share_link(origin: &str, home: &str, target: &str) -> String {
    match reqwest::Url::parse(target) {
        Ok(u)
            if u.scheme() == "https"
                && u.port().is_none()
                && u.username().is_empty()
                && u.password().is_none()
                && u.query().is_none()
                && u.fragment().is_none()
                && u.host_str().is_some() =>
        {
            let path = if u.path() == "/" { "" } else { u.path() };
            format!(
                "{origin}{home}scan/{}{path}",
                u.host_str().unwrap_or_default()
            )
        }
        _ => {
            let query = reqwest::Url::parse_with_params("http://x/", [("scan", target)])
                .map(|u| u.query().unwrap_or_default().to_owned())
                .unwrap_or_default();
            format!("{origin}{home}?{query}")
        }
    }
}

/// The site language of a page path: its first segment (`/pt-br/` is `pt-br`); English otherwise.
fn language_of(path: &str) -> &'static crate::card::Text {
    crate::card::Text::of(path.trim_start_matches('/').split('/').next())
}

/// The page with its `og:` and `twitter:` tags replaced by ones for the scanned site, in the page's
/// language `text` (the card image too).
pub fn share_page(
    html: &str,
    origin: &str,
    target: &str,
    summary: Option<crate::card::Summary<'_>>,
    text: &crate::card::Text,
) -> String {
    let host = crate::card::host_of(target);
    let (title, description, alt) = match summary {
        Some(s) => crate::card::share_text(s, text),
        None => (
            format!("Is {host} agent-ready?"),
            "Scan any site for WebMCP tools: see what agents get from it.".to_owned(),
            "webmcpx: make your site agent-ready.".to_owned(),
        ),
    };
    let encoded: String = reqwest::Url::parse_with_params("http://x/", [("url", target)])
        .map(|u| u.query().unwrap_or_default().to_owned())
        .unwrap_or_default();
    let image = if summary.is_some() {
        let lang = if text.code == "en" {
            String::new()
        } else {
            format!("&lang={}", text.code)
        };
        format!("{origin}/og/scan.png?{encoded}{lang}")
    } else {
        format!("{origin}/og.png")
    };
    // The page's own address (`/pt-br/?scan=`): each language is its own object for the networks' caches.
    let page = if text.code == "en" {
        "/".to_owned()
    } else {
        format!("/{}/", text.code)
    };
    let url = share_link(origin, &page, target);
    let tags = format!(
        r#"<meta property="og:type" content="website"><meta property="og:site_name" content="webmcpx"><meta property="og:title" content="{t}"><meta property="og:description" content="{d}"><meta property="og:url" content="{u}"><meta property="og:image" content="{i}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{a}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{d}"><meta name="twitter:image" content="{i}"><meta name="twitter:image:alt" content="{a}">"#,
        t = attr(&title),
        d = attr(&description),
        u = attr(&url),
        i = attr(&image),
        a = attr(&alt),
    );
    let mut out = strip_social_tags(html);
    if let Some(at) = out.find("</head>") {
        out.insert_str(at, &tags);
    }
    out
}

/// Removes `<meta property="og:...">` and `<meta name="twitter:...">` tags.
fn strip_social_tags(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(start) = rest.find("<meta ") {
        let Some(len) = rest[start..].find('>') else {
            break;
        };
        let tag = &rest[start..=start + len];
        out.push_str(&rest[..start]);
        if !(tag.contains("property=\"og:") || tag.contains("name=\"twitter:")) {
            out.push_str(tag);
        }
        rest = &rest[start + len + 1..];
    }
    out.push_str(rest);
    out
}

#[derive(Deserialize)]
struct CardQuery {
    url: String,
    /// `post`: the 1600×900 image Save PNG downloads; otherwise the 1200×630 link preview.
    size: Option<String>,
    /// The site language to write the card in (`pt-br`, `ja`, ...); English by default.
    lang: Option<String>,
}

/// The share card of a site scanned in the last minutes; the generic card otherwise.
async fn scan_card(State(state): State<ScanState>, Query(q): Query<CardQuery>) -> Response {
    // The report while it is cached, else what the site's latest scan this week found (Save PNG on a result
    // left open, a link shared later): the generic image only for a site never scanned.
    let report = state.scanner.recent(&q.url);
    let kept = report
        .is_none()
        .then(|| state.scanner.latest(&q.url))
        .flatten();
    let summary = report
        .as_ref()
        .map(crate::card::Summary::of)
        .or_else(|| kept.as_ref().map(crate::scan::Kept::summary));
    let Some(summary) = summary else {
        return axum::response::Redirect::temporary("/og.png").into_response();
    };
    let format = if q.size.as_deref() == Some("post") {
        crate::card::Format::Post
    } else {
        crate::card::Format::Link
    };
    match state
        .scanner
        .card_of(summary, format, crate::card::Text::of(q.lang.as_deref()))
        .await
    {
        Ok(png) => (
            [
                (axum::http::header::CONTENT_TYPE, "image/png"),
                (axum::http::header::CACHE_CONTROL, "public, max-age=600"),
            ],
            png.as_ref().clone(),
        )
            .into_response(),
        Err(_) => axum::response::Redirect::temporary("/og.png").into_response(),
    }
}

#[derive(Deserialize)]
struct BadgeQuery {
    style: Option<String>,
}

/// `/badge/<host>.svg[?style=card|flat|dark]`: the site's latest verdict as a README badge ("scan" until it
/// has one); an agent-ready site gets the chosen artwork.
async fn badge(
    State(state): State<ScanState>,
    axum::extract::Path(file): axum::extract::Path<String>,
    Query(q): Query<BadgeQuery>,
) -> Response {
    let Some(host) = file
        .strip_suffix(".svg")
        .filter(|h| !h.is_empty() && h.len() <= 253)
    else {
        return StatusCode::NOT_FOUND.into_response();
    };
    (
        [
            (axum::http::header::CONTENT_TYPE, "image/svg+xml"),
            (axum::http::header::CACHE_CONTROL, "public, max-age=300"),
        ],
        crate::card::badge_styled(state.scanner.verdict_for(host), q.style.as_deref()),
    )
        .into_response()
}

#[derive(Deserialize)]
struct ScanQuery {
    url: String,
}

async fn scan(
    State(state): State<ScanState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Query(q): Query<ScanQuery>,
) -> Response {
    // A recent report costs nothing: shared links and repeat visits never count against the limit, and the
    // report says it is cached and when it expires.
    if let Some(report) = state.scanner.reuse(&q.url) {
        return Json(report).into_response();
    }
    let _scanning = match &state.visitors {
        None => None,
        Some(visitors) => {
            let forwarded = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok());
            match visitors.start(visitors.address(peer.ip(), forwarded)) {
                Ok(scanning) => Some(scanning),
                Err(refused) => return too_many(&refused),
            }
        }
    };
    match state.scanner.scan(&q.url).await {
        Ok(report) => Json(report).into_response(),
        Err(e) => {
            let (status, message) = match e {
                ScanError::BadUrl(m) => (StatusCode::BAD_REQUEST, m),
                ScanError::Busy => (
                    StatusCode::TOO_MANY_REQUESTS,
                    "Too many scans right now. Try again in a minute.".to_owned(),
                ),
                ScanError::TimedOut => (
                    StatusCode::GATEWAY_TIMEOUT,
                    "The page took too long to load.".to_owned(),
                ),
                ScanError::Failed(m) => {
                    (StatusCode::UNPROCESSABLE_ENTITY, public_reason(&m, &q.url))
                }
            };
            (status, Json(json!({ "error": message }))).into_response()
        }
    }
}

/// What a failed scan tells the public: Chrome's network error code when there is one (`net::ERR_…`, which
/// helps the visitor), never the rest of the chain, which can name our browser's address or DevTools URLs.
/// The whole message goes to the server log.
#[expect(
    clippy::print_stderr,
    reason = "the server log: the container's stderr"
)]
fn public_reason(message: &str, url: &str) -> String {
    eprintln!("scan failed: {url}: {message}");
    let code = message.find("net::ERR_").map(|i| {
        message[i..]
            .chars()
            .take_while(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | ':'))
            .collect::<String>()
    });
    code.map_or_else(
        || "The page couldn't be opened or read.".to_owned(),
        |code| format!("The page couldn't be opened ({code})."),
    )
}

fn too_many(refused: &Refused) -> Response {
    match refused {
        // `code` lets the page word it in the reader's language; no Retry-After: it ends with their scan.
        Refused::Busy => (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({
                "error": "Your previous scan is still running. One scan at a time, please.",
                "code": "scan_running",
            })),
        )
            .into_response(),
    }
}

/// Binds `addr` and serves in the background. Returns the bound address (useful with port 0).
pub async fn spawn(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
) -> Result<SocketAddr> {
    spawn_with(root, addr, scanner, None).await
}

/// Like [`spawn`], with per-visitor scan limits (the public scanner).
pub async fn spawn_with(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
    visitors: Option<Arc<Visitors>>,
) -> Result<SocketAddr> {
    let (bound, _served) =
        serve_until(root, addr, scanner, visitors, std::future::pending()).await?;
    Ok(bound)
}

/// Like [`spawn_with`], until `stop` resolves: then it stops accepting and lets requests in flight (scans
/// included) finish. The handle resolves once they have.
pub async fn serve_until(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
    visitors: Option<Arc<Visitors>>,
    stop: impl Future<Output = ()> + Send + 'static,
) -> Result<(SocketAddr, tokio::task::JoinHandle<std::io::Result<()>>)> {
    let listener = TcpListener::bind(addr)
        .await
        .with_context(|| format!("binding {addr}"))?;
    let bound = listener.local_addr()?;
    let app = router_with(root, scanner, visitors);
    let served = tokio::spawn(async move {
        axum::serve(
            listener,
            app.into_make_service_with_connect_info::<SocketAddr>(),
        )
        .with_graceful_shutdown(stop)
        .await
    });
    Ok((bound, served))
}

#[cfg(test)]
mod tests {
    #[test]
    fn markdown_only_when_preferred() {
        use super::prefers_markdown as md;
        assert!(md("text/markdown"));
        assert!(md("text/markdown, text/html;q=0.9"));
        assert!(md("text/html, text/markdown"));
        assert!(!md("text/html, text/markdown;q=0"));
        assert!(!md("text/html;q=1, text/markdown;q=0.1"));
        assert!(!md("text/html,application/xhtml+xml,*/*;q=0.8"));
        assert!(md("text/markdown;q=0.9, */*;q=0.8"));
        assert!(!md(""));
    }

    use super::*;

    /// Docker kills the server after compose's `stop_grace_period`: it must outlast the longest request a
    /// stopping server waits for, or a deploy cuts queued scans off.
    #[test]
    fn compose_waits_for_the_longest_scan_on_a_deploy() {
        let compose =
            std::fs::read_to_string(crate::repo_root().join("deploy/compose.yaml")).unwrap();
        let grace = compose
            .lines()
            .find_map(|l| l.trim().strip_prefix("stop_grace_period:"))
            .and_then(|v| v.trim().strip_suffix('s')?.parse::<u64>().ok())
            .expect("stop_grace_period: <n>s in deploy/compose.yaml");
        assert!(
            grace > crate::scan::LONGEST_SCAN.as_secs(),
            "stop_grace_period {grace}s must exceed {:?}",
            crate::scan::LONGEST_SCAN
        );
    }

    #[test]
    fn a_failed_scan_tells_the_public_only_the_network_code() {
        let leaky = "navigating: Page.navigate failed on ws://chrome:9222/devtools/page/AB12: net::ERR_NAME_NOT_RESOLVED at 10.0.0.5";
        assert_eq!(
            public_reason(leaky, "https://nope.example/"),
            "The page couldn't be opened (net::ERR_NAME_NOT_RESOLVED)."
        );
        let inner =
            "reading tools: TypeError: x is undefined (ws://chrome:9222/devtools/browser/1)";
        let said = public_reason(inner, "https://a.example/");
        assert_eq!(said, "The page couldn't be opened or read.");
        assert!(!said.contains("ws://") && !said.contains("chrome"));
    }

    #[test]
    fn share_pages_replace_the_social_tags_and_escape() {
        let html = r#"<html><head><meta property="og:image" content="/og.png"><meta name="twitter:card" content="summary"><meta name="description" content="keep"></head><body></body></html>"#;
        let out = share_page(
            html,
            "https://webmcpx.dev",
            r#"https://a.example/?q="x"&y"#,
            None,
            crate::card::Text::of(None),
        );
        assert!(!out.contains(r#"content="/og.png""#), "{out}");
        assert!(out.contains(r#"<meta name="description" content="keep">"#));
        assert!(out.contains(r#"<meta property="og:image" content="https://webmcpx.dev/og.png">"#));
        assert!(out.contains("Is a.example agent-ready?"));
        assert!(out.contains("summary_large_image"));
        assert!(!out.contains(r#""x""#), "unescaped quotes: {out}");
        assert_eq!(out.matches("og:image\"").count(), 1);
    }

    /// A scan link shared from `/pt-br/` previews in Portuguese: title, description and card image.
    #[test]
    fn share_pages_speak_the_page_language() {
        let summary = crate::card::Summary {
            host: "a.example",
            verdict: crate::scan::Verdict::Missing,
            tools: 0,
            page_tokens: 324,
            score: 25,
            lint_errors: false,
            scanned_on: "2026-11-09",
        };
        let html = "<html><head></head><body></body></html>";
        let out = share_page(
            html,
            "https://webmcpx.dev",
            "https://a.example/",
            Some(summary),
            language_of("/pt-br/"),
        );
        assert!(
            out.contains("a.example · Não pronto para agentes · 25/100"),
            "{out}"
        );
        assert!(out.contains("Nota 25/100."), "{out}");
        // The text beside the image adds the bold line and the way to scan your own; the image gets alt text.
        assert!(out.contains("E o seu site? webmcpx.dev"), "{out}");
        assert!(
            out.contains(r#"twitter:image:alt" content="webmcpx · a.example"#),
            "{out}"
        );
        assert!(
            out.contains("/og/scan.png?url=https%3A%2F%2Fa.example%2F&amp;lang=pt-br"),
            "{out}"
        );
        let en = share_page(
            html,
            "https://webmcpx.dev",
            "https://a.example/",
            Some(summary),
            language_of("/"),
        );
        assert!(
            en.contains("a.example · Not agent-ready") && !en.contains("lang="),
            "{en}"
        );
        assert!(
            out.contains(r#"og:url" content="https://webmcpx.dev/pt-br/scan/a.example""#),
            "{out}"
        );
        assert!(
            en.contains(r#"og:url" content="https://webmcpx.dev/scan/a.example""#),
            "{en}"
        );
        assert_eq!(language_of("/brand/").code, "en");
    }

    /// `/scan/<site>` is the scan of that https address, in the page's language; nothing else is.
    #[test]
    fn pretty_scan_links() {
        let scan = |p: &str| pretty_scan(p);
        assert_eq!(
            scan("/scan/developers.notion.com"),
            Some(("/".to_owned(), "https://developers.notion.com/".to_owned()))
        );
        assert_eq!(
            scan("/pt-br/scan/a.example/docs/x"),
            Some(("/pt-br/".to_owned(), "https://a.example/docs/x".to_owned()))
        );
        assert_eq!(scan("/en/scan/a.example"), None);
        assert_eq!(scan("/xx/scan/a.example"), None);
        assert_eq!(scan("/scan/localhost"), None);
        assert_eq!(scan("/scan/u@a.example"), None);
        assert_eq!(scan("/scan/a.example:8443"), None);
        assert_eq!(scan("/scan/"), None);
        assert_eq!(scan("/brand/"), None);
        // What the Share button copies, and what the share page names as its URL.
        assert_eq!(
            share_link(
                "https://webmcpx.dev",
                "/pt-br/",
                "https://developers.notion.com/"
            ),
            "https://webmcpx.dev/pt-br/scan/developers.notion.com"
        );
        assert_eq!(
            share_link("https://webmcpx.dev", "/", "https://a.example/?q=1"),
            "https://webmcpx.dev/?scan=https%3A%2F%2Fa.example%2F%3Fq%3D1"
        );
    }

    /// The site says scans are logged without who ran them: the production access log names no visitor
    /// (no address, user agent or referrer), and nothing else is logged by nginx.
    #[test]
    fn the_access_log_names_no_visitor() {
        let conf = include_str!("../../../deploy/nginx.conf");
        let logs: Vec<&str> = conf
            .lines()
            .map(str::trim)
            .filter(|l| l.starts_with("access_log"))
            .collect();
        assert_eq!(logs, ["access_log /dev/stdout anonymous;"]);
        // nginx's request errors name the client and can't be redacted: the http block discards them all;
        // only the main context (nginx itself, no request) logs errors.
        let http = conf.split_once("http {").expect("an http block").1;
        let errors: Vec<&str> = http
            .lines()
            .map(str::trim)
            .filter(|l| l.starts_with("error_log"))
            .collect();
        assert_eq!(errors, ["error_log /dev/null;"]);
        assert!(
            !http.contains("server {")
                || !http
                    .split("server {")
                    .skip(1)
                    .any(|b| b.contains("error_log"))
        );
        let format = conf
            .lines()
            .find(|l| l.trim().starts_with("log_format anonymous"))
            .expect("the anonymous log format");
        for field in [
            "$remote_addr",
            "$http_user_agent",
            "$http_referer",
            "$http_x_forwarded_for",
            "$realip",
        ] {
            assert!(!format.contains(field), "{field} in {format}");
        }
    }
}
