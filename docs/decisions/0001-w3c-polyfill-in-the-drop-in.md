# 0001: The drop-in installs the W3C polyfill where a page has no WebMCP

- **Status:** accepted, shipped in npm `webmcpx@0.2.5` (2026-11-08)
- **Commits:** `2fdaab8` (polyfill in the drop-in), `9a7f740` (engine tests), `0ebed96` (site step 2)

## Context

The site-side script registered tools only when `document.modelContext` already existed: natively (a Chrome
flag or origin trial, the ChatGPT desktop app, the Codex app) or injected by the webmcpx MCP bridge
(`npx webmcpx mcp`, which drives its own Chromium over the DevTools protocol). An agent that drives its own
browser (Playwright, Selenium, Puppeteer, browser-use; Chrome, Firefox or Safari) saw no WebMCP tools on a webmcpx
site. The owner wanted the claim "any agent, any browser, any automation" on the site, and it was not true.

## Options

1. **Say less.** Keep "any MCP agent" only. True, but leaves out every agent with its own browser automation.
2. **Write our own WebMCP implementation.** Rejected: a second, divergent implementation of a draft standard,
   the opposite of what the community asks of polyfills (one blessed polyfill, removed once browsers ship).
3. **Install the W3C polyfill from the drop-in when the page has none.** Chosen.

## Decision

`auto.js` (the CDN drop-in) loads `@w3c/webmcp-polyfill` lazily, as a separate file, only when neither
`document.modelContext` nor `navigator.modelContext` exists and the page is a secure context; it never replaces a
native or already-injected implementation. npm users opt in with `import "webmcpx/polyfill"`; the default
`webmcpx` import does not change.

## Evidence

- Engine tests (`site/tests/engines.spec.ts`, in `just check`): an automation agent calls `getTools()` and
  `executeTool()` on a page with the built drop-in, in Playwright Chromium (no flag), Firefox and WebKit; a page
  with its own WebMCP never requests the polyfill.
- Live check on <https://webmcpx.dev> after release (2026-11-08): Firefox, WebKit and Chrome without a flag all
  list `fetch_as_markdown`, `get_page_context`, `search_page` and run `get_page_context`.
- Sizes (brotli): on-load script 2,769 B (+56 B); the polyfill, loaded only on pages without WebMCP, 5,075 B.

## Consequences

- True for script-tag sites on `webmcpx@0.2` from 0.2.5, and for npm sites that add the polyfill import.
- The polyfill needs recent engines (it uses `URL.parse`: about Safari 18, Firefox 126, Chrome 126).
- `executeTool()` returns JSON text and webmcpx tools return JSON text, so callers parse twice; documented in
  llms.txt and the READMEs.
- When browsers ship WebMCP, the drop-in stops loading the polyfill by itself (it checks first).

## References

- WebMCP draft and explainer: <https://github.com/webmachinelearning/webmcp>
- W3C polyfill: <https://www.npmjs.com/package/@w3c/webmcp-polyfill>
- Secure contexts: <https://developer.mozilla.org/docs/Web/Security/Secure_Contexts>
