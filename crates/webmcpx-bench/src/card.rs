//! Share images: a scan result as a 1200×630 card (for X, Slack, etc.) and as a README badge.
//!
//! The card is HTML in the design system's colors and type, rendered to PNG by the scan browser; the
//! badge is a small SVG. Both only show what a scan found: the site, its verdict, its tool count or, for
//! a site without tools, how much an agent has to read instead.

use crate::scan::{Report, Verdict};

/// Bricolage Grotesque (SIL OFL 1.1, see assets/fonts), inlined so the card renders without a network.
const FONT: &[u8] = include_bytes!("../assets/fonts/bricolage-grotesque-latin-wght-normal.woff2");
/// The webmcpx lockup, outlined (scripts/lockup.py), in ink.
const LOCKUP: &str = include_str!("../../../site/static/brand-assets/lockup/lockup-ink.svg");

/// What a card or badge shows.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Summary<'a> {
    pub host: &'a str,
    pub verdict: Verdict,
    pub tools: usize,
    pub page_tokens: usize,
}

impl<'a> Summary<'a> {
    pub fn of(report: &'a Report) -> Self {
        Self {
            host: host_of(&report.final_url),
            verdict: report.verdict,
            tools: report.tools.len(),
            page_tokens: report.page_tokens,
        }
    }
}

/// The host of a URL, without `www.`.
pub fn host_of(url: &str) -> &str {
    let rest = url.split_once("://").map_or(url, |(_, r)| r);
    let host = rest.split(['/', '?', '#']).next().unwrap_or(rest);
    host.strip_prefix("www.").unwrap_or(host)
}

fn escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

/// 12k / 1.2k / 237, as the site shows token counts.
fn short(n: usize) -> String {
    // Round the whole value first, so 1,950 is 2.0k and 9,950 is 10k (not 1.0k, 9.0k).
    let tenths = (n + 50) / 100;
    match n {
        _ if tenths >= 100 => format!("{}k", (n + 500) / 1000),
        1000.. => format!("{}.{}k", tenths / 10, tenths % 10),
        _ => n.to_string(),
    }
}

fn stamp(verdict: Verdict) -> (&'static str, &'static str) {
    match verdict {
        Verdict::Ready => ("Agent-ready", "oklch(0.9 0.08 150)"),
        Verdict::Issues => ("Almost", "oklch(0.89 0.16 95)"),
        Verdict::Missing => ("Not yet", "oklch(0.92 0.05 28)"),
    }
}

/// The card's one line under the site name.
pub fn line(s: Summary<'_>) -> String {
    match s.verdict {
        Verdict::Missing => format!(
            "No WebMCP tools. Agents read ~{} tokens of this page and guess.",
            short(s.page_tokens)
        ),
        Verdict::Issues => format!(
            "{} WebMCP {}, with lint errors agents will trip on.",
            s.tools,
            if s.tools == 1 { "tool" } else { "tools" }
        ),
        Verdict::Ready => format!(
            "{} WebMCP {} agents can call directly.",
            s.tools,
            if s.tools == 1 { "tool" } else { "tools" }
        ),
    }
}

/// The card as a standalone HTML page, 1200×630.
pub fn html(s: Summary<'_>) -> String {
    // Long hosts shrink rather than wrap or overflow.
    let size = match s.host.chars().count() {
        0..=18 => 104,
        19..=26 => 80,
        27..=36 => 60,
        _ => 46,
    };
    html_with(s.host, size, &line(s), Some(stamp(s.verdict)))
}

