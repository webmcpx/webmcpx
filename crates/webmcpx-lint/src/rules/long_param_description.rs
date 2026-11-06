use super::{Ctx, Rule, budget};
use crate::{Diagnostic, Severity};
use webmcpx_core::limits::{PARAM_DESCRIPTION_MAX, PARAM_DESCRIPTION_WARN};

pub(crate) static RULE: Rule = Rule {
    name: "long-param-description",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Parameter descriptions: warn above 150 characters, error above 500.",
    why: "Chrome recommends ≤ 150 characters per parameter; above 500 (webmcp#359) hosts may \
        truncate. Put usage guidance in the tool description instead.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        for (param, _, schema) in tool.params() {
            let Some((text, span)) = schema.str("description") else {
                continue;
            };
            let len = text.chars().count();
            if let Some(severity) = budget(len, PARAM_DESCRIPTION_WARN, PARAM_DESCRIPTION_MAX) {
                let mut d = RULE.report(span, format!("description of `{param}` is {len} characters (recommended ≤ {PARAM_DESCRIPTION_WARN}, max {PARAM_DESCRIPTION_MAX})"));
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
                r#"mc.registerTool({{ inputSchema: {{ properties: {{ q: {{ description: "{}" }} }} }} }})"#,
                "x".repeat(n)
            )
        };
        assert_eq!(check("long-param-description", &src(150)), [] as [&str; 0]);
        assert_eq!(
            check("long-param-description", &src(151)),
            ["1:66 warning description of `q` is 151 characters (recommended ≤ 150, max 500)"]
        );
        assert_eq!(
            check("long-param-description", &src(501)),
            ["1:66 error description of `q` is 501 characters (recommended ≤ 150, max 500)"]
        );
    }
}
