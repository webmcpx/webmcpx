# webmcpx-core

The contract shared by every part of [webmcpx](https://github.com/webmcpx/webmcpx): WebMCP tool name rules
and limits, invisible-Unicode detection, the result envelope every standard tool returns, and the catalog of
error codes. `no_std`, no dependencies on the browser.

It tracks the [WebMCP draft](https://webmachinelearning.github.io/webmcp/) of 2 November 2026 (a W3C
Community Group draft, not a W3C standard).

```rust
use webmcpx_core::validate_name;

assert!(validate_name("search_page").is_ok());
assert!(validate_name("").is_err());
```

Most people want the [`webmcpx` CLI](https://crates.io/crates/webmcpx) or the
[npm loader](https://www.npmjs.com/package/webmcpx); this crate is for building on the same rules.

License: MIT.
