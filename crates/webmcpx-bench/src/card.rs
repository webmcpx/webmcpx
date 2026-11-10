//! Share images: a scan result as a 1200×630 card (for X, Slack, etc.) and as a README badge.
//!
//! The card is HTML in the design system's colors and type, rendered to PNG by the scan browser; the
//! badge is a small SVG. Both only show what a scan found: the site, its verdict, its tool count or, for
//! a site without tools, how much an agent has to read instead.

use crate::scan::{Report, Verdict};

mod text;
pub use text::{ALL as LANGUAGES, Text};

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

/// The host of a URL, with its port, without `www.`: the key a site's verdict and badge are kept under
/// (the site's `host()` in scan.ts builds badge URLs the same way).
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

/// The verdict in `t`'s language: the card's stamp and a shared link's title.
pub const fn verdict_label(verdict: Verdict, t: &Text) -> &'static str {
    match verdict {
        Verdict::Ready => t.ready,
        Verdict::Issues => t.almost,
        Verdict::Missing => t.missing,
    }
}

/// From this many page tokens, the card says how much of the page agents read.
const HEAVY_PAGE: usize = 2000;

/// The second line, bold: why the viewer should care. Without tools, what tools gave agents in the
/// benchmark (its best case, "up to"); almost there, the points still missing; agent-ready, nothing.
fn hook(s: Summary<'_>, t: &Text) -> Option<String> {
    match s.verdict {
        Verdict::Missing => best_saving().map(|best| t.hook.replace("{best}", &ratio(best))),
        Verdict::Issues => {
            let missing = crate::scan::READY_SCORE.checked_sub(s.score)?;
            (missing > 0).then(|| t.distance(usize::from(missing)))
        }
        Verdict::Ready => None,
    }
}

/// 62× / 4.4×, as the site shows a saving.
fn ratio(x: f64) -> String {
    if x >= 10.0 {
        format!("{x:.0}\u{d7}")
    } else {
        format!("{x:.1}\u{d7}")
    }
}

/// Every published run (`site/src/lib/content/bench/`); a test keeps the list in step with the folder.
const RUNS: [&str; 6] = [
    include_str!("../../../site/src/lib/content/bench/claude-haiku-5-5.json"),
    include_str!("../../../site/src/lib/content/bench/claude-opus-5-5.json"),
    include_str!("../../../site/src/lib/content/bench/gemini-3.8-flash.json"),
    include_str!("../../../site/src/lib/content/bench/gemini-4-argon.json"),
    include_str!("../../../site/src/lib/content/bench/gpt-6-luna.json"),
    include_str!("../../../site/src/lib/content/bench/gpt-6.1-sol.json"),
];

/// The leaderboard's best case, as the landing quotes it ("up to 62× fewer tokens"): the largest saving on
/// one question over every published run. None without one.
pub fn best_saving() -> Option<f64> {
    static BEST: std::sync::OnceLock<Option<f64>> = std::sync::OnceLock::new();
    *BEST.get_or_init(|| {
        RUNS.iter()
            .filter_map(|run| serde_json::from_str(run).ok())
            .filter_map(|run: serde_json::Value| best_case(&run).map(|(_, x)| x))
            .max_by(f64::total_cmp)
    })
}

/// A run's best case: the question with the largest token saving among those solved at least as often
/// with WebMCP (like the page's showcase), and that saving.
fn best_case(results: &serde_json::Value) -> Option<(&str, f64)> {
    results["summary"]["tasks"]
        .as_object()?
        .iter()
        .filter_map(|(id, arms)| {
            let base = arms["baseline"]["tokens"].as_f64()?;
            let with = arms["webmcp"]["tokens"].as_f64()?;
            let solved = |arm: &str| arms[arm]["success_rate"].as_f64().unwrap_or(0.0);
            (with > 0.0 && solved("webmcp") >= solved("baseline"))
                .then_some((id.as_str(), base / with))
        })
        .max_by(|a, b| a.1.total_cmp(&b.1))
}

/// The card's one line under the site name, ending with the score (link previews' description).
pub fn line(s: Summary<'_>, t: &Text) -> String {
    let score = t.score_line.replace("{score}", &s.score.to_string());
    format!("{} {score}", what(s, t))
}

