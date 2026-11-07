# webmcpx

**Lint the WebMCP tools your site registers.** Part of [webmcpx](https://github.com/webmcpx/webmcpx):
standard WebMCP tools in one script tag, a linter for your own, and a public benchmark. Scan any site at
[webmcpx.dev](https://webmcpx.dev).

```sh
cargo install webmcpx
webmcpx lint src/
webmcpx lint --fix             # removes invisible characters
webmcpx lint --format json     # stable schema for agents and CI; also sarif, github, concise
webmcpx rules                  # every rule; `webmcpx rule <name>` explains one
webmcpx explain RESULT_TOO_LARGE
```

It finds `registerTool()` calls in JS/TS (and `*webmcp*.json` manifests), then checks names (spec rules,
length, duplicates), descriptions (missing, empty, too long), hidden text (zero-width, bidi and tag
characters), input schemas, annotations, the per-page tool budget and removed origin-trial APIs.

Exit codes: `0` no errors, `1` errors, `2` usage or I/O error.

[WebMCP](https://webmachinelearning.github.io/webmcp/) is a W3C Community Group draft, not a W3C standard.
License: MIT.
