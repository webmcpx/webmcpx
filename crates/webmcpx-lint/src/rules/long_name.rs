use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};
use webmcpx_core::limits::NAME_WARN;

pub(crate) static RULE: Rule = Rule {
    name: "long-name",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Tool names should be at most 30 characters.",
    why: "Chrome's WebMCP guidance caps names at 30 characters; long names cost tokens on every \
        turn and are harder for models to pick. Move detail into the description.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        if let Some((name, span)) = tool.str("name") {
            let len = name.chars().count();
            if len > NAME_WARN && webmcpx_core::validate_name(name).is_ok() {
                out.push(RULE.report(
                    span,
                    format!("name is {len} characters (recommended ≤ {NAME_WARN})"),
                ));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_long_names() {
        assert_eq!(
            check("long-name", r#"mc.registerTool({ name: "short" })"#),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "long-name",
                r#"mc.registerTool({ name: "search_products_by_category_and_price" })"#
            ),
            ["1:25 warning name is 37 characters (recommended ≤ 30)"]
        );
    }
}
