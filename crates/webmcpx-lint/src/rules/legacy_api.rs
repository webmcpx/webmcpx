use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "legacy-api",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "Use `document.modelContext.registerTool()`, not removed origin-trial APIs.",
    why: "`navigator.modelContext` is deprecated and `provideContext()`/`clearContext()` were \
        removed from the spec; some agent browsers expose a frozen object where they throw. \
        Register each tool with `registerTool()` and unregister by aborting its `signal`.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for &(span, what) in ctx.legacy {
        let message = match what {
            "navigator.modelContext" => {
                "`navigator.modelContext` is deprecated; use `document.modelContext`".into()
            }
            api => format!(
                "`{api}()` was removed from WebMCP; use `registerTool()` with an AbortSignal"
            ),
        };
        out.push(RULE.report(span, message));
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_legacy_apis() {
        assert_eq!(
            check("legacy-api", "document.modelContext.registerTool({})"),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "legacy-api",
                "navigator.modelContext.provideContext({ tools: [] })"
            ),
            [
                "1:1 warning `provideContext()` was removed from WebMCP; use `registerTool()` with an AbortSignal",
                "1:1 warning `navigator.modelContext` is deprecated; use `document.modelContext`"
            ]
        );
    }
}
