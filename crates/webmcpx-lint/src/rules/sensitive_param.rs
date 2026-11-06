use super::{Ctx, Rule};
use crate::{Diagnostic, Severity};

pub(crate) static RULE: Rule = Rule {
    name: "sensitive-param",
    severity: Severity::Warning,
    preview: true,
    fixable: false,
    summary: "Tools should not ask the agent for secrets or payment data.",
    why: "Arguments pass through the model and its logs. Let the page's own session and UI \
        handle credentials, card data and national IDs (e.g. ask the user to confirm on the page).",
    check,
};

const SENSITIVE: &[&str] = &[
    "password",
    "passwd",
    "secret",
    "apikey",
    "api_key",
    "access_token",
    "auth_token",
    "card_number",
    "cardnumber",
    "cvv",
    "cvc",
    "ssn",
    "cpf",
    "iban",
    "pin",
];

fn check(ctx: &Ctx<'_>, out: &mut Vec<Diagnostic>) {
    for tool in ctx.tools {
        for (param, span, _) in tool.params() {
            let lower = param.to_ascii_lowercase();
            if let Some(hit) = SENSITIVE
                .iter()
                .find(|s| lower == **s || lower.ends_with(&format!("_{s}")))
            {
                out.push(RULE.report(
                    span,
                    format!("parameter `{param}` looks like sensitive data ({hit})"),
                ));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::test_util::check;

    #[test]
    fn flags_sensitive_names() {
        assert_eq!(
            check(
                "sensitive-param",
                "mc.registerTool({ inputSchema: { properties: { page_token: {}, spinner: {} } } })"
            ),
            [] as [&str; 0]
        );
        assert_eq!(
            check(
                "sensitive-param",
                "mc.registerTool({ inputSchema: { properties: { user_password: {}, CVV: {} } } })"
            ),
            [
                "1:48 warning parameter `user_password` looks like sensitive data (password)",
                "1:67 warning parameter `CVV` looks like sensitive data (cvv)"
            ]
        );
    }
}
