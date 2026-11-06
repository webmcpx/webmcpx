use super::{Ctx, Rule, budget};
use crate::{Diagnostic, Severity};
use webmcpx_core::limits::{DESCRIPTION_MAX, DESCRIPTION_WARN};

pub(crate) static RULE: Rule = Rule {
    name: "long-description",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Descriptions: warn above 500 characters, error above 750.",
    why: "Every description is sent on every turn. Chrome recommends ≤ 500 characters; above 750 \
        (webmcp#359) hosts may truncate silently, which is how prices and caveats disappear.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        if let Some((text, span)) = tool.str("description") {
            let len = text.chars().count();
            if let Some(severity) = budget(len, DESCRIPTION_WARN, DESCRIPTION_MAX) {
                let mut d = RULE.report(span, format!("description is {len} characters (recommended ≤ {DESCRIPTION_WARN}, max {DESCRIPTION_MAX})"));
                d.severity = severity;
                out.push(d);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn grades_by_length() {
        let src = |n: usize| {
            format!(
                r#"mc.registerTool({{ name: "a", description: "{}" }})"#,
                "x".repeat(n)
            )
        };
        assert_eq!(check("long-description", &src(500)), [] as [&str; 0]);
        assert_eq!(
            check("long-description", &src(501)),
            ["1:43 warning description is 501 characters (recommended ≤ 500, max 750)"]
        );
        assert_eq!(
            check("long-description", &src(751)),
            ["1:43 error description is 751 characters (recommended ≤ 500, max 750)"]
        );
    }
}
