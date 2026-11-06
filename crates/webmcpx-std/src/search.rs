use alloc::borrow::ToOwned;
use alloc::string::String;
use alloc::vec::Vec;

use webmcpx_core::{Code, Envelope, push_json_str};

use crate::blocks::{self, Kind};
use crate::text::clean;

const DEFAULT_LIMIT: usize = 5;
const MAX_LIMIT: usize = 20;
const SNIPPET_CHARS: usize = 240;
// BM25 parameters (Robertson & Zaragoza defaults).
const K1: f32 = 1.2;
const B: f32 = 0.75;

struct Passage {
    heading: String,
    anchor: String,
    text: String,
    tokens: Vec<String>,
}

/// `search_page`: ranks the passages of a block stream against `query` with BM25.
///
/// `limit == 0` means the default. Matching is case-insensitive for ASCII letters.
pub fn search(stream: &str, query: &str, limit: usize) -> String {
    let terms = dedup(tokenize(query));
    if terms.is_empty() {
        return Envelope::new().err(Code::InvalidInput, "query must contain a word");
    }
    let limit = match limit {
        0 => DEFAULT_LIMIT,
        n => n.min(MAX_LIMIT),
    };

    let passages = passages(stream);
    let mut ranked = rank(&passages, &terms);
    if ranked.is_empty() {
        return Envelope::new()
            .hint("Try fewer or different words, or read the page with fetch_as_markdown.")
            .err(Code::NotFound, "no passage matches the query");
    }
    ranked.truncate(limit);

    let mut data = String::from(r#"{"results":["#);
    for (i, &(index, _)) in ranked.iter().enumerate() {
        let p = &passages[index];
        if i > 0 {
            data.push(',');
        }
        data.push_str(r#"{"heading":"#);
        push_json_str(&mut data, &p.heading);
        data.push_str(r#","snippet":"#);
        push_json_str(&mut data, &snippet(&p.text, &terms));
        data.push_str(r#","url":"#);
        push_json_str(&mut data, &p.anchor);
        data.push('}');
    }
    data.push_str("]}");
    Envelope::new().ok(&data)
}

fn passages(stream: &str) -> Vec<Passage> {
    let mut heading = String::new();
    let mut heading_anchor = "";
    let mut out = Vec::new();
    for block in blocks::parse(stream) {
        let text = clean(block.text);
        if let Kind::Heading(_) = block.kind {
            heading = text;
            heading_anchor = block.anchor;
            continue;
        }
        if text.is_empty() {
            continue;
        }
        let anchor = if block.anchor.is_empty() {
            heading_anchor
        } else {
            block.anchor
        };
        let mut tokens = tokenize(&heading);
        tokens.extend(tokenize(&text));
        out.push(Passage {
            tokens,
            heading: heading.clone(),
            anchor: anchor.to_owned(),
            text,
        });
    }
    out
}

/// (passage index, score), best first; ties keep document order.
fn rank(passages: &[Passage], terms: &[String]) -> Vec<(usize, f32)> {
    #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
    let (n, avg_len) = {
        let n = passages.len() as f32;
        let total: usize = passages.iter().map(|p| p.tokens.len()).sum();
        (n, total as f32 / n.max(1.0))
    };
    #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
    let idf: Vec<f32> = terms
        .iter()
        .map(|t| {
            let df = passages.iter().filter(|p| p.tokens.contains(t)).count() as f32;
            libm::logf((n - df + 0.5) / (df + 0.5) + 1.0)
        })
        .collect();

    let mut scored: Vec<(usize, f32)> = passages
        .iter()
        .enumerate()
        .filter_map(|(i, p)| {
            #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
            let len = p.tokens.len() as f32;
            let score: f32 = terms
                .iter()
                .zip(&idf)
                .map(|(t, idf)| {
                    #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
                    let tf = p.tokens.iter().filter(|x| *x == t).count() as f32;
                    idf * tf * (K1 + 1.0) / (tf + K1 * (1.0 - B + B * len / avg_len.max(1.0)))
                })
                .sum();
            (score > 0.0).then_some((i, score))
        })
        .collect();
    // Unstable sort is smaller in wasm; the index tiebreak keeps document order.
    scored.sort_unstable_by(|a, b| b.1.total_cmp(&a.1).then(a.0.cmp(&b.0)));
    scored
}

fn tokenize(s: &str) -> Vec<String> {
    s.split(is_separator)
        .filter(|w| !w.is_empty())
        .map(str::to_ascii_lowercase)
        .collect()
}

/// Word separators without Unicode tables (they would add kilobytes to the wasm module):
/// ASCII non-alphanumerics, Latin-1 punctuation and the General Punctuation block.
fn is_separator(c: char) -> bool {
    if c.is_ascii() {
        return !c.is_ascii_alphanumeric();
    }
    matches!(c as u32, 0x80..=0xBF | 0xD7 | 0xF7 | 0x2000..=0x206F | 0x3000..=0x3002)
}

fn dedup(mut terms: Vec<String>) -> Vec<String> {
    let mut seen = Vec::with_capacity(terms.len());
    terms.retain(|t| {
        let new = !seen.contains(t);
        if new {
            seen.push(t.clone());
        }
        new
    });
    terms
}

/// A window of the passage around the first matching term.
fn snippet(text: &str, terms: &[String]) -> String {
    let chars: Vec<char> = text.chars().collect();
    if chars.len() <= SNIPPET_CHARS {
        return text.to_owned();
    }
    let lower = text.to_ascii_lowercase();
    let first_hit = terms
        .iter()
        .filter_map(|t| lower.find(t.as_str()))
        .min()
        .map_or(0, |byte| text[..byte].chars().count());
    let start = first_hit.saturating_sub(SNIPPET_CHARS / 4);
    let end = (start + SNIPPET_CHARS).min(chars.len());
    let start = end.saturating_sub(SNIPPET_CHARS);
    let mut out = String::new();
    if start > 0 {
        out.push('…');
    }
    out.extend(&chars[start..end]);
    if end < chars.len() {
        out.push('…');
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::format;

    const PAGE: &str = "h1\u{1F}Menu\u{1F}https://x.test/#menu\u{1E}\
        p\u{1F}We bake Neapolitan pizza in a wood oven.\u{1E}\
        h2\u{1F}Delivery\u{1F}https://x.test/#delivery\u{1E}\
        p\u{1F}Delivery takes 30 minutes. Delivery is free above 20 euros.\u{1E}\
        p\u{1F}Opening hours: 18h to 23h.\u{1F}https://x.test/#hours";

    fn parse(json: &str) -> serde_json::Value {
        serde_json::from_str(json).unwrap()
    }

    #[test]
    fn ranks_by_relevance() {
        insta::assert_json_snapshot!(parse(&search(PAGE, "free DELIVERY", 2)), @r#"
        {
          "data": {
            "results": [
              {
                "heading": "Delivery",
                "snippet": "Delivery takes 30 minutes. Delivery is free above 20 euros.",
                "url": "https://x.test/#delivery"
              },
              {
                "heading": "Delivery",
                "snippet": "Opening hours: 18h to 23h.",
                "url": "https://x.test/#hours"
              }
            ]
          },
          "ok": true
        }
        "#);
    }

    #[test]
    fn reports_expected_failures() {
        assert_eq!(
            parse(&search(PAGE, " ?! ", 0))["error"]["code"],
            "INVALID_INPUT"
        );
        assert_eq!(
            parse(&search(PAGE, "sushi", 0))["error"]["code"],
            "NOT_FOUND"
        );
    }

    #[test]
    fn snippets_window_around_match() {
        let text = format!("{} needle {}", "a ".repeat(300), "b ".repeat(300));
        let s = snippet(&text, &["needle".to_owned()]);
        assert!(s.contains("needle") && s.starts_with('…') && s.ends_with('…'));
    }
}
