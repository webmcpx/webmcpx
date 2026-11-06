use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "invalid-name",
    severity: Severity::Error,
    preview: false,
    fixable: false,
    summary: "Tool names must match `[A-Za-z0-9_.-]{1,128}`.",
    why: "`registerTool()` rejects any other name with `InvalidStateError`, so the tool never \
        reaches the agent. Use snake_case, e.g. `search_products`.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        match tool.get("name") {
            None => out.push(RULE.report(tool.span, "tool has no `name`".into())),
            Some(field) => match field.value.as_str() {
                Some(name) => {
                    if let Err(e) = webmcpx_core::validate_name(name) {
                        out.push(RULE.report(field.value.span(), e.to_string()));
                    }
                }
                None if field.value.is_dynamic() => {}
                None => out.push(RULE.report(field.value.span(), "`name` must be a string".into())),
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_invalid_names() {
        assert_eq!(
            check(
                "invalid-name",
                r#"mc.registerTool({ name: "search_site", description: "d" })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check("invalid-name", "mc.registerTool({ name: NAME })"),
            [] as [&str; 0]
        );
        insta::assert_debug_snapshot!(check("invalid-name", r#"
mc.registerTool({ name: "search site" });
mc.registerTool({ description: "no name" });
mc.registerTool({ name: 42 });"#), @r#"
        [
            "2:25 error tool name contains ' '; only A-Z, a-z, 0-9, '_', '.' and '-' are allowed",
            "3:17 error tool has no `name`",
            "4:25 error `name` must be a string",
        ]
        "#);
    }
}
