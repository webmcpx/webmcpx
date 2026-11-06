use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "duplicate-name",
    severity: Severity::Error,
    preview: false,
    fixable: false,
    summary: "Each tool name may be registered once per document.",
    why: "A second `registerTool()` with the same name rejects with `InvalidStateError`. \
        Rename one tool, or abort the first registration's `signal` before registering again.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    let mut seen: Vec<&str> = Vec::new();
    for tool in ctx.tools {
        if let Some((name, span)) = tool.str("name") {
            if seen.contains(&name) {
                out.push(RULE.report(span, format!("`{name}` is already registered in this file")));
            } else {
                seen.push(name);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_duplicates() {
        assert_eq!(
            check(
                "duplicate-name",
                r#"mc.registerTool({ name: "a" }); mc.registerTool({ name: "b" }); mc.registerTool({ name: "a" });"#
            ),
            ["1:89 error `a` is already registered in this file"]
        );
    }
}
