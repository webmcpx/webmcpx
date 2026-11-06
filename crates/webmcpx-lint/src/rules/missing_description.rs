use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "missing-description",
    severity: Severity::Error,
    preview: false,
    fixable: false,
    summary: "Tools need a non-empty `description`.",
    why: "`registerTool()` rejects an empty description, and the description is the only thing \
        a model reads to decide when to call the tool. Say what it does and when to use it.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        match tool.get("description") {
            None => out.push(RULE.report(
                tool.anchor(),
                format!("`{}` has no description", tool.label()),
            )),
            Some(field) => {
                if field.value.as_str().is_some_and(|d| d.trim().is_empty()) {
                    out.push(RULE.report(
                        field.value.span(),
                        format!("`{}` has an empty description", tool.label()),
                    ));
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_missing_descriptions() {
        assert_eq!(
            check(
                "missing-description",
                r#"mc.registerTool({ name: "a", description: "Does a." })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "missing-description",
                r#"mc.registerTool({ name: "a", description: t("a") })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "missing-description",
                r#"mc.registerTool({ name: "a" }); mc.registerTool({ name: "b", description: "  " })"#
            ),
            [
                "1:25 error `a` has no description",
                "1:75 error `b` has an empty description"
            ]
        );
    }
}
