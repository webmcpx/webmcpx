use alloc::string::String;

/// A WebMCP tool annotation (the `ToolAnnotations` dictionary). All default to `false`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub enum Annotation {
    ReadOnly,
    UntrustedContent,
    Consequential,
    Debugging,
}

impl Annotation {
    pub const ALL: [Self; 4] = [
        Self::ReadOnly,
        Self::UntrustedContent,
        Self::Consequential,
        Self::Debugging,
    ];

    /// MCP annotations that WebMCP does not define; a host ignores them.
    pub const MCP_ONLY: [&'static str; 3] = ["destructiveHint", "idempotentHint", "openWorldHint"];

    pub const fn key(self) -> &'static str {
        match self {
            Self::ReadOnly => "readOnlyHint",
            Self::UntrustedContent => "untrustedContentHint",
            Self::Consequential => "consequentialHint",
            Self::Debugging => "debugging",
        }
    }

    pub fn parse(key: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|a| a.key() == key)
    }
}

/// A tool contract: everything `registerTool()` receives except `execute`.
#[derive(Debug, Clone, Copy)]
pub struct ToolDef {
    pub name: &'static str,
    pub title: &'static str,
    pub description: &'static str,
    /// JSON Schema (as JSON text) for the input object.
    pub input_schema: &'static str,
    /// Annotations set to `true`.
    pub annotations: &'static [Annotation],
}

impl ToolDef {
    /// The definition as a JSON object, ready to spread into `registerTool()`.
    pub fn to_json(&self) -> String {
        let mut out = String::from("{\"name\":");
        crate::push_json_str(&mut out, self.name);
        out.push_str(",\"title\":");
        crate::push_json_str(&mut out, self.title);
        out.push_str(",\"description\":");
        crate::push_json_str(&mut out, self.description);
        out.push_str(",\"inputSchema\":");
        out.push_str(self.input_schema);
        out.push_str(",\"annotations\":{");
        for (i, a) in self.annotations.iter().enumerate() {
            if i > 0 {
                out.push(',');
            }
            out.push('"');
            out.push_str(a.key());
            out.push_str("\":true");
        }
        out.push_str("}}");
        out
    }
}
