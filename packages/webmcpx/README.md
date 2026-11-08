# webmcpx

**Make your site agent-ready in two steps.** webmcpx registers standard
[WebMCP](https://webmachinelearning.github.io/webmcp/) tools on any page, so AI agents in the browser
call a function instead of reading and clicking through the page.

**Step 1, on your site.** Paste this before `</body>`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.2/dist/auto.js"></script>
```

Where the browser lacks WebMCP (Firefox, Safari, Chrome without the flag), it first adds the
[W3C WebMCP polyfill](https://github.com/w3c-oss/webmcp-polyfill), a separate file fetched only there.

**Step 2, in your agent. Any agent, any browser, any automation.** The ChatGPT desktop app and the Codex
app skip this step: they [call WebMCP tools](https://learn.chatgpt.com/docs/webmcp) natively.

- **Agents with MCP** (Claude Code, Codex, Cursor...): add the MCP server. It opens pages in its own
  Chromium with the W3C polyfill loaded before the page, no browser flag, so the site's own tools work too.

  ```sh
  claude mcp add webmcpx -- npx -y webmcpx mcp     # Codex: codex mcp add webmcpx -- npx -y webmcpx mcp
  ```

- **Agents that drive their own browser** (Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome,
  Firefox, Safari): call `document.modelContext` in the page, which every site with step 1 has.
  `executeTool()` resolves with JSON text, and webmcpx tools return their envelope as JSON text, so parse
  twice:

  ```js
  const mc = document.modelContext;
  const tool = (await mc.getTools()).find((t) => t.name === "search_page");
  const envelope = JSON.parse(JSON.parse(await mc.executeTool(tool, { query: "pricing" })));
  ```

Or paste one prompt into any agent: "Set up WebMCP for yourself with webmcpx (read
https://webmcpx.dev/llms.txt), whatever browser or automation you use. Then prove it works: open
https://webmcpx.dev, list its WebMCP tools and call one." Check your own site, localhost included:

```sh
npx webmcpx tools localhost:3000
npx webmcpx call localhost:3000 search_page '{"query": "pricing"}'
```

To see Chrome's native WebMCP, turn on `chrome://flags/#enable-webmcp-testing` and open DevTools ›
Application › WebMCP.

## Your own tools

The standard tools read the page. Your own tools act: add to cart, book a table, filter results. Same
contract (checked input, one result shape, no silent failures), in five lines:

```js
import { tool } from "webmcpx";

tool({
  name: "add_to_cart",
  description: "Add a product to the cart by SKU.",
  input: { sku: "string", "qty?": "integer" },
  acts: true,
  run: ({ sku, qty = 1 }) => cart.add(sku, qty),
});
```

No JavaScript? A form with `toolname` is a tool: the WebMCP
[declarative API](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), which
the script tag adds where the browser doesn't have it yet. With `toolautosubmit`, your submit handler gets
`event.agentInvoked` and can answer with `event.respondWith(...)`.

```html
<form toolname="add_to_cart" tooldescription="Add a product to the cart by SKU." action="/cart" method="post" toolautosubmit>
  <input name="sku" required toolparamdescription="Product SKU, e.g. MUG-01">
  <input name="qty" type="number" min="1" toolparamdescription="How many (default 1)">
  <button>Add to cart</button>
</form>
```

In a component, `useTool(...)` from `webmcpx/react` (16.8+), `webmcpx/vue` (2.7+) or `webmcpx/svelte` (3+)
registers it while the component is mounted. Then see it, no browser flag: `npx webmcpx tools localhost:3000`.

Or from npm (`npm i webmcpx`):

```js
import "webmcpx/polyfill"; // optional: the W3C polyfill where the browser lacks WebMCP
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

- **One result shape.** Every tool resolves with `{ ok, data, truncated?, next_cursor?, hint? }` or
  `{ ok: false, error: { code, message, retryable }, hint? }`.
- **Output budgets and paging.** Results stay within about 2,000 characters by default.
- **Annotations set for you:** `readOnlyHint` and `untrustedContentHint`.
- **Invisible characters stripped** from page text.
- **WebMCP in every browser, never over a native one.** Uses `document.modelContext`, with a
  `navigator.modelContext` fallback. Where neither exists, the script tag (and `webmcpx/auto`) loads the W3C
  polyfill first (~5 KB brotli, its own file); from npm, `import "webmcpx/polyfill"` does the same, and
  without it `register()` is a no-op there.
- **About 2.7 KB brotli on page load.** The WebAssembly engine loads on the first tool call.

`npx webmcpx --help` shows the setup for Cursor, VS Code and Windsurf, `--headed` to watch the browser and
`--cdp <url>` to use your own. Needs Node 22+ and Chrome, Chromium, Edge or Brave.

Check your own tools with `npx webmcpx lint src/` (the [`webmcpx` linter](https://crates.io/crates/webmcpx), no Rust needed), and scan any site at
[webmcpx.dev](https://webmcpx.dev).

WebMCP is a W3C Community Group draft, not a W3C standard. MIT licensed;
[source and docs](https://github.com/webmcpx/webmcpx).
