use super::{Ctx, Rule};
use crate::node::Node;
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "missing-annotations",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Declare the tool's effect with `annotations`.",
    why: "Hosts and agents decide whether to ask the user before a call from `readOnlyHint` and \
        `consequentialHint` (both default to false). Set `readOnlyHint: true` on tools that only \
        read; set `consequentialHint: true` on tools that buy, send, delete or publish.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        let declared = match tool.get("annotations").map(|f| &f.value) {
            None => false,
            Some(Node::Obj(obj)) => !obj.fields.is_empty(),
            Some(_) => true,
        };
        if !declared {
            out.push(RULE.report(
                tool.anchor(),
                format!(
                    "`{}` declares no annotations (readOnlyHint, consequentialHint)",
                    tool.label()
                ),
            ));
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_tools_without_annotations() {
        assert_eq!(
            check(
                "missing-annotations",
                r#"mc.registerTool({ name: "a", annotations: { readOnlyHint: true } })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "missing-annotations",
                r#"mc.registerTool({ name: "a", annotations: {} })"#
            ),
            ["1:25 warning `a` declares no annotations (readOnlyHint, consequentialHint)"]
        );
    }
}
