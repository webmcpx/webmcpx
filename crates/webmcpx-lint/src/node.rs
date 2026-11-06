//! A tiny literal tree: the statically known part of a tool definition.

use crate::Span;

#[derive(Debug)]
pub(crate) enum Node {
    Str {
        value: String,
        span: Span,
    },
    Num(Span),
    Bool(Span),
    Null(Span),
    Arr {
        items: Vec<Node>,
        span: Span,
    },
    Obj(Obj),
    /// Anything not literal: identifiers, calls, functions...
    Dynamic(Span),
}

#[derive(Debug)]
pub(crate) struct Obj {
    pub(crate) span: Span,
    pub(crate) fields: Vec<Field>,
}

#[derive(Debug)]
pub(crate) struct Field {
    pub(crate) key: String,
    pub(crate) key_span: Span,
    pub(crate) value: Node,
}

impl Node {
    pub(crate) fn span(&self) -> Span {
        match self {
            Self::Str { span, .. }
            | Self::Arr { span, .. }
            | Self::Num(span)
            | Self::Bool(span)
            | Self::Null(span)
            | Self::Dynamic(span) => *span,
            Self::Obj(obj) => obj.span,
        }
    }

    pub(crate) fn as_str(&self) -> Option<&str> {
        match self {
            Self::Str { value, .. } => Some(value),
            _ => None,
        }
    }

    pub(crate) fn as_obj(&self) -> Option<&Obj> {
        match self {
            Self::Obj(obj) => Some(obj),
            _ => None,
        }
    }

    pub(crate) fn is_dynamic(&self) -> bool {
        matches!(self, Self::Dynamic(_))
    }

    /// Visits this node and every descendant.
    pub(crate) fn walk<'a>(&'a self, f: &mut impl FnMut(&'a Node)) {
        f(self);
        match self {
            Self::Arr { items, .. } => items.iter().for_each(|n| n.walk(f)),
            Self::Obj(obj) => obj.fields.iter().for_each(|field| field.value.walk(f)),
            _ => {}
        }
    }
}

impl Obj {
    pub(crate) fn get(&self, key: &str) -> Option<&Field> {
        self.fields.iter().rev().find(|f| f.key == key)
    }

    pub(crate) fn str(&self, key: &str) -> Option<(&str, Span)> {
        let field = self.get(key)?;
        Some((field.value.as_str()?, field.value.span()))
    }

    /// `inputSchema.properties` as (name, name span, schema).
    pub(crate) fn params(&self) -> impl Iterator<Item = (&str, Span, &Obj)> {
        self.get("inputSchema")
            .and_then(|f| f.value.as_obj())
            .and_then(|schema| schema.get("properties"))
            .and_then(|f| f.value.as_obj())
            .into_iter()
            .flat_map(|props| &props.fields)
            .filter_map(|f| Some((f.key.as_str(), f.key_span, f.value.as_obj()?)))
    }

    /// Where to point for tool-level findings: the `name` value, else the object.
    pub(crate) fn anchor(&self) -> Span {
        self.get("name").map_or(self.span, |f| f.value.span())
    }

    /// The tool name for messages.
    pub(crate) fn label(&self) -> &str {
        self.str("name").map_or("<unnamed>", |(name, _)| name)
    }
}
