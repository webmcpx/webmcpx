use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};
use webmcpx_core::Annotation;

pub(crate) static RULE: Rule = Rule {
    name: "unknown-annotation",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Only WebMCP annotations have an effect.",
    why: "WebMCP defines readOnlyHint, untrustedContentHint, consequentialHint and debugging. \
        Other keys, including MCP's destructiveHint/idempotentHint/openWorldHint, are ignored \
        by hosts, so the safety signal you meant to send is lost.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        let Some(annotations) = tool.get("annotations").and_then(|f| f.value.as_obj()) else {
            continue;
        };
        for field in &annotations.fields {
            if Annotation::parse(&field.key).is_some() {
                continue;
            }
            let message = if Annotation::MCP_ONLY.contains(&field.key.as_str()) {
                format!(
                    "`{}` is an MCP annotation; WebMCP ignores it (use consequentialHint or readOnlyHint)",
                    field.key
                )
            } else {
                format!("`{}` is not a WebMCP annotation", field.key)
            };
            out.push(RULE.report(field.key_span, message));
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_unknown_keys() {
        assert_eq!(
            check(
                "unknown-annotation",
                "mc.registerTool({ annotations: { readOnlyHint: true, debugging: false } })"
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "unknown-annotation",
                "mc.registerTool({ annotations: { destructiveHint: true, fastHint: 1 } })"
            ),
            [
                "1:34 warning `destructiveHint` is an MCP annotation; WebMCP ignores it (use consequentialHint or readOnlyHint)",
                "1:57 warning `fastHint` is not a WebMCP annotation"
            ]
        );
    }
}
