//! Finds tool definitions in a source file.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    ArrayExpressionElement, CallExpression, Expression, ObjectPropertyKind, StaticMemberExpression,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

use crate::node::{Field, Node, Obj};
use crate::{Diagnostic, Severity, Span};

#[derive(Default)]
pub(crate) struct Extracted {
    pub(crate) tools: Vec<Obj>,
    pub(crate) unresolved: usize,
    /// Deprecated API uses: (span, what).
    pub(crate) legacy: Vec<(Span, &'static str)>,
    pub(crate) errors: Vec<Diagnostic>,
}

pub(crate) fn extract(path: &Path, source: &str) -> Extracted {
    let allocator = Allocator::default();
    let is_json = path.extension().is_some_and(|e| e == "json");
    let mut out = Extracted::default();
    if is_json {
        match Parser::new(&allocator, source, SourceType::mjs()).parse_expression() {
            Ok(expr) => manifest(convert(&expr), &mut out),
            Err(errors) => out
                .errors
                .extend(errors.iter().map(|e| syntax_error(e.to_string()))),
        }
        return out;
    }
    let source_type = SourceType::from_path(path).unwrap_or_else(|_| SourceType::mjs());
    let parsed = Parser::new(&allocator, source, source_type).parse();
    out.errors.extend(
        parsed
            .diagnostics
            .iter()
            .map(|e| syntax_error(e.to_string())),
    );
    Finder { out: &mut out }.visit_program(&parsed.program);
    out
}

fn syntax_error(message: String) -> Diagnostic {
    Diagnostic {
        rule: "syntax-error",
        severity: Severity::Error,
        message,
        span: Span::default(),
        fix: None,
    }
}

/// A manifest is a tool, an array of tools, or `{ "tools": [...] }`.
fn manifest(root: Node, out: &mut Extracted) {
    match root {
        Node::Arr { items, .. } => items.into_iter().for_each(|item| push_tool(item, out)),
        Node::Obj(obj)
            if matches!(
                obj.get("tools"),
                Some(Field {
                    value: Node::Arr { .. },
                    ..
                })
            ) =>
        {
            if let Some(Node::Arr { items, .. }) = obj
                .fields
                .into_iter()
                .rev()
                .find(|f| f.key == "tools")
                .map(|f| f.value)
            {
                for item in items {
                    push_tool(item, out);
                }
            }
        }
        node @ Node::Obj(_) => push_tool(node, out),
        _ => {}
    }
}

fn push_tool(node: Node, out: &mut Extracted) {
    match node {
        Node::Obj(obj) => out.tools.push(obj),
        _ => out.unresolved += 1,
    }
}

struct Finder<'o> {
    out: &'o mut Extracted,
}

impl<'a> Visit<'a> for Finder<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        let method = call
            .callee
            .as_member_expression()
            .and_then(oxc_ast::ast::MemberExpression::static_property_name)
            .and_then(
                #[expect(
                    clippy::redundant_closure_for_method_calls,
                    reason = "JSStr lives in oxc_str, not a dependency"
                )]
                |name| name.as_str(),
            );
        let first = call.arguments.first().and_then(|a| a.as_expression());
        match method {
            Some("registerTool") => match first.map(convert) {
                Some(Node::Obj(obj)) => self.out.tools.push(obj),
                _ => self.out.unresolved += 1,
            },
            Some(api @ ("provideContext" | "clearContext")) => {
                let api = if api == "provideContext" {
                    "provideContext"
                } else {
                    "clearContext"
                };
                self.out.legacy.push((call.span.into(), api));
                if let Some(expr) = first {
                    manifest(convert(expr), self.out);
                }
            }
            _ => {}
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_static_member_expression(&mut self, member: &StaticMemberExpression<'a>) {
        if member.property.name.as_str() == "modelContext"
            && member.object.is_specific_id("navigator")
        {
            self.out
                .legacy
                .push((member.span.into(), "navigator.modelContext"));
        }
        walk::walk_static_member_expression(self, member);
    }
}

fn convert(expr: &Expression<'_>) -> Node {
    let span = Span::from(expr.span());
    match expr.without_parentheses() {
        Expression::StringLiteral(lit) => Node::Str {
            value: js_str(lit.value.as_str()),
            span,
        },
        Expression::TemplateLiteral(lit) => {
            lit.single_quasi()
                .map_or(Node::Dynamic(span), |s| Node::Str {
                    value: js_str(s.as_str()),
                    span,
                })
        }
        Expression::NumericLiteral(_) => Node::Num(span),
        Expression::BooleanLiteral(_) => Node::Bool(span),
        Expression::NullLiteral(_) => Node::Null(span),
        Expression::ArrayExpression(arr) => Node::Arr {
            items: arr
                .elements
                .iter()
                .map(|el| match el {
                    ArrayExpressionElement::SpreadElement(_)
                    | ArrayExpressionElement::Elision(_) => Node::Dynamic(el.span().into()),
                    el => el.as_expression().map_or(Node::Dynamic(span), convert),
                })
                .collect(),
            span,
        },
        Expression::ObjectExpression(obj) => Node::Obj(Obj {
            span,
            fields: obj
                .properties
                .iter()
                .filter_map(|prop| match prop {
                    ObjectPropertyKind::ObjectProperty(p) => Some(Field {
                        key: p.key.static_name()?.as_str()?.to_owned(),
                        key_span: p.key.span().into(),
                        value: if p.method {
                            Node::Dynamic(p.span.into())
                        } else {
                            convert(&p.value)
                        },
                    }),
                    ObjectPropertyKind::SpreadProperty(_) => None,
                })
                .collect(),
        }),
        Expression::TSAsExpression(e) => convert(&e.expression),
        Expression::TSSatisfiesExpression(e) => convert(&e.expression),
        _ => Node::Dynamic(span),
    }
}

/// Lone surrogates cannot be represented in Rust strings (rare); replace the value.
fn js_str(s: Option<&str>) -> String {
    s.unwrap_or("\u{FFFD}").to_owned()
}
