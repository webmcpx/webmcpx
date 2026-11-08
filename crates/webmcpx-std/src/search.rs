use alloc::borrow::ToOwned;
use alloc::string::String;
use alloc::vec::Vec;

use webmcpx_core::{Code, Envelope, limits, push_json_str};

use crate::blocks::{self, Kind};
use crate::text::clean;

const DEFAULT_LIMIT: usize = 5;
const MAX_LIMIT: usize = 20;
const MAX_TERMS: usize = 32;
const SNIPPET_CHARS: usize = 240;
/// A heading is context for a snippet, not content: a page must not fill the answer with one.
const HEADING_CHARS: usize = 120;
// BM25 parameters (Robertson & Zaragoza defaults).
const K1: f32 = 1.2;
const B: f32 = 0.75;

/// A passage keeps only what ranking needs: per query term, how often it occurs (heading included),
/// and its length in tokens. No token lists: a long heading over many paragraphs would be copied into
/// each one.
struct Passage {
    heading: usize,
    anchor: String,
    text: String,
    tf: Vec<u32>,
    len: usize,
}

/// How often each term occurs in `tokens`, and how many tokens there are.
fn counts(text: &str, terms: &[String]) -> (Vec<u32>, usize) {
    let mut tf = alloc::vec![0u32; terms.len()];
    let mut len = 0;
    for token in tokenize(text) {
        len += 1;
        if let Some(i) = terms.iter().position(|t| *t == token) {
            tf[i] += 1;
        }
    }
    (tf, len)
}

