<div align="center">

<img src="site/static/brand-assets/junction/app-icon-512.svg" width="88" height="88" alt="webmcpx">

# webmcpx

**Make your site agent-ready.** Standard WebMCP tools in one script tag, a linter for your own tools,
and a public benchmark that shows what changes.

[![CI](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml/badge.svg)](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-121210.svg)](LICENSE)
[![WebMCP draft](https://img.shields.io/badge/WebMCP-draft%202026--11--02-fcd948.svg)](https://webmachinelearning.github.io/webmcp/)

[**Scan your site**](https://webmcpx.dev) · [Benchmark](https://webmcpx.dev/#proof) ·
[WebMCP vs MCP](https://webmcpx.dev/#vs-mcp) · [Contributing](CONTRIBUTING.md)

</div>

---

[WebMCP](https://webmachinelearning.github.io/webmcp/) lets a web page hand AI agents typed tools with
`document.modelContext.registerTool()`, so agents call a function instead of reading and clicking through
the page. Hundreds of sites already register tools, and each one reinvents the same few, with its own
truncation, errors and safety hints. **webmcpx gives them one contract, checks it, and measures it.**

> [!NOTE]
> WebMCP is a W3C Community Group **draft**, not a W3C standard, and runs in a Chrome origin trial. webmcpx
> tracks the draft of 2 November 2026 and is pre-1.0.

## What's inside

| | |
|---|---|
| **[Loader](packages/webmcpx)** | One `<script>` tag registers standard tools on any page: page context, search, Markdown, site search. |
| **[Linter](crates/webmcpx)** | `webmcpx lint` checks your own `registerTool()` calls: names, descriptions, hidden text, schemas, annotations. |
| **[Benchmark](bench)** | The same agent and question, with and without WebMCP, on live and local sites. Deterministic grading. |
| **[Scanner](https://webmcpx.dev)** | Paste a URL and see which tools a site registers, what the linter thinks and what an agent would read. |

## Add standard tools to a page

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

With nothing to configure:
- **One result shape.** Every tool resolves with `{ ok, data, truncated?, next_cursor?, hint? }` or
  `{ ok: false, error: { code, message, retryable }, hint? }`, and never rejects for expected failures
  (webmcp#282).
- **Output budgets and paging.** Results stay within about 2,000 characters by default.
- **Correct annotations.** Every tool sets `readOnlyHint` and `untrustedContentHint`.
- **Invisible-character stripping** in page text (webmcp#360).
- **Works on today's browsers.** `document.modelContext` with a `navigator.modelContext` fallback, and a
  no-op where WebMCP is missing.
- **About 2.7 KB brotli on page load.** The ~12 KB WebAssembly engine loads on the first tool call.

## Lint your tools

```sh
cargo install webmcpx
webmcpx lint src/
webmcpx lint --fix             # removes invisible characters
webmcpx lint --format json     # stable schema for agents and CI; also sarif, github, concise
webmcpx rules                  # every rule; `webmcpx rule <name>` explains one
```

It finds `registerTool()` calls in JS/TS (and `*webmcp*.json` manifests), then checks:
names (spec rules, length, duplicates), descriptions (missing, empty, too long), hidden text (zero-width,
bidi and tag characters), input schemas, annotations, the per-page tool budget and removed origin-trial
APIs. Exit codes: `0` no errors, `1` errors, `2` usage or I/O error.

## Benchmark

The same agent answers the same question on the same page twice: once reading, clicking and filling with
DOM snapshots, once with only the WebMCP tools the page registers. Same model, prompt and step limit in
both arms; graded by facts in the answer and page state, never by an LLM. On the best case so far,
WebMCP used **97× fewer tokens**. Every question, both arms and every model are
[published](site/src/lib/content/bench), losses included.

```sh
just setup
OPENAI_API_KEY=...    just bench                              # gpt-6-luna, effort medium, 3 runs per question
ANTHROPIC_API_KEY=... just bench --model claude-haiku-5-5
GEMINI_API_KEY=...    just bench --model gemini-3.8-flash
```

Questions live in [`bench/tasks`](bench/tasks) and local test sites in [`bench/sites`](bench/sites).
See [bench/AGENTS.md](bench/AGENTS.md) for the rules every question follows.

## Repository

```
crates/webmcpx-core    the contract: name rules, limits, result envelope, error codes (no_std)
crates/webmcpx-std     the standard tools, as pure functions (no_std)
crates/webmcpx-wasm    those functions for the browser
crates/webmcpx-lint    lint rules, one file each
crates/webmcpx         the CLI
crates/webmcpx-bench   benchmark harness, local server and the scan API
packages/webmcpx       the npm loader: the public browser API
site/                  webmcpx.dev (SvelteKit, prerendered)
deploy/                production images and compose stack
```

Everything is checked by one command, the same one CI runs: `just check`.

## Self-hosting the site and scanner

[`deploy/`](deploy) runs webmcpx.dev: distroless, nonroot images behind a Cloudflare Tunnel (no open
ports), with the scan browser isolated on a network that can only reach public addresses through an
egress filter.

```sh
echo "TUNNEL_TOKEN=<token>" > deploy/.env
docker compose -f deploy/compose.yaml --env-file deploy/.env up -d --build
```

See [deploy/README.md](deploy/README.md) for the security model and a rootless setup.

## Using an AI coding agent?

`npx skills add webmcpx/webmcpx` installs [the webmcpx skill](skills/webmcpx/SKILL.md), so your agent can
add WebMCP tools to your app and lint them.

## Community

- **Contributing:** start with [CONTRIBUTING.md](CONTRIBUTING.md). Ideas the WebMCP spec repo closes as out
  of scope (tools, conventions, rules) are welcome here as proposals.
- **Security:** please report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md).
- **Conduct:** everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
- **Community home:** [webmcp.zone](https://webmcp.zone).

## License

[MIT](LICENSE). The name and logos are covered by the [trademark policy](TRADEMARK.md). webmcpx is an
independent project, not affiliated with or endorsed by W3C, Google, Microsoft, Anthropic or the Model
Context Protocol project.