fn html_with(title: &str, size: u32, line: &str, stamp: Option<(&str, &str)>) -> String {
    let (label, fill) = stamp.unwrap_or(("", "transparent"));
    let stamp_display = if stamp.is_some() { "block" } else { "none" };
    let host = escape(title);
    format!(
        r#"<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:B;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:200 800}}
*{{margin:0;box-sizing:border-box}}
html,body{{width:1200px;height:630px;background:oklch(0.958 0.006 95);font-family:B,sans-serif;color:oklch(0.18 0.004 95)}}
.frame{{position:absolute;inset:28px;border:4px solid currentColor;border-radius:36px;padding:56px 64px;display:flex;flex-direction:column;
background-image:linear-gradient(to right,oklch(0.86 0.006 95) 1px,transparent 1px),linear-gradient(to bottom,oklch(0.86 0.006 95) 1px,transparent 1px);background-size:64px 64px}}
.top{{display:flex;justify-content:space-between;align-items:center}}
.lockup svg{{height:44px;width:auto}}
.stamp{{display:{stamp_display};border:4px solid currentColor;border-radius:999px;padding:10px 28px;font-size:34px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:{fill};box-shadow:5px 5px 0 currentColor}}
.host{{margin-top:auto;font-size:{size}px;font-weight:800;letter-spacing:-.04em;line-height:1;overflow-wrap:anywhere}}
.line{{margin-top:22px;font-size:36px;font-weight:500;color:oklch(0.38 0.006 95);max-width:1000px}}
.foot{{margin-top:40px;font-size:28px;font-weight:700}}
.foot span{{background:linear-gradient(transparent 55%,oklch(0.89 0.16 95) 55%,oklch(0.89 0.16 95) 92%,transparent 92%)}}
</style></head><body><div class="frame">
<div class="top"><div class="lockup">{lockup}</div><div class="stamp">{label}</div></div>
<div class="host">{host}</div><div class="line">{line}</div>
<div class="foot">Scan yours at <span>webmcpx.dev</span></div>
</div></body></html>"#,
        font = base64(FONT),
        lockup = LOCKUP,
        line = escape(line),
    )
}

/// The site's own preview image (`/og.png`): what webmcpx is, for links without a scan.
pub fn generic_html() -> String {
    html_with(
        "Make your site agent-ready.",
        104,
        "Scan any site for WebMCP tools. One line makes it agent\u{2011}ready.",
        None,
    )
}

/// A published run's preview image (`/og/benchmark-<model>.png`): its best case, the question with the
/// largest token saving among those solved at least as often with WebMCP, named as a best case (results
/// are never averaged). None without such a comparison.
pub fn bench_html(results: &serde_json::Value) -> Option<String> {
    let tasks = results["summary"]["tasks"].as_object()?;
    let (task, ratio) = tasks
        .iter()
        .filter_map(|(id, arms)| {
            let base = arms["baseline"]["tokens"].as_f64()?;
            let with = arms["webmcp"]["tokens"].as_f64()?;
            // Like the page's showcase: a best case is solved at least as often with WebMCP.
            let solved = |arm: &str| arms[arm]["success_rate"].as_f64().unwrap_or(0.0);
            (with > 0.0 && solved("webmcp") >= solved("baseline")).then_some((id, base / with))
        })
        .max_by(|a, b| a.1.total_cmp(&b.1))?;
    let place = results["tasks"][task.as_str()]["url"].as_str().map_or_else(
        || "a local test site".to_owned(),
        |u| host_of(u).trim_start_matches("www.").to_owned(),
    );
    let saving = if ratio >= 10.0 {
        format!("{ratio:.0}")
    } else {
        format!("{ratio:.1}")
    };
    let model = results["model"].as_str().unwrap_or("one model");
    Some(html_with(
        &format!("{saving}\u{d7} fewer tokens"),
        104,
        &format!(
            "{model}, same question with and without WebMCP: best case, on {place}. Every question is published."
        ),
        None,
    ))
}

/// The README badge for a site: `webmcp | agent-ready` (or almost, not yet, unknown).
pub fn badge(verdict: Option<Verdict>) -> String {
    let (label, fill) = match verdict {
        Some(v) => {
            let (label, fill) = stamp(v);
            (label.to_lowercase(), fill)
        }
        None => ("scan".to_owned(), "oklch(0.988 0.004 95)"),
    };
    // Widths for Verdana 11px, as shields-style badges measure them.
    let right = 12 + label.chars().count() * 7;
    let left = 74;
    let width = left + right;
    format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="20" role="img" aria-label="WebMCP: {label}"><title>WebMCP: {label} (webmcpx.dev)</title><path d="M3 0h{left}v20H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3Z" fill="#121210"/><path d="M{left} 0h{r3}a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H{left}Z" fill="{fill}"/><g fill="#f2f1ed" transform="translate(5 3.4) scale(.55)"><path d="M2 4H6.5L11 11V13L6.5 20H2L7 12Z"/><path d="M22 4H17.5L13 11V13L17.5 20H22L17 12Z"/></g><g font-family="Verdana,Geneva,'DejaVu Sans',sans-serif" font-size="11"><text x="22" y="14" fill="#f2f1ed">WebMCP</text><text x="{mid}" y="14" fill="#121210" text-anchor="middle">{label}</text></g></svg>"##,
        r3 = right - 3,
        mid = left + right / 2,
    )
}

