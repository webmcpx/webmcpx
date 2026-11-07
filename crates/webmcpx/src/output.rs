//! Every output format. JSON shapes here are public API (`schema_version`).

use std::io::{IsTerminal, Result, Write};

use serde_json::{Value, json};
use webmcpx_core::Code;
use webmcpx_lint::rules::{RULES, Rule};
use webmcpx_lint::{Diagnostic, Severity, line_col};

use crate::files::FileResult;
use crate::{Failure, Format};

const SCHEMA_VERSION: u32 = 1;
/// Where a rule is documented: its source file, which states what it checks and why.
fn rule_docs(name: &str) -> String {
    format!(
        "https://github.com/webmcpx/webmcpx/blob/main/crates/webmcpx-lint/src/rules/{}.rs",
        name.replace('-', "_")
    )
}

fn envelope(ok: bool, data: &Value) -> Value {
    json!({ "schema_version": SCHEMA_VERSION, "ok": ok, "data": data })
}

fn write_json(out: &mut impl Write, value: &Value) -> Result<()> {
    serde_json::to_writer_pretty(&mut *out, value)?;
    writeln!(out)
}

pub(crate) fn failure(out: &mut impl Write, format: Format, f: &Failure) -> Result<()> {
    match format {
        Format::Json | Format::Sarif => write_json(
            out,
            &json!({
                "schema_version": SCHEMA_VERSION,
                "ok": false,
                "error": { "code": f.code.as_str(), "message": f.message, "retryable": f.code.retryable() },
                "hint": f.hint,
            }),
        ),
        _ => {
            let mut err = std::io::stderr().lock();
            writeln!(
                err,
                "error: {} ({})\nhint: {}",
                f.message,
                f.code.as_str(),
                f.hint
            )
        }
    }
}

/// Writes lint results; returns the number of error diagnostics.
pub(crate) fn lint(out: &mut impl Write, format: Format, results: &[FileResult]) -> Result<usize> {
    let count = |s: Severity| {
        results
            .iter()
            .flat_map(|r| &r.report.diagnostics)
            .filter(|d| d.severity == s)
            .count()
    };
    let (errors, warnings) = (count(Severity::Error), count(Severity::Warning));
    match format {
        Format::Human => human(out, results, errors, warnings)?,
        Format::Concise => {
            for r in results {
                for d in &r.report.diagnostics {
                    let (line, col) = line_col(&r.source, d.span.start);
                    writeln!(
                        out,
                        "{}:{line}:{col}: {} [{}] {}",
                        r.path,
                        d.severity.as_str(),
                        d.rule,
                        d.message
                    )?;
                }
            }
        }
        Format::Json => write_json(
            out,
            &envelope(
                errors == 0,
                &json!({
                    "diagnostics": results.iter().flat_map(|r| r.report.diagnostics.iter().map(move |d| diagnostic_json(r, d))).collect::<Vec<_>>(),
                    "summary": {
                        "files": results.len(),
                        "tools": results.iter().map(|r| r.report.tools).sum::<usize>(),
                        "unresolved": results.iter().map(|r| r.report.unresolved).sum::<usize>(),
                        "errors": errors,
                        "warnings": warnings,
                        "fixed": results.iter().map(|r| r.fixed).sum::<usize>(),
                    },
                }),
            ),
        )?,
        Format::Sarif => write_json(out, &sarif(results))?,
        Format::Github => {
            for r in results {
                for d in &r.report.diagnostics {
                    let (line, col) = line_col(&r.source, d.span.start);
                    let (end_line, end_col) = line_col(&r.source, d.span.end);
                    let level = if d.severity == Severity::Error {
                        "error"
                    } else {
                        "warning"
                    };
                    writeln!(
                        out,
                        "::{level} file={},line={line},col={col},endLine={end_line},endColumn={end_col},title=webmcpx ({})::{}",
                        r.path,
                        d.rule,
                        d.message.replace('%', "%25").replace('\n', "%0A")
                    )?;
                }
            }
        }
    }
    Ok(errors)
}

