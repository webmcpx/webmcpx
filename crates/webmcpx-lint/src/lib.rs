//! Linter for WebMCP tool definitions.
//!
//! Finds `registerTool({...})` calls in JS/TS (and tools in JSON manifests), then runs
//! every [rule](rules::RULES) over the statically known parts. Rules reuse the
//! validators of `webmcpx-core`, so the linter and the runtime never disagree.

mod diagnostic;
mod extract;
mod node;
pub mod rules;

use std::path::Path;

pub use diagnostic::{Diagnostic, Edit, Fix, Severity, Span, line_col};

/// Which rules run.
#[derive(Debug, Default, Clone)]
pub struct Options {
    /// Also run rules still in preview (outside semver).
    pub preview: bool,
    /// Rule names to skip.
    pub ignore: Vec<String>,
}

/// The result of linting one file.
#[derive(Debug, Default)]
pub struct Report {
    /// Sorted by position, then rule name.
    pub diagnostics: Vec<Diagnostic>,
    /// Tools found and analyzed.
    pub tools: usize,
    /// `registerTool()` calls whose argument is not a literal object (not analyzed).
    pub unresolved: usize,
}

/// Lints `source`; `path` only selects the language (`.json`, `.ts`, `.js`, ...).
pub fn lint(path: &Path, source: &str, options: &Options) -> Report {
    let extracted = extract::extract(path, source);
    let ctx = rules::Ctx {
        source,
        tools: &extracted.tools,
        legacy: &extracted.legacy,
    };
    let mut diagnostics = extracted.errors;
    for rule in rules::RULES {
        let enabled = (options.preview || !rule.preview)
            && !options.ignore.iter().any(|name| name == rule.name);
        if enabled {
            (rule.check)(&ctx, &mut diagnostics);
        }
    }
    diagnostics.sort_by(|a, b| (a.span.start, a.rule).cmp(&(b.span.start, b.rule)));
    Report {
        diagnostics,
        tools: extracted.tools.len(),
        unresolved: extracted.unresolved,
    }
}

/// Applies every fix in `diagnostics`. Returns `None` when there is nothing to change.
/// Overlapping edits are skipped (a re-run applies them).
pub fn apply_fixes(source: &str, diagnostics: &[Diagnostic]) -> Option<String> {
    let mut edits: Vec<&Edit> = diagnostics
        .iter()
        .filter_map(|d| d.fix.as_ref())
        .flat_map(|f| &f.edits)
        .collect();
    if edits.is_empty() {
        return None;
    }
    edits.sort_by_key(|e| e.span.start);
    let mut out = String::with_capacity(source.len());
    let mut last = 0;
    for edit in edits {
        let (start, end) = (edit.span.start as usize, edit.span.end as usize);
        if start < last {
            continue;
        }
        out.push_str(&source[last..start]);
        out.push_str(&edit.replacement);
        last = end;
    }
    out.push_str(&source[last..]);
    Some(out)
}

#[cfg(test)]
pub(crate) mod test_util {
    use std::path::Path;

    /// Runs one rule over a JS snippet: `["line:col severity message", ...]`.
    pub(crate) fn check(rule: &str, source: &str) -> Vec<String> {
        let options = crate::Options {
            preview: true,
            ignore: crate::rules::RULES
                .iter()
                .map(|r| r.name.to_owned())
                .filter(|name| name != rule)
                .collect(),
        };
        crate::lint(Path::new("test.js"), source, &options)
            .diagnostics
            .iter()
            .map(|d| {
                let (line, col) = crate::line_col(source, d.span.start);
                format!("{line}:{col} {} {}", d.severity.as_str(), d.message)
            })
            .collect()
    }
}