/// A shared scan link's preview text, in `t`'s language: title, description and the image's alt text.
/// Networks that show text beside the image (Bluesky, `LinkedIn`, Slack, Discord) get what the image only
/// hints at: the bold line and the way to scan your own site.
pub fn share_text(s: Summary<'_>, t: &Text) -> (String, String, String) {
    let verdict = verdict_label(s.verdict, t);
    let title = format!("{} · {verdict} · {}/100", s.host, s.score);
    let hook = hook(s, t);
    let cta = t.cta.replace("{site}", "webmcpx.dev");
    let description = [Some(line(s, t)), hook.clone(), Some(cta)]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>()
        .join(" ");
    let fix = (s.verdict == Verdict::Missing).then(|| t.fix.to_owned());
    let alt = [
        Some(format!("webmcpx · {title}.")),
        Some(what(s, t)),
        hook,
        fix,
    ]
    .into_iter()
    .flatten()
    .collect::<Vec<_>>()
    .join(" ");
    (title, description, alt)
}

/// What the scan found, in one sentence (the card shows the score on its own).
fn what(s: Summary<'_>, t: &Text) -> String {
    let pattern = match s.verdict {
        // A light page's token count says little (a few hundred tokens sound cheap): just the finding.
        Verdict::Missing if s.page_tokens < HEAVY_PAGE => return t.no_tools_light.to_owned(),
        Verdict::Missing => return t.no_tools.replace("{n}", &short(s.page_tokens)),
        Verdict::Issues if s.lint_errors => t.lint,
        Verdict::Issues => t.basics,
        Verdict::Ready => t.callable,
    };
    pattern.replace("{tools}", &t.tools(s.tools))
}

/// The card as a standalone HTML page, in `t`'s language.
pub fn html(s: Summary<'_>, format: Format, t: &Text) -> String {
    // The host's largest size: the card shrinks it to fit its line (see FIT).
    let size = 120;
    let (_, fill, ink) = stamp(s.verdict);
    render(&Card {
        title: s.host,
        size,
        line: &what(s, t),
        hook: hook(s, t),
        fix: (s.verdict == Verdict::Missing).then_some(t.fix),
        stamp: Some((verdict_label(s.verdict, t), fill, ink)),
        verdict: Some(s.verdict),
        score: Some(s.score),
        date: Some(t.scanned.replace("{date}", &t.date(s.scanned_on))),
        height: format.size().1,
        text: t,
    })
}

/// What one card shows; [`render`] lays it out.
struct Card<'a> {
    title: &'a str,
    /// The title's font size (px).
    size: u32,
    line: &'a str,
    /// A bold second line (see [`hook`]).
    hook: Option<String>,
    /// A small line under it, where the fix starts (no WebMCP tools only).
    fix: Option<&'a str>,
    /// The verdict the stamp shows, for its icon.
    verdict: Option<Verdict>,
    /// Label, fill and text color of the verdict stamp.
    stamp: Option<(&'a str, &'a str, &'a str)>,
    score: Option<u8>,
    /// When the scan ran ("Scanned Nov 9, 2026"), shown small in the footer.
    date: Option<String>,
    /// Layout height in CSS px (630 for a link preview, 675 for a 16:9 post image).
    height: u32,
    /// The card's language: its fixed words and `<html lang>`.
    text: &'a Text,
}

