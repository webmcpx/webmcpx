<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="site/static/brand-assets/lockup/lockup-paper.svg">
  <img src="site/static/brand-assets/lockup/lockup-ink.svg" width="360" alt="webmcpx">
</picture>

**Make your site agent-ready.** One script tag gives AI agents real tools on your pages,
instead of making them read and click their way through.

[![npm](https://img.shields.io/npm/v/webmcpx.svg?label=npm&color=121210)](https://www.npmjs.com/package/webmcpx)
[![crates.io](https://img.shields.io/crates/v/webmcpx.svg?color=121210)](https://crates.io/crates/webmcpx)
[![CI](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml/badge.svg)](https://github.com/webmcpx/webmcpx/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-121210.svg)](LICENSE)

[**Scan your site →**](https://webmcpx.dev)

</div>

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.1/src/auto.js"></script>
```

That's it. Your page now registers `search_page`, `fetch_as_markdown` and `get_page_context` with
[WebMCP](https://webmachinelearning.github.io/webmcp/) (`document.modelContext.registerTool()`), so an agent
in the browser calls a function instead of guessing at buttons. Where WebMCP is missing, the script does
nothing.

**See it work.** Open your page in the ChatGPT desktop app's browser or in Codex: they
[call WebMCP tools](https://learn.chatgpt.com/docs/webmcp). Or in Chrome: turn on
`chrome://flags/#enable-webmcp-testing`, relaunch, then open DevTools › Application › WebMCP. Going live in
Chrome? Add your origin-trial token in a `<meta http-equiv="origin-trial">` tag.

## What's inside

| | |
|---|---|
| **[Loader](packages/webmcpx)** · [npm](https://www.npmjs.com/package/webmcpx) | The script above: standard tools with one result shape, output budgets and paging, correct annotations, invisible characters stripped. About 2.8 KB on load. |
| **[Linter](crates/webmcpx)** · [crates.io](https://crates.io/crates/webmcpx) | `webmcpx lint` checks your own `registerTool()` calls. It catches the silent failures: too many tools, the removed `provideContext`, the legacy `navigator.modelContext`, hidden characters. |
| **[Scanner](https://webmcpx.dev)** | Paste a URL: which tools a site registers, what the linter thinks, what an agent would read instead. Shareable result, README badge. |
| **[Benchmark](bench)** | The same agent and question, with and without WebMCP, on live sites. Deterministic grading, losses included. |

## Benchmark

Same model, prompt and step limit; one arm reads the page through DOM snapshots, the other only calls the
WebMCP tools the page registers. 35 questions on 7 sites (Cloudflare, Notion and Allbirds use their own
tools), 3 runs each, graded by facts in the answer, never by an LLM.

Per site, never averaged (GPT-6.1 Sol; tokens per run on that site's best and worst question):

| Site | Best question | Worst question | Fully solved (of 5) |
|---|---|---|---|
| Notion | 25.2k → **1.1k** (24×) | 1.8× fewer | 5 → 5 |
| Cloudflare docs | 20.7k → **1.0k** (20×) | 2.1× fewer | 5 → 5 |
| specification.website | 39.8k → **3.9k** (10×) | 3.0× fewer | 5 → 5 |
| Kiln & Co (demo store) | 12.1k → **2.4k** (5×) | 1.8× fewer | 5 → 5 |
| Allbirds | 20.4k → **6.0k** (3.4×) | 1.1× fewer | 3 → **5** |
| Orbit docs (demo) | 2.5k → **1.0k** (2.5×) | 1.5× fewer | 5 → 5 |
| WooCommerce demo | 3.1k → 3.2k (0.9×) | 2.4× **more** | 5 → 5 |

With GPT-6 Luna the best case is 97× fewer tokens (113k → 1.2k on a Cloudflare docs question). Not every
case wins: the WooCommerce demo store's tools return more than a page snapshot, so WebMCP used the same or
more tokens there, with both models.
[Every question, both arms, every model.](site/src/lib/content/bench)

## More ways in

```sh
npm i webmcpx                          # import { register } from "webmcpx"; await register();
npx skills add webmcpx/webmcpx -y      # teach your coding agent to add and check WebMCP tools
cargo install webmcpx                  # the linter (needs Rust); webmcpx lint src/ --format json
```

Or paste this into your coding agent: *Add WebMCP to this site with webmcpx: run
`npx skills add webmcpx/webmcpx -y`, follow the skill, then check that the tools show up in Chrome DevTools ›
Application › WebMCP.*

Got a scan result you disagree with? [Open an issue](https://github.com/webmcpx/webmcpx/issues/new/choose).
That's the most useful feedback there is.

## Community

[CONTRIBUTING.md](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md) ·
[Self-hosting the site and scanner](deploy/README.md) · [For agents: llms.txt](https://webmcpx.dev/llms.txt)

WebMCP is a W3C Community Group draft (2 November 2026), not a W3C standard. webmcpx tracks it and is
pre-1.0. [MIT](LICENSE); the name and logos follow the [trademark policy](TRADEMARK.md). An independent
project, not affiliated with or endorsed by W3C, Google, Microsoft, OpenAI, Anthropic or the Model Context
Protocol project.
