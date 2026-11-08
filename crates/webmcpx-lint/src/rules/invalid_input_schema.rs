use super::{Ctx, Rule};
use crate::node::Node;
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "invalid-input-schema",
    severity: Severity::Error,
    preview: false,
    fixable: false,
    summary: "`inputSchema` must be a JSON Schema object with `\"type\": \"object\"`.",
    why: "Agents call tools with a single arguments object. Any other schema type is \
        unusable, and hosts reject or ignore it.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        let Some(field) = tool.get("inputSchema") else {
            continue;
        };
        match &field.value {
            Node::Obj(schema) => match schema.str("type") {
                Some(("object", _)) => {}
                Some((other, span)) => out.push(
                    RULE.report(span, format!("schema type is `{other}`, expected `object`")),
                ),
                // Unknown, not wrong: a dynamic `type`, or none written after a spread that may supply it.
                None if schema
                    .get("type")
                    .map_or(schema.open, |f| f.value.is_dynamic()) => {}
                None => out
                    .push(RULE.report(schema.span, "schema has no `\"type\": \"object\"`".into())),
            },
            Node::Dynamic(_) => {}
            other => out.push(RULE.report(other.span(), "`inputSchema` must be an object".into())),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_non_object_schemas() {
        assert_eq!(
            check(
                "invalid-input-schema",
                r#"mc.registerTool({ name: "a", inputSchema: { type: "object" } })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "invalid-input-schema",
                r#"mc.registerTool({ name: "a", inputSchema: SCHEMA })"#
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "invalid-input-schema",
                r#"mc.registerTool({ inputSchema: { type: "string" } }); mc.registerTool({ inputSchema: {} }); mc.registerTool({ inputSchema: "x" })"#
            ),
            [
                "1:40 error schema type is `string`, expected `object`",
                "1:86 error schema has no `\"type\": \"object\"`",
                "1:124 error `inputSchema` must be an object"
            ]
        );
    }
}
