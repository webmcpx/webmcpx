use alloc::string::String;

use webmcpx_core::{Code, Envelope, limits, push_json_str};

use crate::blocks::{self, Kind};
use crate::text::{clean, clean_preformatted, push_uint, uint};

/// `fetch_as_markdown`: renders a block stream as Markdown, paged by characters.
///
/// `cursor` is the char offset to start from (`""` = start); `max_chars == 0` means the
/// default budget.
pub fn markdown(stream: &str, cursor: &str, max_chars: usize) -> String {
    let doc = render(stream);
    let total = doc.chars().count();
    if total == 0 {
        return Envelope::new()
            .hint("The page has no readable text. Try get_page_context.")
            .err(Code::NotFound, "no readable content on this page");
    }
    let Some(start) = parse_cursor(cursor).filter(|&s| s < total) else {
        return Envelope::new()
            .hint("Pass the next_cursor value from the previous result, or omit cursor.")
            .err(Code::InvalidInput, "cursor is not a valid position");
    };
    let budget = match max_chars {
        0 => limits::OUTPUT_DEFAULT,
        n => n.min(limits::OUTPUT_MAX),
    };

    let chunk: String = doc.chars().skip(start).take(budget).collect();
    let mut chunk = chunk.as_str();
    let mut end = start + chunk.chars().count();
    if end < total {
        // Prefer ending at a line break when one is in the second half of the chunk; the break stays in
        // this page, so the pages put back together are the document (code keeps its lines).
        if let Some(i) = chunk.rfind('\n').filter(|&i| i > chunk.len() / 2) {
            chunk = &chunk[..=i];
            end = start + chunk.chars().count();
        }
    }

    let mut data = String::with_capacity(chunk.len() + 48);
    data.push_str(r#"{"markdown":"#);
    push_json_str(&mut data, chunk);
    data.push_str(r#","total_chars":"#);
    push_uint(&mut data, total);
    data.push('}');

    if end < total {
        let mut hint = String::from("Returned characters ");
        push_uint(&mut hint, start);
        hint.push('-');
        push_uint(&mut hint, end);
        hint.push_str(" of ");
        push_uint(&mut hint, total);
        hint.push_str(". Call again with cursor=next_cursor for more.");
        Envelope::new().truncated(uint(end)).hint(hint).ok(&data)
    } else {
        Envelope::new().ok(&data)
    }
}

fn parse_cursor(cursor: &str) -> Option<usize> {
    if cursor.is_empty() {
        return Some(0);
    }
    cursor.bytes().try_fold(0usize, |n, b| {
        let digit = b.checked_sub(b'0').filter(|d| *d < 10)?;
        n.checked_mul(10)?.checked_add(usize::from(digit))
    })
}

fn render(stream: &str) -> String {
    let mut out = String::new();
    for block in blocks::parse(stream) {
        let text = match block.kind {
            Kind::Code => clean_preformatted(block.text),
            _ => clean(block.text),
        };
        if text.is_empty() {
            continue;
        }
        if !out.is_empty() {
            out.push_str(
                if block.kind == Kind::ListItem && out.ends_with_list_item() {
                    "\n"
                } else {
                    "\n\n"
                },
            );
        }
        match block.kind {
            Kind::Heading(level) => {
                (0..level).for_each(|_| out.push('#'));
                out.push(' ');
                out.push_str(&text);
            }
            Kind::ListItem => {
                out.push_str("- ");
                out.push_str(&text);
            }
            Kind::Code => {
                // A fence longer than any run of backticks in the code (a tutorial showing a ``` block),
                // so the code can't close it early (CommonMark).
                let fence = fence_len(&text);
                (0..fence).for_each(|_| out.push('`'));
                out.push('\n');
                out.push_str(&text);
                out.push('\n');
                (0..fence).for_each(|_| out.push('`'));
            }
            Kind::Quote => {
                out.push_str("> ");
                out.push_str(&text);
            }
            Kind::Paragraph => out.push_str(&text),
        }
    }
    out
}

/// Backticks for a code fence around `code`: at least three, and more than its longest backtick run.
fn fence_len(code: &str) -> usize {
    let (mut longest, mut run) = (0, 0);
    for c in code.chars() {
        run = if c == '`' { run + 1 } else { 0 };
        longest = longest.max(run);
    }
    (longest + 1).max(3)
}

trait LastLine {
    fn ends_with_list_item(&self) -> bool;
}

impl LastLine for String {
    fn ends_with_list_item(&self) -> bool {
        self.rsplit('\n')
            .next()
            .is_some_and(|l| l.starts_with("- "))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::borrow::ToOwned;

    const PAGE: &str = "h1\u{1F}Pizza  Maker\u{1E}p\u{1F}Build \u{200B}your pizza.\u{1E}\
        li\u{1F}Cheese\u{1E}li\u{1F}Basil\u{1E}pre\u{1F}\nsize = 'L'\n\u{1E}quote\u{1F}Best in town\u{1E}p\u{1F}   ";

    fn parse(json: &str) -> serde_json::Value {
        serde_json::from_str(json).unwrap()
    }

    #[test]
    fn renders_page() {
        insta::assert_snapshot!(parse(&markdown(PAGE, "", 0))["data"]["markdown"].as_str().unwrap(), @r"
        # Pizza Maker

        Build your pizza.

        - Cheese
        - Basil

        ```
        size = 'L'
        ```

        > Best in town
        ");
    }

    #[test]
    fn pages_through_long_content() {
        let full = parse(&markdown(PAGE, "", 0))["data"]["markdown"]
            .as_str()
            .unwrap()
            .to_owned();
        let (mut cursor, mut joined, mut calls) = (String::new(), String::new(), 0);
        loop {
            let page = parse(&markdown(PAGE, &cursor, 30));
            let chunk = page["data"]["markdown"].as_str().unwrap();
            assert!(chunk.chars().count() <= 30);
            joined.push_str(chunk);
            calls += 1;
            match page["next_cursor"].as_str() {
                Some(next) => cursor = next.to_owned(),
                None => break,
            }
        }
        assert!(calls > 2);
        // Pages put back together are the document, line breaks included (code stays code).
        assert_eq!(joined, full);
    }

    /// Code that shows a fenced block gets a longer fence, so the page after it stays text.
    #[test]
    fn fences_code_that_contains_fences() {
        let page = "pre\u{1F}```js\nlet a = 1;\n```\u{1E}p\u{1F}After the example.";
        let md = parse(&markdown(page, "", 0))["data"]["markdown"]
            .as_str()
            .unwrap()
            .to_owned();
        assert_eq!(
            md,
            "````\n```js\nlet a = 1;\n```\n````\n\nAfter the example."
        );
    }

    #[test]
    fn reports_expected_failures() {
        assert_eq!(parse(&markdown("", "", 0))["error"]["code"], "NOT_FOUND");
        assert_eq!(
            parse(&markdown(PAGE, "x", 0))["error"]["code"],
            "INVALID_INPUT"
        );
        assert_eq!(
            parse(&markdown(PAGE, "9999", 0))["error"]["code"],
            "INVALID_INPUT"
        );
    }
}