/// `search_page`: ranks the passages of a block stream against `query` with BM25.
///
/// `limit == 0` means the default. Matching is case-insensitive for ASCII letters.
pub fn search(stream: &str, query: &str, limit: usize) -> String {
    // A query is a few words; past MAX_TERMS the rest are ignored, so memory stays passages × 32.
    let mut terms = dedup(tokenize(query));
    terms.truncate(MAX_TERMS);
    if terms.is_empty() {
        return Envelope::new().err(Code::InvalidInput, "query must contain a word");
    }
    let limit = match limit {
        0 => DEFAULT_LIMIT,
        n => n.min(MAX_LIMIT),
    };

    let (headings, passages) = passages(stream, &terms);
    let mut ranked = rank(&passages, terms.len());
    if ranked.is_empty() {
        return Envelope::new()
            .hint("Try fewer or different words, or read the page with fetch_as_markdown.")
            .err(Code::NotFound, "no passage matches the query");
    }
    ranked.truncate(limit);

    // Results in rank order while they fit the output budget (URLs come from the page and are never
    // cut: a result that does not fit is left out).
    let mut data = String::from(r#"{"results":["#);
    let mut kept = 0;
    for &(index, _) in &ranked {
        let p = &passages[index];
        let mut entry = String::from(r#"{"heading":"#);
        push_json_str(&mut entry, &headings[p.heading]);
        entry.push_str(r#","snippet":"#);
        push_json_str(&mut entry, &snippet(&p.text, &terms));
        entry.push_str(r#","url":"#);
        push_json_str(&mut entry, &p.anchor);
        entry.push('}');
        if data.len() + entry.len() + 3 > limits::OUTPUT_MAX {
            break;
        }
        if kept > 0 {
            data.push(',');
        }
        data.push_str(&entry);
        kept += 1;
    }
    if kept == 0 {
        return Envelope::new()
            .hint("Read the page with fetch_as_markdown instead.")
            .err(
                Code::ResultTooLarge,
                "the best match is over the output budget",
            );
    }
    data.push_str("]}");
    Envelope::new().ok(&data)
}

/// The display headings (shortened), and the passages that point into them.
fn passages(stream: &str, terms: &[String]) -> (Vec<String>, Vec<Passage>) {
    let mut headings = alloc::vec![String::new()];
    // The current heading, searched in full: its term counts and length, once.
    let (mut heading_tf, mut heading_len) = (alloc::vec![0u32; terms.len()], 0);
    let mut heading_anchor = "";
    let mut out = Vec::new();
    for block in blocks::parse(stream) {
        let text = clean(block.text);
        if let Kind::Heading(_) = block.kind {
            (heading_tf, heading_len) = counts(&text, terms);
            headings.push(shorten(text, HEADING_CHARS));
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
        let (mut tf, len) = counts(&text, terms);
        for (t, h) in tf.iter_mut().zip(&heading_tf) {
            *t += h;
        }
        out.push(Passage {
            heading: headings.len() - 1,
            anchor: anchor.to_owned(),
            text,
            tf,
            len: len + heading_len,
        });
    }
    (headings, out)
}

/// (passage index, score), best first; ties keep document order.
fn rank(passages: &[Passage], terms: usize) -> Vec<(usize, f32)> {
    #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
    let (n, avg_len) = {
        let n = passages.len() as f32;
        let total: usize = passages.iter().map(|p| p.len).sum();
        (n, total as f32 / n.max(1.0))
    };
    #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
    let idf: Vec<f32> = (0..terms)
        .map(|j| {
            let df = passages.iter().filter(|p| p.tf[j] > 0).count() as f32;
            libm::logf((n - df + 0.5) / (df + 0.5) + 1.0)
        })
        .collect();

    let mut scored: Vec<(usize, f32)> = passages
        .iter()
        .enumerate()
        .filter_map(|(i, p)| {
            #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
            let len = p.len as f32;
            let score: f32 =
                p.tf.iter()
                    .zip(&idf)
                    .map(|(&tf, idf)| {
                        #[expect(clippy::cast_precision_loss, reason = "page-sized counts")]
                        let tf = tf as f32;
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

/// `text` cut to `max` chars, marked with an ellipsis when cut.
fn shorten(text: String, max: usize) -> String {
    match text.char_indices().nth(max) {
        Some((byte, _)) => {
            let mut out = text[..byte].to_owned();
            out.push('…');
            out
        }
        None => text,
    }
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

    #[test]
    fn output_stays_within_budget() {
        let long = "w".repeat(30_000);
        let mut page = format!("h2\u{1F}{long}\u{1F}https://x.test/#h\u{1E}");
        for _ in 0..5 {
            page.push_str("p\u{1F}pricing is fair\u{1E}");
        }
        let out = search(&page, "pricing", 20);
        assert!(out.len() <= limits::OUTPUT_MAX + 100, "{} chars", out.len());
        let v = parse(&out);
        assert_eq!(v["data"]["results"].as_array().unwrap().len(), 5);
        assert!(
            v["data"]["results"][0]["heading"]
                .as_str()
                .unwrap()
                .chars()
                .count()
                <= HEADING_CHARS + 1
        );
        // An anchor past the whole budget is never cut: the result is left out.
        let huge = format!("p\u{1F}pricing\u{1F}https://x.test/#{}", "a".repeat(30_000));
        assert_eq!(
            parse(&search(&huge, "pricing", 5))["error"]["code"],
            "RESULT_TOO_LARGE"
        );
    }

    #[test]
    fn a_long_heading_is_searched_in_full() {
        let heading = format!("{} refunds", "Policy ".repeat(30));
        let page = format!(
            "h2\u{1F}{heading}\u{1F}https://x.test/#r\u{1E}p\u{1F}Contact support within 30 days.\u{1E}"
        );
        let v = parse(&search(&page, "refunds", 5));
        assert_eq!(v["data"]["results"][0]["url"], "https://x.test/#r");
    }

    #[test]
    fn a_long_heading_over_many_paragraphs_is_kept_once() {
        let heading = "word ".repeat(2_000);
        let mut page = format!("h2\u{1F}{heading}\u{1F}https://x.test/#h\u{1E}");
        for _ in 0..1_000 {
            page.push_str("p\u{1F}short paragraph\u{1E}");
        }
        let (headings, passages) = passages(&page, &["word".into()]);
        assert_eq!(headings.len(), 2);
        assert!(passages.iter().all(|p| p.tf == [2_000] && p.len == 2_002));
    }

    #[test]
    fn a_query_counts_at_most_max_terms_words() {
        let query: String = (0..5_000).map(|i| format!("w{i} ")).collect();
        let page = "p\u{1F}w0 here\u{1E}";
        let v = parse(&search(page, &query, 5));
        assert_eq!(v["data"]["results"][0]["snippet"], "w0 here");
        let (_, passages) = passages(page, &dedup(tokenize(&query))[..MAX_TERMS]);
        assert_eq!(passages[0].tf.len(), MAX_TERMS);
    }
}
