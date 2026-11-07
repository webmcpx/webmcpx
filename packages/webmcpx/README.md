# webmcpx

**Make your site agent-ready with one script tag.** webmcpx registers standard
[WebMCP](https://webmachinelearning.github.io/webmcp/) tools on any page, so AI agents in the browser
call a function instead of reading and clicking through the page.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.1/src/auto.js"></script>
```

Or from npm (`npm i webmcpx`):

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

- **One result shape.** Every tool resolves with `{ ok, data, truncated?, next_cursor?, hint? }` or
  `{ ok: false, error: { code, message, retryable }, hint? }`.
- **Output budgets and paging.** Results stay within about 2,000 characters by default.
- **Annotations set for you:** `readOnlyHint` and `untrustedContentHint`.
- **Invisible characters stripped** from page text.
- **A no-op where WebMCP is missing.** Uses `document.modelContext`, with a `navigator.modelContext`
  fallback.
- **About 2.7 KB brotli on page load.** The WebAssembly engine loads on the first tool call.

Check your own tools with the [`webmcpx` linter](https://crates.io/crates/webmcpx), and scan any site at
[webmcpx.dev](https://webmcpx.dev).

WebMCP is a W3C Community Group draft, not a W3C standard. MIT licensed;
[source and docs](https://github.com/webmcpx/webmcpx).
