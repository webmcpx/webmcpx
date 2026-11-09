//! The rule registry. Adding a rule: create `rules/<name>.rs` with a `RULE` static and
//! tests, then add one line to `RULES`. Rule names are stable public API; new rules
//! start with `preview: true`.

use crate::node::Obj;
use crate::{Diagnostic, Severity, Span};

mod duplicate_name;
mod invalid_input_schema;
mod invalid_name;
mod invisible_unicode;
mod legacy_api;
mod long_description;
mod long_name;
mod long_param_description;
mod missing_annotations;
mod missing_description;
mod missing_param_description;
mod sensitive_param;
mod tool_budget;
mod unknown_annotation;

/// Every rule, in documentation order.
pub static RULES: &[&Rule] = &[
    &invalid_name::RULE,
    &long_name::RULE,
    &duplicate_name::RULE,
    &missing_description::RULE,
    &long_description::RULE,
    &invisible_unicode::RULE,
    &invalid_input_schema::RULE,
    &missing_param_description::RULE,
    &long_param_description::RULE,
    &missing_annotations::RULE,
    &unknown_annotation::RULE,
    &tool_budget::RULE,
    &legacy_api::RULE,
    &sensitive_param::RULE,
];

/// Looks a rule up by name.
pub fn find(name: &str) -> Option<&'static Rule> {
    RULES.iter().copied().find(|r| r.name == name)
}

#[derive(Debug)]
pub struct Rule {
    /// Stable kebab-case name.
    pub name: &'static str,
    /// Default severity (some rules escalate to `Error` past a hard limit).
    pub severity: Severity,
    /// Preview rules only run with `--preview` and may change in any release.
    pub preview: bool,
    /// Whether the rule offers a safe `--fix`.
    pub fixable: bool,
    /// One line: what the rule checks.
    pub summary: &'static str,
    /// Why it matters and how to fix it.
    pub why: &'static str,
    pub(crate) check: fn(&Ctx<'_>, &mut Vec<Diagnostic>),
}

impl Rule {
    pub(crate) fn report(&self, span: Span, message: String) -> Diagnostic {
        Diagnostic {
            rule: self.name,
            severity: self.severity,
            message,
            span,
            fix: None,
        }
    }
}

/// What a rule sees: one file.
pub(crate) struct Ctx<'a> {
    pub(crate) source: &'a str,
    pub(crate) tools: &'a [Obj],
    /// Per tool, the if/else and ternary arms it sits in (`extract::exclusive`).
    pub(crate) branches: &'a [crate::extract::Branches],
    pub(crate) legacy: &'a [(Span, &'static str)],
}

/// Severity for a length with a soft (`warn`) and hard (`max`) limit.
pub(crate) fn budget(len: usize, warn: usize, max: usize) -> Option<Severity> {
    if len > max {
        Some(Severity::Error)
    } else if len > warn {
        Some(Severity::Warning)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_are_unique_kebab_case() {
        for (i, rule) in RULES.iter().enumerate() {
            assert!(
                rule.name
                    .bytes()
                    .all(|b| b.is_ascii_lowercase() || b == b'-'),
                "{}",
                rule.name
            );
            assert!(
                RULES[..i].iter().all(|r| r.name != rule.name),
                "{}",
                rule.name
            );
            assert!(
                !rule.summary.is_empty() && !rule.why.is_empty(),
                "{}",
                rule.name
            );
        }
    }
}
