/// Byte range in the linted source.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct Span {
    pub start: u32,
    pub end: u32,
}

impl Span {
    pub const fn new(start: u32, end: u32) -> Self {
        Self { start, end }
    }
}

impl From<oxc_span::Span> for Span {
    fn from(span: oxc_span::Span) -> Self {
        Self::new(span.start, span.end)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Warning,
    Error,
}

impl Severity {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Warning => "warning",
            Self::Error => "error",
        }
    }
}

/// One finding. Diagnostics are data, not errors.
#[derive(Debug, Clone, PartialEq)]
pub struct Diagnostic {
    /// Stable kebab-case rule name (public API).
    pub rule: &'static str,
    pub severity: Severity,
    pub message: String,
    pub span: Span,
    pub fix: Option<Fix>,
}

/// A safe, behavior-preserving change applied by `--fix`.
#[derive(Debug, Clone, PartialEq)]
pub struct Fix {
    pub message: String,
    pub edits: Vec<Edit>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Edit {
    pub span: Span,
    pub replacement: String,
}

/// 1-based line and column (in chars) of a byte offset.
pub fn line_col(source: &str, offset: u32) -> (usize, usize) {
    let offset = (offset as usize).min(source.len());
    let before = source.get(..offset).unwrap_or(source);
    let line_start = before.rfind('\n').map_or(0, |i| i + 1);
    let line = before.matches('\n').count() + 1;
    (line, before[line_start..].chars().count() + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn computes_line_and_column() {
        let src = "ab\ncé\nx";
        assert_eq!(line_col(src, 0), (1, 1));
        assert_eq!(line_col(src, 3), (2, 1));
        assert_eq!(line_col(src, 7), (3, 1));
    }
}
