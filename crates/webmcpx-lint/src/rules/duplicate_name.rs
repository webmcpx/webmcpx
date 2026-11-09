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
    // (name, tool index) of each registration seen. Two in different arms of one if/else or ternary never
    // both run, so they don't clash.
    let mut seen: Vec<(&str, usize)> = Vec::new();
    for (i, tool) in ctx.tools.iter().enumerate() {
        if let Some((name, span)) = tool.str("name") {
            let branch = |j: usize| ctx.branches.get(j).map_or(&[][..], Vec::as_slice);
            let clash = seen.iter().any(|&(other, j)| {
                other == name && !crate::extract::exclusive(branch(i), branch(j))
            });
            if clash {
                out.push(RULE.report(span, format!("`{name}` is already registered in this file")));
            }
            seen.push((name, i));
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

    /// Only one branch of an if/else or a ternary runs: the same name in each is registered once.
    #[test]
    fn allows_one_registration_per_exclusive_branch() {
        for source in [
            r#"if (signedIn) { mc.registerTool({ name: "search" }); } else { mc.registerTool({ name: "search" }); }"#,
            r#"signedIn ? mc.registerTool({ name: "search" }) : mc.registerTool({ name: "search" });"#,
            r#"if (a) mc.registerTool({ name: "s" }); else if (b) mc.registerTool({ name: "s" }); else mc.registerTool({ name: "s" });"#,
        ] {
            assert!(check("duplicate-name", source).is_empty(), "{source}");
        }
        // The same branch, after the if/else, or inside a loop (each arm runs on some turn): both run.
        assert_eq!(
            check(
                "duplicate-name",
                r#"for (const on of [true, false]) { if (on) mc.registerTool({ name: "s" }); else mc.registerTool({ name: "s" }); }"#
            )
            .len(),
            1
        );
        assert_eq!(
            check(
                "duplicate-name",
                r#"if (a) { mc.registerTool({ name: "s" }); mc.registerTool({ name: "s" }); }"#
            )
            .len(),
            1
        );
        assert_eq!(
            check(
                "duplicate-name",
                r#"if (a) { mc.registerTool({ name: "s" }); } mc.registerTool({ name: "s" });"#
            )
            .len(),
            1
        );
    }
}
