# webmcpx

**Standard WebMCP tools for any website, and a fast linter for your own.**

[WebMCP](https://webmachinelearning.github.io/webmcp/) lets a page expose tools to AI agents with
`document.modelContext.registerTool()`. Hundreds of sites already do. They re-invent the same few tools,
and each one handles truncation, errors and safety hints its own way. webmcpx gives them one contract.

## Add standard tools to a page (one line)

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx/src/auto.js"></script>
```

Or from npm:

```js
import { register } from "webmcpx";

const { registered, dispose } = await register({
  // Optional: also expose your backend search as `search_site`.
  searchSite: async (query, { limit }) => (await fetch(`/api/search?q=${query}&n=${limit}`)).json(),
});
```

| Tool | What the agent gets |
|---|---|
| `get_page_context` | Title, URL, language, meta description, heading outline, the user's selection |
| `search_page` | BM25-ranked passages of the main content, each linked to its section |
| `fetch_as_markdown` | The main content as Markdown, paged with `cursor` |
| `search_site` | Your site search, with limits and a uniform result shape (when `searchSite` is given) |

You get these without configuring anything:
- **One result shape.** Every tool resolves with `{ ok, data, truncated?, next_cursor?, hint? }` or
  `{ ok: false, error: { code, message, retryable }, hint? }`, and never rejects (webmcp#282).
- **Output budgets and paging.** Results stay within about 2,000 characters by default.
- **Correct annotations.** Every tool sets `readOnlyHint` and `untrustedContentHint`.
- **Invisible-character stripping** in page text (webmcp#360).
- **Works on today's hosts.** `document.modelContext` with a `navigator.modelContext` fallback, frozen host
  objects, and a no-op where WebMCP is missing.
- **About 2.7 KB brotli on page load.** The ~12 KB WebAssembly engine loads on the first tool call.

## Lint your tools

```sh
cargo install --path crates/webmcpx   # prebuilt binaries come with the first release
webmcpx lint src/
webmcpx lint --fix             # removes invisible characters
webmcpx lint --format json     # stable schema for agents and CI; also sarif, github, concise
webmcpx rules                  # every rule; `webmcpx rule <name>` explains one
```

It finds `registerTool()` calls in JS/TS (and `*webmcp*.json` manifests), then checks them:
- **Names:** spec rules, length, duplicates.
- **Descriptions:** missing or empty, length budgets.
- **Hidden text:** zero-width, bidi and tag characters.
- **Schemas:** the input schema's shape and parameters without descriptions.
- **Annotations:** missing ones, and MCP-only ones that WebMCP ignores.
- **Page-level:** the per-page tool budget and removed origin-trial APIs.

Exit codes: `0` no errors, `1` errors, `2` usage or I/O error.

## Using an AI coding agent?

`npx skills add webmcpx/webmcpx` installs [the webmcpx skill](skills/webmcpx/SKILL.md), so your agent can
add WebMCP tools to your app and lint them.

## Status

Pre-1.0, tracking the WebMCP Draft Community Group Report of 2026-11-02. Community home:
[webmcp.zone](https://webmcp.zone). Contributions: see [CONTRIBUTING.md](CONTRIBUTING.md).

Licensed under MIT OR Apache-2.0.