fn diagnostic_json(r: &FileResult, d: &Diagnostic) -> Value {
    let (line, column) = line_col(&r.source, d.span.start);
    let (end_line, end_column) = line_col(&r.source, d.span.end);
    json!({
        "file": r.path,
        "line": line, "column": column, "end_line": end_line, "end_column": end_column,
        "rule": d.rule,
        "severity": d.severity.as_str(),
        "message": d.message,
        "fix": d.fix.as_ref().map(|f| json!({
            "message": f.message,
            "edits": f.edits.iter().map(|e| json!({ "start": e.span.start, "end": e.span.end, "replacement": e.replacement })).collect::<Vec<_>>(),
        })),
        "url": rule_docs(&d.rule),
    })
}

struct Style {
    on: bool,
}

impl Style {
    /// Color only on a terminal, honoring `NO_COLOR` and `TERM=dumb` (clig.dev).
    fn detect() -> Self {
        let on = std::io::stdout().is_terminal()
            && std::env::var_os("NO_COLOR").is_none()
            && std::env::var("TERM").map_or(true, |t| t != "dumb");
        Self { on }
    }

    fn paint(&self, code: &str, text: &str) -> String {
        if self.on {
            format!("\x1b[{code}m{text}\x1b[0m")
        } else {
            text.to_owned()
        }
    }
}

fn human(
    out: &mut impl Write,
    results: &[FileResult],
    errors: usize,
    warnings: usize,
) -> Result<()> {
    let style = Style::detect();
    let mut fixable = 0;
    for r in results {
        for d in &r.report.diagnostics {
            let (line, col) = line_col(&r.source, d.span.start);
            let label = match d.severity {
                Severity::Error => style.paint("1;31", "error"),
                Severity::Warning => style.paint("1;33", "warning"),
            };
            writeln!(
                out,
                "{}:{line}:{col}: {label}[{}] {}",
                style.paint("1", &r.path),
                d.rule,
                d.message
            )?;
            if let Some(text) = r
                .source
                .lines()
                .nth(line.saturating_sub(1))
                .filter(|_| d.span.end > 0)
            {
                let width = (d.span.end - d.span.start).max(1) as usize;
                let width = width.min(text.chars().count().saturating_sub(col - 1).max(1));
                writeln!(out, "  {} {text}", style.paint("34", "|"))?;
                writeln!(
                    out,
                    "  {} {}{}",
                    style.paint("34", "|"),
                    " ".repeat(col - 1),
                    style.paint("1;31", &"^".repeat(width))
                )?;
            }
            if d.fix.is_some() {
                fixable += 1;
            }
        }
    }
    let tools: usize = results.iter().map(|r| r.report.tools).sum();
    let unresolved: usize = results.iter().map(|r| r.report.unresolved).sum();
    let fixed: usize = results.iter().map(|r| r.fixed).sum();
    if errors + warnings == 0 {
        writeln!(
            out,
            "{} {tools} tool(s) in {} file(s), no problems.",
            style.paint("32", "✓"),
            results.len()
        )?;
    } else {
        writeln!(
            out,
            "\n{errors} error(s), {warnings} warning(s) in {tools} tool(s)."
        )?;
    }
    if fixed > 0 {
        writeln!(out, "Fixed {fixed} problem(s).")?;
    }
    if fixable > 0 {
        writeln!(out, "{fixable} fixable with `webmcpx lint --fix`.")?;
    }
    if unresolved > 0 {
        writeln!(
            out,
            "{unresolved} registerTool() call(s) not analyzed: the argument is not a literal object."
        )?;
    }
    Ok(())
}

fn rule_json(rule: &Rule) -> Value {
    json!({
        "name": rule.name,
        "severity": rule.severity.as_str(),
        "preview": rule.preview,
        "fixable": rule.fixable,
        "summary": rule.summary,
        "why": rule.why,
        "url": rule_docs(rule.name),
    })
}

