# webmcpx-lint

The linter behind the [`webmcpx` CLI](https://crates.io/crates/webmcpx): finds
`document.modelContext.registerTool({...})` calls in JS/TS sources (and tools in `*webmcp*.json`
manifests) and checks names, descriptions, hidden Unicode, input schemas, annotations and the per-page tool
budget. Rules reuse the validators of [`webmcpx-core`](https://crates.io/crates/webmcpx-core), so the linter
and the runtime never disagree.

```rust
use std::path::Path;
use webmcpx_lint::{lint, Options};

let source = r#"document.modelContext.registerTool({ name: "find products", execute: search });"#;
let report = lint(Path::new("tools.js"), source, &Options::default());
// invalid-name, missing-description, missing-annotations
assert_eq!(report.diagnostics.len(), 3);
```

License: MIT.