fn base64(bytes: &[u8]) -> String {
    const A: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let n = chunk
            .iter()
            .enumerate()
            .fold(0u32, |n, (i, &b)| n | u32::from(b) << (16 - 8 * i));
        for i in 0..4 {
            if i <= chunk.len() {
                out.push(char::from(A[(n >> (18 - 6 * i) & 63) as usize]));
            } else {
                out.push('=');
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    #[test]
    fn bench_card_names_the_best_case_and_its_site() {
        let run = serde_json::json!({
            "model": "m-1",
            "summary": { "tasks": {
                "a": { "baseline": { "tokens": 1000.0 }, "webmcp": { "tokens": 500.0 } },
                "b": { "baseline": { "tokens": 9000.0 }, "webmcp": { "tokens": 100.0 } },
                "c": { "baseline": { "tokens": 10.0 } },
                // Fewer tokens, but solved less often: never a best case.
                "d": { "baseline": { "tokens": 9000.0, "success_rate": 1.0 }, "webmcp": { "tokens": 10.0, "success_rate": 0.5 } }
            }},
            "tasks": { "b": { "url": "https://www.example.com/docs" } }
        });
        let html = bench_html(&run).unwrap();
        assert!(html.contains("90\u{d7} fewer tokens"), "{html}");
        assert!(html.contains("best case, on example.com"), "{html}");
        assert!(bench_html(&serde_json::json!({ "summary": { "tasks": {} } })).is_none());
    }

    use super::*;

    #[test]
    fn base64_matches_the_standard() {
        assert_eq!(base64(b""), "");
        assert_eq!(base64(b"f"), "Zg==");
        assert_eq!(base64(b"fo"), "Zm8=");
        assert_eq!(base64(b"foo"), "Zm9v");
        assert_eq!(base64(b"foobar"), "Zm9vYmFy");
    }

    #[test]
    fn hosts_and_lines() {
        assert_eq!(host_of("https://www.allbirds.com/x?y"), "allbirds.com");
        assert_eq!(host_of("http://127.0.0.1:8080/"), "127.0.0.1:8080");
        let s = Summary {
            host: "a.example",
            verdict: Verdict::Missing,
            tools: 0,
            page_tokens: 12_345,
        };
        assert_eq!(
            line(s),
            "No WebMCP tools. Agents read ~12k tokens of this page and guess."
        );
        let s = Summary {
            verdict: Verdict::Ready,
            tools: 1,
            ..s
        };
        assert_eq!(line(s), "1 WebMCP tool agents can call directly.");
        assert_eq!(short(2485), "2.5k");
        assert_eq!(short(237), "237");
        assert_eq!(short(999), "999");
        assert_eq!(short(1000), "1.0k");
        assert_eq!(short(1950), "2.0k");
        assert_eq!(short(9949), "9.9k");
        assert_eq!(short(9950), "10k");
        assert_eq!(short(12_345), "12k");
    }

    #[test]
    fn the_card_escapes_the_host() {
        let s = Summary {
            host: "<x>&",
            verdict: Verdict::Ready,
            tools: 2,
            page_tokens: 1,
        };
        let h = html(s);
        assert!(h.contains("&lt;x&gt;&amp;") && !h.contains("<x>&"));
        assert!(h.contains("AGENT-READY") || h.contains("Agent-ready"));
    }

    #[test]
    fn badges_say_the_verdict() {
        assert!(badge(Some(Verdict::Ready)).contains(">agent-ready</text>"));
        assert!(badge(None).contains(">scan</text>"));
        assert!(!badge(Some(Verdict::Missing)).contains("<script"));
    }
}