pub(crate) fn rules(out: &mut impl Write, format: Format) -> Result<()> {
    if matches!(format, Format::Json | Format::Sarif) {
        return write_json(
            out,
            &envelope(
                true,
                &json!({ "rules": RULES.iter().map(|r| rule_json(r)).collect::<Vec<_>>() }),
            ),
        );
    }
    let width = RULES.iter().map(|r| r.name.len()).max().unwrap_or_default();
    for rule in RULES {
        let mut tags = String::from(rule.severity.as_str());
        if rule.fixable {
            tags.push_str(", fix");
        }
        if rule.preview {
            tags.push_str(", preview");
        }
        writeln!(out, "{:width$}  {:<22}  {}", rule.name, tags, rule.summary)?;
    }
    Ok(())
}

pub(crate) fn rule(out: &mut impl Write, format: Format, rule: &Rule) -> Result<()> {
    if matches!(format, Format::Json | Format::Sarif) {
        return write_json(out, &envelope(true, &rule_json(rule)));
    }
    writeln!(
        out,
        "{} ({}{})\n\n{}\n\n{}\n\n{}",
        rule.name,
        rule.severity.as_str(),
        if rule.preview { ", preview" } else { "" },
        rule.summary,
        rule.why,
        rule_docs(rule.name)
    )
}

pub(crate) fn explain(out: &mut impl Write, format: Format, code: Code) -> Result<()> {
    if matches!(format, Format::Json | Format::Sarif) {
        return write_json(
            out,
            &envelope(
                true,
                &json!({
                    "code": code.as_str(), "retryable": code.retryable(), "explanation": code.explain(),
                }),
            ),
        );
    }
    writeln!(
        out,
        "{} (retryable: {})\n\n{}",
        code.as_str(),
        code.retryable(),
        code.explain()
    )
}

fn sarif(results: &[FileResult]) -> Value {
    let rules: Vec<Value> = RULES
        .iter()
        .map(|r| {
            let mut rule = json!({
                "id": r.name,
                "shortDescription": { "text": r.summary },
                "fullDescription": { "text": r.why },
                "helpUri": rule_docs(r.name),
                "defaultConfiguration": { "level": sarif_level(r.severity) },
            });
            if matches!(r.name, "invisible-unicode" | "sensitive-param") {
                rule["properties"] = json!({ "tags": ["security"], "security-severity": "7.0" });
            }
            rule
        })
        .collect();
    let findings: Vec<Value> = results
        .iter()
        .flat_map(|r| r.report.diagnostics.iter().map(move |d| (r, d)))
        .map(|(r, d)| {
            let (line, col) = line_col(&r.source, d.span.start);
            let (end_line, end_col) = line_col(&r.source, d.span.end);
            json!({
                "ruleId": d.rule,
                "level": sarif_level(d.severity),
                "message": { "text": d.message },
                "locations": [{ "physicalLocation": {
                    "artifactLocation": { "uri": r.path },
                    "region": { "startLine": line, "startColumn": col, "endLine": end_line, "endColumn": end_col },
                }}],
                "partialFingerprints": { "webmcpx/v1": fingerprint(&[d.rule, &r.path, &d.message]) },
            })
        })
        .collect();
    json!({
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "version": "2.1.0",
        "runs": [{
            "tool": { "driver": {
                "name": "webmcpx",
                "version": env!("CARGO_PKG_VERSION"),
                "informationUri": "https://webmcpx.dev",
                "rules": rules,
            }},
            "results": findings,
        }],
    })
}

const fn sarif_level(severity: Severity) -> &'static str {
    match severity {
        Severity::Error => "error",
        Severity::Warning => "warning",
    }
}

/// FNV-1a: stable across runs and platforms (unlike `DefaultHasher`).
fn fingerprint(parts: &[&str]) -> String {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in parts.iter().flat_map(|p| p.bytes().chain([0])) {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x0100_0000_01b3);
    }
    format!("{hash:016x}")
}

#[cfg(test)]
mod docs_tests {
    use super::rule_docs;

    /// Every rule's docs link is a file in this repository.
    #[test]
    fn every_rule_links_to_its_source() {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../..");
        for rule in webmcpx_lint::rules::RULES {
            let url = rule_docs(rule.name);
            let path = url
                .strip_prefix("https://github.com/webmcpx/webmcpx/blob/main/")
                .unwrap();
            assert!(root.join(path).is_file(), "{} -> {url}", rule.name);
        }
    }
}
