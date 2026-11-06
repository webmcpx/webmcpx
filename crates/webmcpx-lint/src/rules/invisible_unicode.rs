use super::{Ctx, Rule};
use crate::node::Node;
use crate::{Diagnostic, Edit, Fix, Severity, Span};
use webmcpx_core::unicode::invisible_chars;

pub(crate) static RULE: Rule = Rule {
    name: "invisible-unicode",
    severity: Severity::Error,
    preview: false,
    fixable: true,
    summary: "No invisible characters (zero-width, bidi controls, tags) in tool text.",
    why: "Reviewers cannot see them but models read them, so they can smuggle instructions \
        (webmcp#360, Trojan Source). `--fix` deletes the ones written literally in the source.",
    check,
};

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        for field in &tool.fields {
            field.value.walk(&mut |node| {
                if let Node::Str { value, span } = node {
                    report(ctx.source, value, *span, out);
                }
            });
        }
    }
}

fn report(source: &str, value: &str, span: Span, out: &mut Vec<Diagnostic>) {
    let found: Vec<char> = invisible_chars(value).map(|(_, c)| c).collect();
    let Some(first) = found.first() else { return };
    let literal = source
        .get(span.start as usize..span.end as usize)
        .unwrap_or_default();
    let edits: Vec<Edit> = invisible_chars(literal)
        .map(|(i, c)| {
            let start = span.start + u32::try_from(i).unwrap_or_default();
            let end = start + u32::try_from(c.len_utf8()).unwrap_or_default();
            Edit {
                span: Span::new(start, end),
                replacement: String::new(),
            }
        })
        .collect();
    let mut d = RULE.report(
        span,
        format!(
            "{} invisible character(s), first U+{:04X}",
            found.len(),
            u32::from(*first)
        ),
    );
    if !edits.is_empty() {
        d.fix = Some(Fix {
            message: "remove invisible characters".into(),
            edits,
        });
    }
    out.push(d);
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;
    use std::path::Path;

    const SRC: &str = "mc.registerTool({ name: \"a\", description: \"Search\u{200B} \u{202E}now\", \
        inputSchema: { properties: { q: { description: \"q\\u200b\" } } } })";

    #[test]
    fn flags_and_fixes() {
        assert_eq!(
            check("invisible-unicode", SRC),
            [
                "1:43 error 2 invisible character(s), first U+200B",
                "1:106 error 1 invisible character(s), first U+200B"
            ]
        );
        let report = crate::lint(Path::new("a.js"), SRC, &crate::Options::default());
        let fixed = crate::apply_fixes(SRC, &report.diagnostics).unwrap();
        assert!(fixed.contains("\"Search now\""));
        // Escaped sequences are visible in source: reported, not rewritten.
        assert!(fixed.contains("q\\u200b"));
    }
}
