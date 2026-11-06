use super::{Ctx, Rule, budget};
use crate::{Diagnostic, Severity};
use webmcpx_core::limits::{TOOLS_MAX, TOOLS_WARN};

pub(crate) static RULE: Rule = Rule {
    name: "tool-budget",
    severity: Severity::Warning,
    preview: false,
    fixable: false,
    summary: "A file should register at most 20 tools (error above 100).",
    why: "Tool selection degrades past ~20 tools, and hosts have silently disabled WebMCP for \
        whole pages that registered 126–296 (webmcp#293). Consolidate tools by task, or \
        register them per route.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    let count = ctx.tools.len();
    if let (Some(severity), Some(last)) = (budget(count, TOOLS_WARN, TOOLS_MAX), ctx.tools.last()) {
        let mut d = RULE.report(
            last.anchor(),
            format!("{count} tools in one file (recommended ≤ {TOOLS_WARN}, max {TOOLS_MAX})"),
        );
        d.severity = severity;
        out.push(d);
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn counts_tools() {
        let src = |n: usize| "mc.registerTool({});\n".repeat(n);
        assert_eq!(check("tool-budget", &src(20)), [] as [&str; 0]);
        assert_eq!(
            check("tool-budget", &src(21)),
            ["21:17 warning 21 tools in one file (recommended ≤ 20, max 100)"]
        );
        assert_eq!(
            check("tool-budget", &src(101))[0],
            "101:17 error 101 tools in one file (recommended ≤ 20, max 100)"
        );
    }
}
