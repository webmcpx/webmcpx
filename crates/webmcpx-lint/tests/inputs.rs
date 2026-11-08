use std::path::Path;

use webmcpx_lint::{Options, line_col, lint};

fn render(path: &str, source: &str) -> String {
    let report = lint(
        Path::new(path),
        source,
        &Options {
            preview: true,
            ..Options::default()
        },
    );
    let mut out = format!("tools={} unresolved={}\n", report.tools, report.unresolved);
    for d in &report.diagnostics {
        let (line, col) = line_col(source, d.span.start);
        let line = format!(
            "{line}:{col} {} [{}] {}\n",
            d.severity.as_str(),
            d.rule,
            d.message
        );
        out.push_str(&line);
    }
    out
}

/// webmcpx dogfoods its own contracts: the standard tools must lint clean.
#[test]
fn standard_tools_lint_clean() {
    let tools: Vec<String> = webmcpx_std::tools::ALL
        .iter()
        .map(webmcpx_core::ToolDef::to_json)
        .collect();
    let manifest = format!("[{}]", tools.join(","));
    assert_eq!(render("std.json", &manifest), "tools=4 unresolved=0\n");
}

#[test]
fn json_manifest() {
    insta::assert_snapshot!(render("tools.json", r#"{
  "tools": [
    { "name": "get_weather", "description": "Current weather for a city.",
      "inputSchema": { "type": "object", "properties": { "city": { "type": "string" } } },
      "annotations": { "readOnlyHint": true } },
    { "name": "Book Table", "description": "",
      "annotations": { "destructiveHint": false } }
  ]
}"#), @r"
    tools=2 unresolved=0
    4:58 warning [missing-param-description] parameter `city` of `get_weather` has no description
    6:15 error [invalid-name] tool name contains ' '; only A-Z, a-z, 0-9, '_', '.' and '-' are allowed
    6:44 error [missing-description] `Book Table` has an empty description
    7:24 warning [unknown-annotation] `destructiveHint` is an MCP annotation; WebMCP ignores it (use consequentialHint or readOnlyHint)
    ");
}

#[test]
fn typescript_source() {
    insta::assert_snapshot!(render("tools.ts", r#"
const signal = new AbortController().signal;
await document.modelContext.registerTool({
  name: "add_to_cart",
  description: "Add a product to the cart.",
  inputSchema: { type: "object", properties: { sku: { type: "string", description: "Product SKU." } } } as const,
  annotations: { consequentialHint: true },
  async execute({ sku }: { sku: string }) { return cart.add(sku); },
}, { signal });
document.modelContext.registerTool(buildTool());
"#), @"tools=1 unresolved=1");
}

#[test]
fn syntax_errors_are_reported() {
    insta::assert_snapshot!(render("bad.js", "registerTool({"), @r"
    tools=0 unresolved=0
    1:1 error [syntax-error] Expected `}` but found `EOF`
    ");
}

/// A spread can supply any field (`{ ...TOOLS[name], execute }`, as the webmcpx loader does): what it
/// may supply is never reported missing, while fields written after it are still checked.
#[test]
fn spreads_hide_missing_fields_not_known_ones() {
    let source = "document.modelContext.registerTool({ ...TOOLS[name], execute: run });";
    assert_eq!(render("loader.js", source), "tools=1 unresolved=0\n");
    let source = r#"document.modelContext.registerTool({ ...defaults, name: "bad name", description: "Search." });"#;
    let out = render("tool.js", source);
    assert!(out.contains("[invalid-name]"), "{out}");
    // A known wrong value after a spread is still wrong.
    let source = r#"document.modelContext.registerTool({ name: "search", description: "Search.", inputSchema: { ...defaults, type: 42 } });"#;
    let out = render("tool.js", source);
    assert!(out.contains("[invalid-input-schema]"), "{out}");
    // A field before the spread may be overridden by it: unknown, not checked.
    let source = r#"document.modelContext.registerTool({ name: "bad name", ...defaults });"#;
    assert_eq!(render("tool.js", source), "tools=1 unresolved=0\n");
}
