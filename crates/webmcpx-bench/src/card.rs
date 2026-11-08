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
/// The Junction mark, drawn faint and large behind the card, as on the site's sections.
const MARK: &str = include_str!("../../../site/static/brand-assets/junction/mark.svg");

/// What a card or badge shows.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Summary<'a> {
    pub host: &'a str,
    pub verdict: Verdict,
    pub tools: usize,
    pub page_tokens: usize,
    /// The agent-ready score (0 to 100).
    pub score: u8,
    /// Whether the linter found errors (an "almost" site with clean tools only misses agent basics).
    pub lint_errors: bool,
    /// The scan's date, `YYYY-MM-DD` (UTC).
    pub scanned_on: &'a str,
}

/// Which image: the link preview (`og:image`, 1200×630) or the post image Save PNG downloads (1600×900,
/// 16:9, shown whole on X, Bluesky, Threads and `LinkedIn`; laid out at 1200×675 and rendered at 4/3).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Format {
    Link,
    Post,
}

impl Format {
    /// CSS width and height of the layout, and the device scale it is captured at.
    pub const fn size(self) -> (u32, u32, f64) {
        match self {
            Self::Link => (1200, 630, 1.0),
            Self::Post => (1200, 675, 4.0 / 3.0),
        }
    }
}

impl<'a> Summary<'a> {
    pub fn of(report: &'a Report) -> Self {
        Self {
            host: host_of(&report.final_url),
            verdict: report.verdict,
            tools: report.tools.len(),
            page_tokens: report.page_tokens,
            score: report.score,
            lint_errors: report.diagnostics.iter().any(|d| d.severity == "error"),
            scanned_on: &report.scanned_on,
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

/// The verdict's stamp: label, fill and text color (red for a site agents can't use through tools).
fn stamp(verdict: Verdict) -> (&'static str, &'static str, &'static str) {
    const INK: &str = "oklch(0.18 0.004 95)";
    match verdict {
        Verdict::Ready => ("Agent-ready", "oklch(0.9 0.08 150)", INK),
        Verdict::Issues => ("Almost", "oklch(0.89 0.16 95)", INK),
        Verdict::Missing => ("Not agent-ready", "oklch(0.58 0.21 27)", "#fff"),
    }
}

/// `2026-11-09` as `Nov 9, 2026`; anything else as given.
fn human_date(iso: &str) -> String {
    const MONTHS: [&str; 12] = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    let mut parts = iso.splitn(3, '-').map(str::parse::<usize>);
    match (parts.next(), parts.next(), parts.next()) {
        (Some(Ok(y)), Some(Ok(m @ 1..=12)), Some(Ok(d))) => format!("{} {d}, {y}", MONTHS[m - 1]),
        _ => iso.to_owned(),
    }
}

/// The card's one line under the site name, ending with the score (link previews' description).
pub fn line(s: Summary<'_>) -> String {
    format!("{} Score {}/100.", what(s), s.score)
}

/// What the scan found, in one sentence (the card shows the score on its own).
fn what(s: Summary<'_>) -> String {
    let tools = if s.tools == 1 { "tool" } else { "tools" };
    match s.verdict {
        Verdict::Missing => format!(
            "No WebMCP tools. Agents read ~{} tokens of this page and guess.",
            short(s.page_tokens)
        ),
        Verdict::Issues if s.lint_errors => {
            format!(
                "{} WebMCP {tools}, with lint errors agents will trip on.",
                s.tools
            )
        }
        Verdict::Issues => format!("{} WebMCP {tools}; a few agent basics missing.", s.tools),
        Verdict::Ready => format!("{} WebMCP {tools} agents can call directly.", s.tools),
    }
}

/// The card as a standalone HTML page, 1200×630.
pub fn html(s: Summary<'_>, format: Format) -> String {
    // Long hosts shrink rather than wrap or overflow.
    let size = match s.host.chars().count() {
        0..=18 => 104,
        19..=26 => 80,
        27..=36 => 60,
        _ => 46,
    };
    render(&Card {
        title: s.host,
        size,
        line: &what(s),
        stamp: Some(stamp(s.verdict)),
        score: Some(s.score),
        date: Some(human_date(s.scanned_on)),
        height: format.size().1,
    })
}

/// What one card shows; [`render`] lays it out.
struct Card<'a> {
    title: &'a str,
    /// The title's font size (px).
    size: u32,
    line: &'a str,
    /// Label, fill and text color of the verdict stamp.
    stamp: Option<(&'a str, &'a str, &'a str)>,
    score: Option<u8>,
    /// When the scan ran, shown small in the footer.
    date: Option<String>,
    /// Layout height in CSS px (630 for a link preview, 675 for a 16:9 post image).
    height: u32,
}

fn render(c: &Card<'_>) -> String {
    let (label, fill, stamp_ink) = c.stamp.unwrap_or(("", "transparent", "inherit"));
    let stamp_display = if c.stamp.is_some() { "block" } else { "none" };
    let host = escape(c.title);
    let height = c.height;
    let size = c.size;
    // The score, big at the bottom right; highlighted from the agent-ready bar up.
    let score = c.score.map_or_else(String::new, |n| {
        let mark = if n >= crate::scan::READY_SCORE {
            " marked"
        } else {
            ""
        };
        format!(
            r#"<div class="score"><div class="label">Agent-ready score</div><div class="num{mark}"><b>{n}</b><small>/100</small></div></div>"#
        )
    });
    let date = c.date.as_deref().map_or_else(String::new, |d| {
        format!(r#"<span class="date">Scanned {}</span>"#, escape(d))
    });
    format!(
        r#"<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:B;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:200 800}}
*{{margin:0;box-sizing:border-box}}
html,body{{width:1200px;height:{height}px;background:oklch(0.958 0.006 95);font-family:B,sans-serif;color:oklch(0.18 0.004 95)}}
.frame{{position:absolute;inset:28px;border:4px solid currentColor;border-radius:36px;padding:56px 64px;display:flex;flex-direction:column;overflow:hidden;
background-image:linear-gradient(to right,oklch(0.86 0.006 95) 1px,transparent 1px),linear-gradient(to bottom,oklch(0.86 0.006 95) 1px,transparent 1px);background-size:64px 64px}}
.top{{display:flex;justify-content:space-between;align-items:center}}
.lockup svg{{height:44px;width:auto}}
.stamp{{display:{stamp_display};border:4px solid oklch(0.18 0.004 95);border-radius:999px;padding:10px 28px;font-size:34px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:{fill};color:{stamp_ink};box-shadow:5px 5px 0 oklch(0.18 0.004 95)}}
.mark{{position:absolute;right:-110px;top:50%;width:600px;height:600px;transform:translateY(-50%) rotate(-12deg);opacity:.06}}
.top,.main,.foot{{position:relative}}
.main{{margin-top:auto}}
.row{{display:flex;align-items:flex-end;gap:48px}}
.text{{flex:1;min-width:0}}
.host{{font-size:{size}px;font-weight:800;letter-spacing:-.04em;line-height:1;overflow-wrap:anywhere}}
.line{{margin-top:22px;font-size:34px;font-weight:500;color:oklch(0.38 0.006 95);max-width:1000px}}
.score{{text-align:right;flex:none}}
.score .label{{font-size:20px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:oklch(0.38 0.006 95);margin-bottom:6px}}
.num b{{font-size:150px;font-weight:800;letter-spacing:-.05em;line-height:.85}}
.num small{{font-size:46px;font-weight:700;color:oklch(0.38 0.006 95)}}
.num.marked b{{background:linear-gradient(transparent 45%,oklch(0.89 0.16 95) 45%,oklch(0.89 0.16 95) 80%,transparent 80%)}}
.foot{{margin-top:40px;font-size:30px;font-weight:700;display:flex;justify-content:space-between;align-items:baseline}}
.foot span.cta span{{background:linear-gradient(transparent 55%,oklch(0.89 0.16 95) 55%,oklch(0.89 0.16 95) 92%,transparent 92%)}}
.date{{font-size:20px;font-weight:600;letter-spacing:.06em;color:oklch(0.38 0.006 95)}}
</style></head><body><div class="frame">
<div class="mark">{mark}</div>
<div class="top"><div class="lockup">{lockup}</div><div class="stamp">{label}</div></div>
<div class="main"><div class="host">{host}</div><div class="row"><div class="text line">{line}</div>{score}</div></div>
<div class="foot"><span class="cta">Scan yours at <span>webmcpx.dev</span></span>{date}</div>
</div></body></html>"#,
        font = base64(FONT),
        lockup = LOCKUP,
        mark = MARK,
        line = escape(c.line),
    )
}

/// The site's own preview image (`/og.png`): what webmcpx is, for links without a scan.
pub fn generic_html() -> String {
    render(&Card {
        title: "Make your site agent-ready",
        size: 104,
        line: "Scan any site for WebMCP tools. One line makes it agent\u{2011}ready.",
        stamp: None,
        score: None,
        date: None,
        height: 630,
    })
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
    let title = format!("{saving}\u{d7} fewer tokens");
    let line = format!(
        "{model}, same question with and without WebMCP: best case, on {place}. Every question is published."
    );
    Some(render(&Card {
        title: &title,
        size: 104,
        line: &line,
        stamp: None,
        score: None,
        date: None,
        height: 630,
    }))
}

/// The README badge for a site: `webmcp | agent-ready` (or almost, not agent-ready, scan).
/// The site's own badge artwork (`site/src/lib/content/badges/`), by style: what a Markdown embed shows
/// for an agent-ready site, the same picture the HTML embed carries inline.
const STYLED: [(&str, &str); 3] = [
    (
        "card",
        include_str!("../../../site/src/lib/content/badges/card.svg"),
    ),
    (
        "flat",
        include_str!("../../../site/src/lib/content/badges/flat.svg"),
    ),
    (
        "dark",
        include_str!("../../../site/src/lib/content/badges/dark.svg"),
    ),
];

/// The badge for `/badge/<host>.svg?style=…`: the chosen artwork only while the site is agent-ready (it
/// says so); otherwise, or for an unknown style, the badge with the site's real verdict.
pub fn badge_styled(verdict: Option<Verdict>, style: Option<&str>) -> String {
    let artwork = STYLED
        .iter()
        .find(|(name, _)| Some(*name) == style)
        .map(|(_, svg)| svg.trim().to_owned());
    match (verdict, artwork) {
        (Some(Verdict::Ready), Some(svg)) => svg,
        _ => badge(verdict),
    }
}

pub fn badge(verdict: Option<Verdict>) -> String {
    let (label, fill) = match verdict {
        Some(v) => {
            let (label, fill, _) = stamp(v);
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
            score: 20,
            lint_errors: false,
            scanned_on: "2026-11-09",
        };
        assert_eq!(
            line(s),
            "No WebMCP tools. Agents read ~12k tokens of this page and guess. Score 20/100."
        );
        let s = Summary {
            verdict: Verdict::Ready,
            tools: 1,
            score: 90,
            ..s
        };
        assert_eq!(
            line(s),
            "1 WebMCP tool agents can call directly. Score 90/100."
        );
        let s = Summary {
            verdict: Verdict::Issues,
            tools: 2,
            score: 65,
            ..s
        };
        assert_eq!(
            line(s),
            "2 WebMCP tools; a few agent basics missing. Score 65/100."
        );
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
            score: 100,
            lint_errors: false,
            scanned_on: "2026-11-09",
        };
        let h = html(s, Format::Link);
        assert!(h.contains("&lt;x&gt;&amp;") && !h.contains("<x>&"));
        assert!(h.contains("AGENT-READY") || h.contains("Agent-ready"));
        assert!(h.contains("Scanned Nov 9, 2026"));
        assert!(h.contains("height:630px"));
        // The post image is 16:9, laid out at 1200×675.
        assert!(html(s, Format::Post).contains("height:675px"));
        assert_eq!(Format::Post.size(), (1200, 675, 4.0 / 3.0));
        // A site without tools gets the red "Not agent-ready" stamp.
        let missing = html(
            Summary {
                verdict: Verdict::Missing,
                ..s
            },
            Format::Link,
        );
        assert!(missing.contains(">Not agent-ready<"));
        assert!(missing.contains("oklch(0.58 0.21 27)"));
        assert_eq!(super::human_date("2026-01-31"), "Jan 31, 2026");
        assert_eq!(super::human_date("soon"), "soon");
    }

    #[test]
    fn badges_say_the_verdict() {
        assert!(badge(Some(Verdict::Ready)).contains(">agent-ready</text>"));
        assert!(badge(Some(Verdict::Missing)).contains(">not agent-ready</text>"));
        assert!(badge(None).contains(">scan</text>"));
        assert!(!badge(Some(Verdict::Missing)).contains("<script"));
    }

    /// A styled badge is the site's artwork only for an agent-ready site: it never claims a verdict the
    /// site doesn't have.
    #[test]
    fn styled_badges_only_for_agent_ready_sites() {
        use super::badge_styled;
        let card = badge_styled(Some(Verdict::Ready), Some("card"));
        assert!(card.starts_with("<svg") && card.contains("agent-ready"));
        assert_ne!(card, badge(Some(Verdict::Ready)));
        assert_eq!(
            badge_styled(Some(Verdict::Missing), Some("card")),
            badge(Some(Verdict::Missing))
        );
        assert_eq!(badge_styled(None, Some("dark")), badge(None));
        assert_eq!(
            badge_styled(Some(Verdict::Ready), Some("<script>")),
            badge(Some(Verdict::Ready))
        );
    }
}
