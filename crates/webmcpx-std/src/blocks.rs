//! The block stream: how the loader hands page content to Rust in one string.
//!
//! Records are separated by `U+001E`, fields by `U+001F`: `kind`, `text`, `anchor`.
//! `kind` is `h1`..`h6`, `p`, `li`, `pre` or `quote` (anything else reads as `p`).
//! `anchor` is a URL to the block or its section and may be empty.

pub const RECORD: char = '\u{1E}';
pub const FIELD: char = '\u{1F}';

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Heading(u8),
    Paragraph,
    ListItem,
    Code,
    Quote,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Block<'a> {
    pub kind: Kind,
    pub text: &'a str,
    pub anchor: &'a str,
}

/// Parses a block stream. Never fails: malformed records degrade to paragraphs.
pub fn parse(stream: &str) -> impl Iterator<Item = Block<'_>> {
    stream
        .split(RECORD)
        .filter(|r| !r.is_empty())
        .map(|record| {
            let mut fields = record.splitn(3, FIELD);
            let kind = kind(fields.next().unwrap_or_default());
            let text = fields.next().unwrap_or_default();
            let anchor = fields.next().unwrap_or_default();
            Block { kind, text, anchor }
        })
}

fn kind(tag: &str) -> Kind {
    match tag.as_bytes() {
        [b'h', n @ b'1'..=b'6'] => Kind::Heading(n - b'0'),
        b"li" => Kind::ListItem,
        b"pre" => Kind::Code,
        b"quote" => Kind::Quote,
        _ => Kind::Paragraph,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec::Vec;

    #[test]
    fn parses_records() {
        let stream = "h2\u{1F}Intro\u{1F}#intro\u{1E}p\u{1F}Hello\u{1E}weird";
        let blocks: Vec<_> = parse(stream).collect();
        assert_eq!(
            blocks,
            [
                Block {
                    kind: Kind::Heading(2),
                    text: "Intro",
                    anchor: "#intro"
                },
                Block {
                    kind: Kind::Paragraph,
                    text: "Hello",
                    anchor: ""
                },
                Block {
                    kind: Kind::Paragraph,
                    text: "",
                    anchor: ""
                },
            ]
        );
    }
}
