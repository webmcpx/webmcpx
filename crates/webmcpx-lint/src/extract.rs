//! Finds tool definitions in a source file.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    ArrayExpressionElement, CallExpression, ConditionalExpression, DoWhileStatement, Expression,
    ForInStatement, ForOfStatement, ForStatement, IfStatement, ObjectPropertyKind,
    StaticMemberExpression, WhileStatement,
};
use oxc_ast_visit::{Visit, walk};
use oxc_diagnostics::OxcDiagnostic;
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

use crate::node::{Field, Node, Obj};
use crate::{Diagnostic, Severity, Span};

#[derive(Default)]
pub(crate) struct Extracted {
    pub(crate) tools: Vec<Obj>,
    /// For each tool, the branches it sits in: (if/else or ternary, which arm). Two tools in different arms
    /// of the same branch never both run.
    pub(crate) branches: Vec<Branches>,
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
            Err(errors) => out.errors.extend(errors.iter().map(syntax_error)),
        }
        return out;
    }
    let source_type = SourceType::from_path(path).unwrap_or_else(|_| SourceType::mjs());
    let parsed = Parser::new(&allocator, source, source_type).parse();
    out.errors
        .extend(parsed.diagnostics.iter().map(syntax_error));
    Finder {
        out: &mut out,
        path: Vec::new(),
        next: 0,
        loops: 0,
    }
    .visit_program(&parsed.program);
    out
}

/// A parse error, where the parser points (its first label; the file's start when it gives none).
fn syntax_error(e: &OxcDiagnostic) -> Diagnostic {
    let span = e.labels.first().map_or_else(Span::default, |label| {
        Span::new(label.offset(), label.offset().saturating_add(label.len()))
    });
    Diagnostic {
        rule: "syntax-error",
        severity: Severity::Error,
        message: e.to_string(),
        span,
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
        Node::Obj(obj) => {
            out.tools.push(obj);
            out.branches.push(Vec::new());
        }
        _ => out.unresolved += 1,
    }
}

/// The branches a registration sits in: (branch id, arm).
pub(crate) type Branches = Vec<(u32, u8)>;

/// Whether two registrations are in different arms of one if/else or ternary: only one of them runs.
pub(crate) fn exclusive(a: &[(u32, u8)], b: &[(u32, u8)]) -> bool {
    a.iter().any(|&(id, arm)| {
        b.iter()
            .any(|&(other, other_arm)| other == id && other_arm != arm)
    })
}

struct Finder<'o> {
    out: &'o mut Extracted,
    /// The if/else and ternary arms being visited.
    path: Branches,
    next: u32,
    /// Inside a loop, both arms of an if/else can run (on different turns): none is exclusive there.
    loops: u32,
}

impl Finder<'_> {
    /// A new branch: its id, to tag each arm with.
    fn branch(&mut self) -> u32 {
        self.next += 1;
        self.next
    }
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
                Some(Node::Obj(obj)) => {
                    self.out.tools.push(obj);
                    self.out.branches.push(self.path.clone());
                }
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

    fn visit_for_statement(&mut self, stmt: &ForStatement<'a>) {
        self.loops += 1;
        walk::walk_for_statement(self, stmt);
        self.loops -= 1;
    }

    fn visit_for_in_statement(&mut self, stmt: &ForInStatement<'a>) {
        self.loops += 1;
        walk::walk_for_in_statement(self, stmt);
        self.loops -= 1;
    }

    fn visit_for_of_statement(&mut self, stmt: &ForOfStatement<'a>) {
        self.loops += 1;
        walk::walk_for_of_statement(self, stmt);
        self.loops -= 1;
    }

    fn visit_while_statement(&mut self, stmt: &WhileStatement<'a>) {
        self.loops += 1;
        walk::walk_while_statement(self, stmt);
        self.loops -= 1;
    }

    fn visit_do_while_statement(&mut self, stmt: &DoWhileStatement<'a>) {
        self.loops += 1;
        walk::walk_do_while_statement(self, stmt);
        self.loops -= 1;
    }

    fn visit_if_statement(&mut self, stmt: &IfStatement<'a>) {
        if self.loops > 0 {
            return walk::walk_if_statement(self, stmt);
        }
        let id = self.branch();
        self.visit_expression(&stmt.test);
        self.path.push((id, 0));
        self.visit_statement(&stmt.consequent);
        self.path.pop();
        if let Some(alternate) = &stmt.alternate {
            self.path.push((id, 1));
            self.visit_statement(alternate);
            self.path.pop();
        }
    }

    fn visit_conditional_expression(&mut self, expr: &ConditionalExpression<'a>) {
        if self.loops > 0 {
            return walk::walk_conditional_expression(self, expr);
        }
        let id = self.branch();
        self.visit_expression(&expr.test);
        self.path.push((id, 0));
        self.visit_expression(&expr.consequent);
        self.path.pop();
        self.path.push((id, 1));
        self.visit_expression(&expr.alternate);
        self.path.pop();
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
        Expression::ObjectExpression(obj) => {
            // A spread, or a key computed at runtime, may set any field: fields before the last such
            // property may be overridden by it, so only those after it are known.
            let last_spread = obj.properties.iter().rposition(|p| match p {
                ObjectPropertyKind::SpreadProperty(_) => true,
                ObjectPropertyKind::ObjectProperty(p) => p.key.static_name().is_none(),
            });
            Node::Obj(Obj {
                span,
                open: last_spread.is_some(),
                fields: obj
                    .properties
                    .iter()
                    .skip(last_spread.map_or(0, |i| i + 1))
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
            })
        }
        Expression::TSAsExpression(e) => convert(&e.expression),
        Expression::TSSatisfiesExpression(e) => convert(&e.expression),
        _ => Node::Dynamic(span),
    }
}

/// Lone surrogates cannot be represented in Rust strings (rare); replace the value.
fn js_str(s: Option<&str>) -> String {
    s.unwrap_or("\u{FFFD}").to_owned()
}
