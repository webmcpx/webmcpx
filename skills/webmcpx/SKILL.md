---
name: webmcpx
description: Add WebMCP tools to a website and check them. Use when a user wants AI agents to use their site, asks about WebMCP, navigator.modelContext or document.modelContext, registerTool, or wants to lint/validate WebMCP tool definitions.
---

# webmcpx

WebMCP lets a page expose tools to AI agents via `document.modelContext.registerTool()`.

## 1. Standard tools: prefer these over hand-written ones

If the site has none yet, add the drop-in. It registers `get_page_context`, `search_page` and `fetch_as_markdown`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.2/dist/auto.js"></script>
```

The script adds the W3C WebMCP polyfill where the browser lacks WebMCP, so agents driving Firefox, Safari
or Chrome without the flag still find the tools at `document.modelContext`.

In a bundled app use `npm install webmcpx`, then call `register()` once on startup (import
`webmcpx/polyfill` first, or the tools exist only in browsers with WebMCP):

```js
import "webmcpx/polyfill";
import { register } from "webmcpx";
const { dispose } = await register({ searchSite }); // searchSite optional: (query, {limit}) => [{title, url, snippet}]
```

- In SPAs, call `dispose()` when the app unmounts. Don't re-register on every route.
- If the page has a strict CSP, add `'wasm-unsafe-eval'` to `script-src`. Without it, tools return `UNAVAILABLE`.

## 2. The site's own tools: use `tool()` or a form

```js
import { tool } from "webmcpx"; // or useTool from "webmcpx/react" | "webmcpx/vue" | "webmcpx/svelte"

tool({
  name: "add_to_cart",                          // [A-Za-z0-9_.-], under 30 chars
  description: "Add a product to the cart by SKU.", // what it does and when to use it, under 500 chars
  input: { sku: "string", "qty?": "integer" },  // shorthand ("?" = optional, [..] = choices); or inputSchema: {...}
  acts: true,                                   // changes something for the user; readOnly: true for reads
  run: ({ sku, qty = 1 }) => cart.add(sku, qty), // return data; throw on failure (error.code = a webmcpx code)
});
```

A server-rendered form needs no JavaScript: add `toolname`, `tooldescription` and, per field,
`toolparamdescription` (plus `toolautosubmit` if the agent may submit; then `event.agentInvoked` and
`event.respondWith(promise)` in the submit handler). The script tag makes it a tool.

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
3. **Call them like any agent would.** With MCP: `npx -y webmcpx mcp` gives the agent each page's
   tools (its own Chromium, polyfill first). Driving a browser yourself (Playwright, Selenium, Puppeteer,
   CDP; Chrome, Firefox, Safari): in the page, `const mc = document.modelContext; const t = (await
   mc.getTools()).find((t) => t.name === "search_page"); JSON.parse(JSON.parse(await mc.executeTool(t,
   { query: "pricing" })))`. `executeTool()` resolves with JSON text and webmcpx tools return their
   envelope as JSON text, so parse twice; a tool returning an object needs one parse.
4. **Scan the live site.** Once deployed, `https://webmcpx.dev/?scan=<site>` (or `GET https://webmcpx.dev/api/scan?url=<site>` for JSON) should say agent-ready.
