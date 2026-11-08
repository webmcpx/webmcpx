//! Characters a human reviewer cannot see but a model reads (webmachinelearning/webmcp#360).
//!
//! Covers Unicode `Default_Ignorable_Code_Point`, bidi controls (Trojan Source) and tag
//! characters. ZWJ and emoji variation selectors are allowed right after a pictograph,
//! where they are part of a visible emoji.

use alloc::string::String;

/// Returns true if `c` is invisible when rendered.
pub fn is_invisible(c: char) -> bool {
    matches!(
        c as u32,
        0x00AD
            | 0x034F
            | 0x061C
            | 0x115F..=0x1160
            | 0x17B4..=0x17B5
            | 0x180B..=0x180F
            | 0x200B..=0x200F
            | 0x202A..=0x202E
            | 0x2060..=0x206F
            | 0x3164
            | 0xFE00..=0xFE0F
            | 0xFEFF
            | 0xFFA0
            | 0xFFF0..=0xFFF8
            | 0x1BCA0..=0x1BCA3
            | 0x1D173..=0x1D17A
            | 0xE0000..=0xE0FFF
    )
}

/// Returns true if `c` is a pictograph that an emoji joiner may follow (kept after one).
pub fn is_pictograph(c: char) -> bool {
    matches!(c as u32, 0x2190..=0x2BFF | 0x1F000..=0x1FAFF)
}

/// Returns true if `c` joins or styles an emoji (ZWJ, VS15, VS16): kept right after a pictograph.
pub fn joins_emoji(c: char) -> bool {
    matches!(c, '\u{200D}' | '\u{FE0E}' | '\u{FE0F}')
}

/// Byte offsets and chars of every invisible character in `s`.
///
/// ```
/// let hits: Vec<_> = webmcpx_core::unicode::invisible_chars("a\u{200B}b").collect();
/// assert_eq!(hits, [(1, '\u{200B}')]);
/// ```
pub fn invisible_chars(s: &str) -> impl Iterator<Item = (usize, char)> + '_ {
    let mut prev = None;
    s.char_indices().filter(move |&(_, c)| {
        let allowed = joins_emoji(c) && prev.is_some_and(is_pictograph);
        prev = Some(c);
        is_invisible(c) && !allowed
    })
}

/// `s` without invisible characters.
pub fn strip_invisible(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut last = 0;
    for (i, c) in invisible_chars(s) {
        out.push_str(&s[last..i]);
        last = i + c.len_utf8();
    }
    out.push_str(&s[last..]);
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloc::vec::Vec;

    #[test]
    fn finds_hidden_characters() {
        let s = "ok\u{200B}\u{202E}\u{E0041}";
        let found: Vec<char> = invisible_chars(s).map(|(_, c)| c).collect();
        assert_eq!(found, ['\u{200B}', '\u{202E}', '\u{E0041}']);
        assert_eq!(strip_invisible(s), "ok");
    }

    #[test]
    fn keeps_visible_text_and_emoji() {
        let s = "Olá, señor! ❤\u{FE0F} 👩\u{200D}💻";
        assert_eq!(invisible_chars(s).count(), 0);
        assert_eq!(strip_invisible(s), s);
    }

    #[test]
    fn flags_joiner_outside_emoji() {
        assert_eq!(invisible_chars("a\u{200D}b").count(), 1);
    }
}
