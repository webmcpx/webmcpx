use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "missing-param-description",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Every input parameter should have a `description`.",
    why: "Without one the model guesses the format from the name alone, the most common source \
        of invalid arguments. Say what the value is and its format, e.g. \"ISO date, 2026-11-06\".",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        for (param, span, schema) in tool.params() {
            if schema.lacks("description") {
                out.push(RULE.report(
                    span,
                    format!(
                        "parameter `{param}` of `{}` has no description",
                        tool.label()
                    ),
                ));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_undescribed_params() {
        assert_eq!(
            check(
                "missing-param-description",
                r#"mc.registerTool({ name: "a", inputSchema: { type: "object", properties: { q: { type: "string" }, n: { type: "number", description: "Count." } } } })"#
            ),
            ["1:75 warning parameter `q` of `a` has no description"]
        );
    }
}
