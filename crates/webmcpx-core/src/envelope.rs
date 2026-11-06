use alloc::string::String;

use crate::Code;

/// The JSON result every webmcpx tool resolves with. Tools never reject for expected
/// failures: today the spec replaces a rejection reason with `UnknownError` (#282).
///
/// ```json
/// {"ok":true,"data":{..},"truncated":true,"next_cursor":"2000","hint":".."}
/// {"ok":false,"error":{"code":"NOT_FOUND","message":"..","retryable":false},"hint":".."}
/// ```
///
/// Built without serde to keep the WebAssembly module small.
#[derive(Debug, Default)]
pub struct Envelope {
    truncated: bool,
    next_cursor: Option<String>,
    hint: Option<String>,
}

impl Envelope {
    pub fn new() -> Self {
        Self::default()
    }

    /// Marks the result as partial; `next_cursor` continues it.
    #[must_use]
    pub fn truncated(mut self, next_cursor: String) -> Self {
        self.truncated = true;
        self.next_cursor = Some(next_cursor);
        self
    }

    #[must_use]
    pub fn hint(mut self, hint: impl Into<String>) -> Self {
        self.hint = Some(hint.into());
        self
    }

    /// Success. `data` must already be valid JSON.
    pub fn ok(self, data: &str) -> String {
        let mut out = String::with_capacity(data.len() + 64);
        out.push_str(r#"{"ok":true,"data":"#);
        out.push_str(data);
        if self.truncated {
            out.push_str(r#","truncated":true"#);
        }
        if let Some(cursor) = &self.next_cursor {
            out.push_str(r#","next_cursor":"#);
            push_json_str(&mut out, cursor);
        }
        self.finish(out)
    }

    /// Expected failure.
    pub fn err(self, code: Code, message: &str) -> String {
        let mut out = String::with_capacity(message.len() + 96);
        out.push_str(r#"{"ok":false,"error":{"code":""#);
        out.push_str(code.as_str());
        out.push_str(r#"","message":"#);
        push_json_str(&mut out, message);
        out.push_str(r#","retryable":"#);
        out.push_str(if code.retryable() { "true" } else { "false" });
        out.push('}');
        self.finish(out)
    }

    fn finish(self, mut out: String) -> String {
        if let Some(hint) = &self.hint {
            out.push_str(r#","hint":"#);
            push_json_str(&mut out, hint);
        }
        out.push('}');
        out
    }
}

/// Appends `s` to `out` as a JSON string literal.
pub fn push_json_str(out: &mut String, s: &str) {
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                const HEX: &[u8; 16] = b"0123456789abcdef";
                let n = c as usize;
                out.push_str("\\u00");
                out.push(HEX[n >> 4] as char);
                out.push(HEX[n & 0xF] as char);
            }
            c => out.push(c),
        }
    }
    out.push('"');
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ok_with_page() {
        let json = Envelope::new()
            .truncated("10".into())
            .hint("call again with cursor")
            .ok("[1]");
        assert_eq!(
            json,
            r#"{"ok":true,"data":[1],"truncated":true,"next_cursor":"10","hint":"call again with cursor"}"#
        );
    }

    #[test]
    fn err_shape() {
        let json = Envelope::new().err(Code::RateLimited, "slow \"down\"");
        assert_eq!(
            json,
            r#"{"ok":false,"error":{"code":"RATE_LIMITED","message":"slow \"down\"","retryable":true}}"#
        );
    }

    #[test]
    fn escapes_control_chars() {
        let mut out = String::new();
        push_json_str(&mut out, "a\u{1}\n");
        assert_eq!(out, r#""a\u0001\n""#);
    }
}
