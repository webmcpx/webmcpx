use alloc::borrow::ToOwned;
use alloc::string::String;

use webmcpx_core::unicode::invisible_chars;

/// Collapses whitespace runs to one space, trims, and drops invisible characters
/// (page text is untrusted: hidden characters can smuggle instructions to the model).
pub(crate) fn clean(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut hidden = invisible_chars(s).map(|(i, _)| i).peekable();
    let mut pending_space = false;
    for (i, c) in s.char_indices() {
        if hidden.peek() == Some(&i) {
            hidden.next();
            continue;
        }
        if c.is_whitespace() {
            pending_space = !out.is_empty();
        } else {
            if pending_space {
                out.push(' ');
                pending_space = false;
            }
            out.push(c);
        }
    }
    out
}

/// Like [`clean`] but keeps line structure (for code blocks).
pub(crate) fn clean_preformatted(s: &str) -> String {
    let stripped = webmcpx_core::unicode::strip_invisible(s);
    stripped.trim_matches('\n').trim_end().to_owned()
}

/// Appends an unsigned integer as decimal (avoids pulling `core::fmt` into wasm).
pub(crate) fn push_uint(out: &mut String, mut n: usize) {
    let mut buf = [0u8; 20];
    let mut i = buf.len();
    loop {
        i -= 1;
        buf[i] = b'0' + u8::try_from(n % 10).unwrap_or_default();
        n /= 10;
        if n == 0 {
            break;
        }
    }
    buf[i..].iter().for_each(|&d| out.push(d as char));
}

pub(crate) fn uint(n: usize) -> String {
    let mut s = String::new();
    push_uint(&mut s, n);
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cleans_whitespace_and_hidden_chars() {
        assert_eq!(clean("  a \n\t b\u{200B}c  "), "a bc");
        assert_eq!(clean(""), "");
    }

    #[test]
    fn keeps_code_lines() {
        assert_eq!(
            clean_preformatted("\nfn a() {\n  1\n}\n\n"),
            "fn a() {\n  1\n}"
        );
    }

    #[test]
    fn formats_integers() {
        assert_eq!(uint(0), "0");
        assert_eq!(uint(1_234_567), "1234567");
    }
}
