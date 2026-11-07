---
name: webmcpx
description: Add WebMCP tools to a website and check them. Use when a user wants AI agents to use their site, asks about WebMCP, navigator.modelContext or document.modelContext, registerTool, or wants to lint/validate WebMCP tool definitions.
---

# webmcpx

WebMCP lets a page expose tools to AI agents via `document.modelContext.registerTool()`.

## 1. Standard tools: prefer these over hand-written ones

If the site has none yet, add the drop-in. It registers `get_page_context`, `search_page` and `fetch_as_markdown`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.1/src/auto.js"></script>
```

In a bundled app use `npm install webmcpx`, then call `register()` once on startup:

```js
import { register } from "webmcpx";
const { dispose } = await register({ searchSite }); // searchSite optional: (query, {limit}) => [{title, url, snippet}]
```

- In SPAs, call `dispose()` when the app unmounts. Don't re-register on every route.
- If the page has a strict CSP, add `'wasm-unsafe-eval'` to `script-src`. Without it, tools return `UNAVAILABLE`.

## 2. Custom tools: follow the same contract

```js
await document.modelContext.registerTool({
  name: "add_to_cart",                       // [A-Za-z0-9_.-], ≤ 30 chars recommended
  description: "Add a product to the cart.", // what it does and when to use it, ≤ 500 chars
  inputSchema: { type: "object", properties: { sku: { type: "string", description: "Product SKU." } }, required: ["sku"] },
  annotations: { consequentialHint: true },  // readOnlyHint: true for read-only tools
  async execute({ sku }) {
    // Resolve with an envelope; don't throw for expected failures.
    return JSON.stringify({ ok: true, data: await cart.add(sku) });
  },
}, { signal });                              // abort the signal to unregister
```

- Reuse the functions the UI already calls; don't drive the DOM.
- Keep each page to 20 tools or fewer.
- Never ask for passwords, card data or IDs as parameters.

## 3. Verify

1. **Lint.** Run `webmcpx lint <dir> --format json` (install: `cargo install webmcpx`, needs Rust; exit 1 means errors). Fix every error. `--fix` removes invisible characters.
   `webmcpx rule <name>` explains a rule, and `webmcpx explain <CODE>` explains a tool error code.
2. **See the tools in a real browser, yourself.** With the dev server running, run
   `npx webmcpx tools <local URL>` (e.g. `localhost:5173`): it lists the page's tools, no browser flag.
   Then call one: `npx webmcpx call <local URL> <tool> '<json input>'` (exit 1 means the tool returned an error).
   For production in Chrome, the site needs an origin-trial token in a `<meta http-equiv="origin-trial">` tag.
3. **Scan the live site.** Once deployed, `https://webmcpx.dev/?scan=<site>` (or `GET https://webmcpx.dev/api/scan?url=<site>` for JSON) should say agent-ready.