fn render(c: &Card<'_>) -> String {
    let (label, fill, stamp_ink) = c.stamp.unwrap_or(("", "transparent", "inherit"));
    // A cross on the not agent-ready stamp: the verdict reads before its words do. An agent-ready site
    // gets the agent-ready badge itself, the seal only approved sites carry.
    let badge = if c.verdict == Some(Verdict::Ready) {
        STYLED[0].1.trim()
    } else {
        ""
    };
    let icon = if c.verdict == Some(Verdict::Missing) {
        r#"<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>"#
    } else {
        ""
    };
    let stamp_display = if c.stamp.is_some() { "block" } else { "none" };
    // A scanned host is one word: it shrinks to fit one line (see FIT), and only a host too long for
    // that breaks, at its dots and hyphens, never inside a label.
    let fit = c.verdict.is_some();
    let host = escape(c.title);
    let host_class = if fit { "host fit" } else { "host" };
    let height = c.height;
    let t = c.text;
    let lang = t.tag;
    // A longer verdict (most languages) gets a smaller stamp, so it still fits beside the lockup.
    let stamp_size = match label.chars().count() {
        0..=16 => 30,
        17..=24 => 27,
        _ => 24,
    };
    let score_label = escape(t.score);
    let top_right = if badge.is_empty() {
        format!(r#"<div class="stamp">{icon}{label}</div>"#)
    } else {
        format!(r#"<div class="seal">{badge}</div>"#)
    };
    // The link preview is 45 px shorter than the post image: its type, gauge and padding give way first.
    let (size, text_size, pad, gap, ring) = if height < 650 {
        (c.size.min(104), 28, 34, 14, 150)
    } else {
        (c.size, 31, 42, 20, 172)
    };
    // The fix line, about 70% of the hook: there to read, never competing with it.
    let fix_size = text_size * 7 / 10;
    let cta = escape(t.cta).replace("{site}", "<span>webmcpx.dev</span>");
    // The score as a gauge in the verdict's color: how far the site is from 100 reads at a glance.
    let score = c.score.map_or_else(String::new, |n| {
        let tone = match c.verdict {
            Some(Verdict::Ready) => "oklch(0.66 0.17 150)",
            Some(Verdict::Missing) => "oklch(0.58 0.21 27)",
            _ => "oklch(0.8 0.17 85)",
        };
        let r = 42.0;
        let length = 2.0 * std::f64::consts::PI * r;
        let filled = length * f64::from(n.min(100)) / 100.0;
        format!(
            r#"<div class="score"><div class="label">{score_label}</div><div class="gauge"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="{r}" class="track"/><circle cx="50" cy="50" r="{r}" class="arc" stroke="{tone}" stroke-dasharray="{filled:.2} {length:.2}"/></svg><div class="num"><b>{n}</b><small>/100</small></div></div></div>"#
        )
    });
    let hook = c.hook.as_deref().map_or_else(String::new, |h| {
        format!(r#"<div class="hook">{}</div>"#, escape(h))
    });
    let fix = c.fix.map_or_else(String::new, |f| {
        format!(r#"<div class="fix">{}</div>"#, escape(f))
    });
    let date = c.date.as_deref().map_or_else(String::new, |d| {
        format!(r#"<span class="date">{}</span>"#, escape(d))
    });
    let script = if fit { FIT } else { "" };
    format!(
        r#"<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>
@font-face{{font-family:B;src:url(data:font/woff2;base64,{font}) format("woff2");font-weight:200 800}}
*{{margin:0;box-sizing:border-box}}
html,body{{width:1200px;height:{height}px;background:oklch(0.958 0.006 95);font-family:B,"Noto Sans",sans-serif;color:oklch(0.18 0.004 95)}}
.frame{{position:absolute;inset:28px;border:4px solid currentColor;border-radius:36px;display:flex;flex-direction:column;overflow:hidden;
background-color:oklch(0.975 0.004 95);background-image:linear-gradient(to right,oklch(0.92 0.005 95) 1px,transparent 1px),linear-gradient(to bottom,oklch(0.92 0.005 95) 1px,transparent 1px);background-size:64px 64px}}
.top{{display:flex;justify-content:space-between;align-items:center;gap:32px;padding:{pad}px 56px 0}}
.lockup svg{{display:block;height:40px;width:auto}}
.stamp .icon{{width:1.05em;height:1.05em;margin-right:.35em;vertical-align:-.15em;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}}
.seal svg{{display:block;height:80px;width:auto}}
.stamp{{display:{stamp_display};flex:none;border:4px solid oklch(0.18 0.004 95);border-radius:999px;padding:9px 26px;font-size:{stamp_size}px;white-space:nowrap;font-weight:800;letter-spacing:.04em;text-transform:uppercase;background:{fill};color:{stamp_ink};box-shadow:5px 5px 0 oklch(0.18 0.004 95)}}
.mark{{position:absolute;right:-120px;top:42%;width:560px;height:560px;transform:translateY(-50%) rotate(-12deg);opacity:.05}}
.top,.main,.foot{{position:relative}}
.main{{flex:1;display:flex;flex-direction:column;justify-content:center;gap:{gap}px;padding:0 56px;min-height:0}}
.host{{font-size:{size}px;font-weight:800;letter-spacing:-.045em;line-height:1.02;overflow-wrap:anywhere}}
.host.fit{{white-space:nowrap;overflow-wrap:normal}}
.row{{display:flex;align-items:center;gap:44px}}
.text{{flex:1;min-width:0}}
.line{{font-size:{text_size}px;font-weight:500;line-height:1.22;color:oklch(0.36 0.006 95)}}
.hook{{margin-top:10px;font-size:{text_size}px;font-weight:800;line-height:1.2;color:oklch(0.18 0.004 95)}}
.fix{{margin-top:12px;display:inline-block;padding:4px 12px;border-radius:8px;background:oklch(0.18 0.004 95);color:oklch(0.958 0.006 95);font-family:ui-monospace,"SFMono-Regular",Menlo,"DejaVu Sans Mono",monospace;font-size:{fix_size}px;font-weight:600}}
.score{{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px}}
.score .label{{max-width:260px;text-align:center;font-size:17px;line-height:1.2;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:oklch(0.36 0.006 95)}}
.gauge{{position:relative;width:{ring}px;height:{ring}px}}
.gauge svg{{position:absolute;inset:0;transform:rotate(-90deg)}}
.gauge circle{{fill:none;stroke-width:13}}
.gauge .track{{stroke:oklch(0.9 0.005 95)}}
.gauge .arc{{stroke-linecap:round}}
.num{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}}
.num b{{font-size:{num_size}px;font-weight:800;letter-spacing:-.05em;line-height:.9}}
.num small{{font-size:{small_size}px;font-weight:800;color:oklch(0.36 0.006 95)}}
.foot{{display:flex;justify-content:space-between;align-items:center;gap:32px;padding:18px 56px 20px;background:oklch(0.18 0.004 95);color:oklch(0.958 0.006 95)}}
.cta{{flex:none;font-size:38px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}}
.cta span{{color:oklch(0.89 0.16 95)}}
.cta .go{{display:inline-block;margin-left:.3em;color:oklch(0.89 0.16 95)}}
.date{{min-width:0;font-size:19px;font-weight:600;letter-spacing:.06em;color:oklch(0.78 0.006 95)}}
:lang(zh) *,:lang(ja) *,:lang(hi) *,:lang(bn) *{{letter-spacing:0!important}}
</style></head><body><div class="frame">
<div class="mark">{mark}</div>
<div class="top"><div class="lockup">{lockup}</div>{top_right}</div>
<div class="main"><div class="{host_class}">{host}</div><div class="row"><div class="text"><div class="line">{line}</div>{hook}{fix}</div>{score}</div></div>
<div class="foot">{date}<span class="cta">{cta}<span class="go">→</span></span></div>
</div>{script}</body></html>"#,
        font = base64(FONT),
        lockup = LOCKUP,
        mark = MARK,
        line = escape(c.line),
        // A perfect 100 is three digits wide: smaller, so it stays inside the ring.
        num_size = if c.score >= Some(100) { ring * 3 / 10 } else { ring * 2 / 5 },
        small_size = ring / 8,
    )
}

/// Shrinks a scanned host until it fits its line (from its starting size down to 44 px); a host still
/// too long wraps at its dots and hyphens and keeps shrinking until it fits two lines and its width; a
/// single label wider than a line at 32 px breaks anywhere. It measures once
/// the inlined font has loaded (not the fallback's widths), and the renderer waits for `cardReady`.
const FIT: &str = r"<script>window.cardReady = document.fonts.load('800 100px B').then(() => {
const h = document.querySelector('.host.fit'); if (!h) return;
let s = parseFloat(getComputedStyle(h).fontSize);
const set = (n) => { s = n; h.style.fontSize = n + 'px'; };
while (h.scrollWidth > h.clientWidth + 1 && s > 44) set(s - 2);
if (h.scrollWidth > h.clientWidth + 1) {
  // Chrome breaks at <wbr> even under nowrap, so the break points only go in now.
  h.innerHTML = h.innerHTML.replace(/[.-]/g, '$&<wbr>');
  h.style.whiteSpace = 'normal';
  const over = () => h.scrollWidth > h.clientWidth + 1 || h.getBoundingClientRect().height > s * 2.2;
  while (over() && s > 32) set(s - 2);
  // A single label too long for any line (up to 63 characters) breaks anywhere, inside the frame.
  if (h.scrollWidth > h.clientWidth + 1) h.style.overflowWrap = 'anywhere';
}
});</script>";

/// The generic card's line: what a scan does, and the benchmark's best case as the landing quotes it.
fn generic_line() -> String {
    best_saving().map_or_else(
        || "Scan any site for WebMCP tools.".to_owned(),
        |best| {
            format!(
                "Scan any site for WebMCP tools. With them: up to {} fewer tokens for agents in our benchmark.",
                ratio(best)
            )
        },
    )
}

/// The site's own preview image (`/og.png`): what webmcpx is, for links without a scan.
pub fn generic_html() -> String {
    render(&Card {
        title: "Make your site agent-ready",
        size: 104,
        line: &generic_line(),
        hook: None,
        fix: None,
        stamp: None,
        verdict: None,
        score: None,
        date: None,
        height: 630,
        text: &text::ALL[0],
    })
}

/// A published run's preview image (`/og/benchmark-<model>.png`): its best case, the question with the
/// largest token saving among those solved at least as often with WebMCP, named as a best case (results
/// are never averaged). None without such a comparison.
pub fn bench_html(results: &serde_json::Value) -> Option<String> {
    let (task, saving) = best_case(results)?;
    let place = results["tasks"][task]["url"].as_str().map_or_else(
        || "a local test site".to_owned(),
        |u| host_of(u).trim_start_matches("www.").to_owned(),
    );
    let model = results["model"].as_str().unwrap_or("one model");
    let title = format!("{} fewer tokens", ratio(saving));
    let line = format!(
        "{model}, same question with and without WebMCP: best case, on {place}. Every question is published."
    );
    Some(render(&Card {
        title: &title,
        size: 104,
        line: &line,
        hook: None,
        fix: None,
        stamp: None,
        verdict: None,
        score: None,
        date: None,
        height: 630,
        text: &text::ALL[0],
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
        let en = Text::of(None);
        assert_eq!(
            line(s, en),
            "No WebMCP tools: agents read ~12k tokens of this page instead. Score 20/100."
        );
        assert_eq!(
            line(s, Text::of(Some("pt-br"))),
            "Nenhuma ferramenta WebMCP: os agentes leem ~12k tokens desta página. Nota 20/100."
        );
        let s = Summary {
            verdict: Verdict::Ready,
            tools: 1,
            score: 90,
            ..s
        };
        assert_eq!(
            line(s, en),
            "1 WebMCP tool agents can call directly. Score 90/100."
        );
        let s = Summary {
            verdict: Verdict::Issues,
            tools: 2,
            score: 65,
            ..s
        };
        assert_eq!(
            line(s, en),
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
        let en = Text::of(None);
        let h = html(s, Format::Link, en);
        assert!(h.contains("&lt;x&gt;&amp;") && !h.contains("<x>&"));
        assert!(h.contains("Agent-ready: WebMCP tools checked with webmcpx"));
        assert!(h.contains("Scanned Nov 9, 2026"));
        assert!(h.contains("height:630px"));
        // The post image is 16:9, laid out at 1200×675.
        assert!(html(s, Format::Post, en).contains("height:675px"));
        assert_eq!(Format::Post.size(), (1200, 675, 4.0 / 3.0));
        // A site without tools gets the red "Not agent-ready" stamp.
        let missing = html(
            Summary {
                verdict: Verdict::Missing,
                ..s
            },
            Format::Link,
            en,
        );
        assert!(missing.contains(">Not agent-ready<"));
        assert!(missing.contains("oklch(0.58 0.21 27)"));
        // A cross on the red stamp; an agent-ready site carries the agent-ready badge itself instead of
        // a stamp; "almost" gets neither.
        let cross = r#"<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>"#;
        let check = r#"<div class="seal"><svg"#;
        assert!(missing.contains(cross) && !missing.contains(check));
        assert!(h.contains(check) && !h.contains(cross) && !h.contains(r#"class="stamp""#));
        assert!(!h.contains(r#"class="fix""#) && missing.contains(r#"class="fix""#));
        let almost = html(
            Summary {
                verdict: Verdict::Issues,
                ..s
            },
            Format::Link,
            en,
        );
        assert!(!almost.contains(check) && !almost.contains(cross));
        assert!(missing.contains("Is your site agent-ready? <span>webmcpx.dev</span>"));
    }

    /// A card saved or shared from a page in another language is in that language: stamp, line, score
    /// label, call to action and date.
    #[test]
    fn the_card_speaks_the_page_language() {
        let s = Summary {
            host: "easi.run",
            verdict: Verdict::Missing,
            tools: 0,
            page_tokens: 324,
            score: 25,
            lint_errors: false,
            scanned_on: "2026-11-09",
        };
        let h = html(s, Format::Post, Text::of(Some("pt-br")));
        assert!(h.contains(r#"<html lang="pt-BR">"#), "{h}");
        assert!(h.contains(">Não pronto para agentes<"), "{h}");
        // A light page: the finding alone, then what tools gave agents in the benchmark.
        assert!(
            h.contains(">Nenhuma ferramenta WebMCP para os agentes chamarem.<"),
            "{h}"
        );
        assert!(
            h.contains(">Com WebMCP: até 62× menos tokens no nosso benchmark.<"),
            "{h}"
        );
        assert!(h.contains(">Nota para agentes<"), "{h}");
        assert!(h.contains("E o seu site? <span>webmcpx.dev</span>"), "{h}");
        // No tools: where the fix starts, small, under the hook.
        assert!(
            h.contains(
                r#"<div class="fix">Adicione ferramentas WebMCP: webmcpx.dev/llms.txt</div>"#
            ),
            "{h}"
        );
        assert!(h.contains("Escaneado em 9 de nov. de 2026"), "{h}");
        assert!(!h.contains("Scan yours") && !h.contains("adivinh"), "{h}");
        let ja = html(s, Format::Post, Text::of(Some("ja")));
        assert!(ja.contains(">エージェント未対応<") && ja.contains("2026年11月9日"));
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

    /// The best case the cards quote is the landing's: every published run, and nothing else.
    #[test]
    fn the_quoted_best_case_covers_every_published_run() {
        let mut files: Vec<String> = std::fs::read_dir(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../site/src/lib/content/bench"
        ))
        .unwrap()
        .map(|e| e.unwrap().file_name().to_string_lossy().into_owned())
        .filter(|n| {
            std::path::Path::new(n)
                .extension()
                .is_some_and(|e| e == "json")
        })
        .collect();
        files.sort();
        let src = include_str!("card.rs");
        for f in &files {
            assert!(
                src.contains(&format!("content/bench/{f}\")")),
                "RUNS misses {f}"
            );
        }
        assert_eq!(files.len(), RUNS.len());
        assert_eq!(ratio(best_saving().unwrap()), "62\u{d7}");
    }

    /// Almost: the points still missing; agent-ready: no second line.
    #[test]
    fn hooks_by_verdict() {
        let en = Text::of(None);
        let s = Summary {
            host: "a.example",
            verdict: Verdict::Issues,
            tools: 2,
            page_tokens: 5000,
            score: 64,
            lint_errors: true,
            scanned_on: "2026-11-09",
        };
        assert_eq!(hook(s, en).as_deref(), Some("6 points to agent-ready."));
        assert_eq!(hook(Summary { score: 80, ..s }, en), None);
        assert_eq!(
            hook(
                Summary {
                    verdict: Verdict::Ready,
                    score: 90,
                    ..s
                },
                en
            ),
            None
        );
        let heavy = Summary {
            verdict: Verdict::Missing,
            tools: 0,
            page_tokens: 12_345,
            ..s
        };
        assert_eq!(
            what(heavy, en),
            "No WebMCP tools: agents read ~12k tokens of this page instead."
        );
        assert_eq!(
            hook(heavy, en).as_deref(),
            Some("With WebMCP: up to 62\u{d7} fewer tokens in our benchmark.")
        );
        assert!(!generic_html().contains("One line makes it"));
    }
}
