<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="site/static/brand-assets/lockup/lockup-paper.svg">
  <img src="site/static/brand-assets/lockup/lockup-ink.svg" width="360" alt="webmcpx">
</picture>

**Make your site agent-ready.** One script tag on your site, one line in your agent: AI agents call
real tools on your pages instead of reading and clicking their way through.

[![npm](https://img.shields.io/npm/v/webmcpx.svg?label=npm&color=121210)](https://www.npmjs.com/package/webmcpx)
[![crates.io](https://img.shields.io/crates/v/webmcpx.svg?color=121210)](https://crates.io/crates/webmcpx)
[![CI](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml/badge.svg)](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-121210.svg)](LICENSE)

[**Scan your site →**](https://webmcpx.dev)

</div>

Two independent paths: pick yours.

### For your site

Make it agent-ready: one line, and agents call your site instead of guessing. Paste this before `</body>`:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.2/dist/auto.js"></script>
```

Your page now registers `search_page`, `fetch_as_markdown` and `get_page_context` with
[WebMCP](https://webmachinelearning.github.io/webmcp/) (`document.modelContext.registerTool()`), so an agent
in the browser calls a function instead of guessing at buttons. Where the browser lacks WebMCP (Firefox,
Safari, Chrome without the flag), the script first adds the
[W3C WebMCP polyfill](https://github.com/w3c-oss/webmcp-polyfill), a separate ~5 KB file fetched only there.
Check it, localhost included: `npx webmcpx tools localhost:3000`. Then add [your own tools](#your-own-tools).

### For your agent

Make your agent faster on every site: same answers, a fraction of the tokens (measured per model on the
[leaderboard](https://webmcpx.dev/#leaderboard)). No site of your own needed. Paste this into Codex, Claude
Code, Cursor or any agent:

```text
Use WebMCP first on every web page you work with, before reading or clicking anything: in your own browser and in any script you write or run (Playwright, Selenium, Puppeteer, browser-use, CDP), even if you support WebMCP natively. Set it up with webmcpx (read https://webmcpx.dev/llms.txt) and add this rule to your agent instructions (AGENTS.md, CLAUDE.md or equivalent) so it applies to every future task. Then prove it works: open https://webmcpx.dev, list its WebMCP tools and call one.
```

It takes one of two ways:

- **Agents with MCP** (Claude Code, Codex, Cursor...) add the MCP server. It opens pages in its own
  Chromium with the W3C polyfill loaded before the page, no browser flag, so the site's own tools work too
  (try a Shopify store), and every page gets the standard ones:

  ```sh
  claude mcp add webmcpx -- npx -y webmcpx mcp     # Codex: codex mcp add webmcpx -- npx -y webmcpx mcp
  ```

- **Agents that drive their own browser** (Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome,
  Firefox, Safari) call `document.modelContext` in the page, which every site with webmcpx has:

  ```js
  const mc = document.modelContext;
  const tool = (await mc.getTools()).find((t) => t.name === "search_page");
  const envelope = JSON.parse(JSON.parse(await mc.executeTool(tool, { query: "pricing" })));
  ```

  (`executeTool()` resolves with JSON text, and webmcpx tools return their envelope as JSON text: parse
  twice.) Tested in Chromium, Firefox and WebKit on every CI run (`site/tests/engines.spec.ts`).

The ChatGPT desktop app and the Codex app also [call WebMCP tools](https://learn.chatgpt.com/docs/webmcp)
natively; the prompt still applies, since they may drive another browser from a script.

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

## What's inside

| | |
|---|---|
| **[Loader](packages/webmcpx)** · [npm](https://www.npmjs.com/package/webmcpx) | The script above: standard tools with one result shape, output budgets and paging, correct annotations, invisible characters stripped; the W3C polyfill where the browser lacks WebMCP. About 2.7 KB on load. |
| **[Agent bridge](packages/webmcpx/agent)** · `npx webmcpx mcp` | An MCP server for Claude Code, Codex, Cursor and others: it opens pages in a local Chromium and hands the agent their WebMCP tools as typed tools. Also `npx webmcpx tools <url>` to check yours. |
| **[Linter](crates/webmcpx)** · [crates.io](https://crates.io/crates/webmcpx) | `webmcpx lint` checks your own `registerTool()` calls. It catches the silent failures: too many tools, the removed `provideContext`, the legacy `navigator.modelContext`, hidden characters. |
| **[Scanner](https://webmcpx.dev)** | Paste a URL: which tools a site registers, what the linter thinks, what an agent would read instead. Shareable result, README badge. |
| **[Benchmark](bench)** | The same agent and question, with and without WebMCP, on live sites. Deterministic grading, losses included. |

## Benchmark

Same model, prompt and step limit; one arm is a competent DOM browser agent (reads the page in parts, opens
links and URLs, clicks and fills), the other only calls the WebMCP tools the page registers. 30 questions on 6
sites, 3 runs each per arm, six models, graded by facts in the answer, never by an LLM. Method, changes and
audits: [bench/METHODOLOGY.md](bench/METHODOLOGY.md), [bench/CHANGELOG.md](bench/CHANGELOG.md),
[bench/audits/](bench/audits).

Both arms solve almost every question; WebMCP gets the same answers for **2.7× to 6× fewer tokens** per run
across the six models (method v2).

Per site, never averaged (GPT-6.1 Sol; tokens per run on that site's best and worst question):

| Site | Best question | Worst question | Fully solved (of 5) |
|---|---|---|---|
| Cloudflare docs | 34.2k → **1.0k** (34×) | 3.6× fewer | 5 → 5 |
| Notion | 19.1k → **1.1k** (18×) | 4.3× fewer | 5 → 5 |
| Kiln & Co (demo store) | 13.5k → **2.2k** (6.1×) | 2.1× fewer | 5 → 5 |
| specification.website | 20.2k → **3.7k** (5.5×) | 2.4× fewer | 5 → 5 |
| Orbit docs (demo) | 2.9k → **1.0k** (2.8×) | 1.5× fewer | 5 → 5 |
| WooCommerce demo | 3.8k → **3.2k** (1.2×) | 2× **more** | 5 → 5 |

With GPT-6 Luna the best case is 62× fewer tokens (64.7k → 1.0k on a Notion docs question). Not every case
wins: the WooCommerce demo store's tools return more than a page snapshot, so WebMCP used more tokens on some
of its questions.
[Every question, both arms, every model.](site/src/lib/content/bench)

## More ways in

```sh
npx -y webmcpx mcp                     # MCP server: your agent calls the tools of any page
npx webmcpx tools localhost:3000       # list a page's WebMCP tools, no browser flag
npm i webmcpx                          # import { register } from "webmcpx"; await register();
npx skills add webmcpx/webmcpx -y      # teach your coding agent to add and check WebMCP tools
npx webmcpx lint src/                  # the linter (no Rust needed; or cargo install webmcpx); --format json
```

Or paste this into your coding agent: *Add WebMCP to this site with webmcpx: run
`npx skills add webmcpx/webmcpx -y`, follow the skill, then check the tools with
`npx webmcpx tools <local URL>`.*

Got a scan result you disagree with? [Open an issue](https://github.com/webmcpx/webmcpx/issues/new/choose).
That's the most useful feedback there is.

## Community

[CONTRIBUTING.md](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md) ·
[Self-hosting the site and scanner](deploy/README.md) · [For agents: llms.txt](https://webmcpx.dev/llms.txt)

WebMCP is a W3C Community Group draft (2 November 2026), not a W3C standard. webmcpx tracks it and is
pre-1.0. [MIT](LICENSE); the name and logos follow the [trademark policy](TRADEMARK.md). An independent
project, not affiliated with or endorsed by W3C, Google, Microsoft, OpenAI, Anthropic or the Model Context
Protocol project.
