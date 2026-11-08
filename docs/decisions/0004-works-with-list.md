# 0004: Who the "Works with any agent and browser" row names, and how their logos are drawn

- **Status:** accepted (2026-11-08)
- **Code:** `site/src/lib/features/agents/Agents.svelte` (`CLIENTS`, `BROWSERS`), `site/src/lib/content/logos.ts`

## Rule

A **client** is listed only if its own documentation says it runs local (stdio) MCP servers, which is how
`npx -y webmcpx mcp` connects. A **browser** is listed if it is a desktop browser on Chromium, Firefox or
WebKit, where a page script (the loader and the W3C polyfill) runs as it does in Chrome. Automation tools
are listed because they drive such a browser.

## Added on 2026-11-08 (checked that day)

| Name | Evidence |
|---|---|
| OpenClaw | [docs.openclaw.ai/tools/mcp](https://docs.openclaw.ai/tools/mcp), [/cli/mcp/transports](https://docs.openclaw.ai/cli/mcp/transports) |
| Hermes Agent (Nous Research) | [hermes-agent.nousresearch.com/docs/user-guide/features/mcp](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) |
| OpenCode | [opencode.ai/docs/mcp-servers](https://opencode.ai/docs/mcp-servers/) |
| Warp | [docs.warp.dev/agents/capabilities/mcp](https://docs.warp.dev/agents/capabilities/mcp/) |
| Goose | [goose-docs.ai/docs/getting-started/using-extensions](https://goose-docs.ai/docs/getting-started/using-extensions) |
| Continue | [docs.continue.dev/customize/deep-dives/mcp](https://docs.continue.dev/customize/deep-dives/mcp) |
| Kilo Code | [kilo.ai/docs/automate/mcp/using-in-kilo-code](https://kilo.ai/docs/automate/mcp/using-in-kilo-code) |
| Kiro | [kiro.dev/docs/mcp/configuration](https://kiro.dev/docs/mcp/configuration/) |
| Microsoft Edge | Chromium ([Microsoft](https://www.microsoft.com/en-us/edge/learning-center/what-is-chromium-how-does-it-enhance-your-browser)) |
| Zen | Firefox-based ([zen-browser/desktop README](https://github.com/zen-browser/desktop)) |
| Perplexity Comet | Chromium ([Perplexity help center](https://www.perplexity.ai/help-center/comet/en/articles/11583798-what-is-comet-s-browser-engine)) |

Not added: Roo Code (shut down, repository archived), ChatGPT Atlas (discontinued 2026-08-09), Kimi CLI
(archived), Ladybird (its own engine).

## Logos

Each brand's own published artwork, never a redrawing: simple-icons where it has the same brand (OpenCode,
Warp, Zen), else the official SVG (OpenClaw's monochrome tray icon, Goose, Continue, Kilo Code, Kiro),
converted to path data only: `rect`, `circle` and `ellipse` as equivalent arcs, a mask's knocked-out parts as
`holes`, a tile dropped. A name without a logo where the only official mark is too heavy for a 16 px icon
(Hermes Agent: 115 KB of path data), needs a license (Microsoft's trademark guidelines require one for
product icons), or is not published as SVG (Comet). Logos belong to their owners; showing one states only
the documented fact above.
