# 0002: The scan gives an agent-ready score; "agent-ready" needs WebMCP and 70 of 100

- **Status:** accepted (2026-11-08), for the launch
- **Code:** `crates/webmcpx-bench/src/scan.rs` (`score`, `READY_SCORE`, `AGENT_CHECKS_JS`), the scan result
  (`site/src/lib/features/scan/ScanResult.svelte`) and `/verdicts`

## Context

The scan's verdict looked only at WebMCP: tools registered and no lint errors meant "agent-ready".
isitagentready.com (2026-11-08) scores a site on presence checks across five areas (discoverability, content
accessibility, bot access control, API/auth/MCP discovery, commerce) and gave webmcpx.dev 33. The owner
wanted the scan to say more about a site's readiness for agents, as a score with a clear bar for the badge,
while keeping WebMCP as the heart of it.

Two things set our scan apart and stay at its center: we open the page in a real browser and find the
WebMCP tools the page registers, lint them, and measure what reading the page costs an agent in tokens.
Presence-only checks can't see any of that.

## Decision

A score out of 100, every item in `score_items` (id, points, max):

| Area | Points | Checks |
|---|---|---|
| WebMCP | 50 | tools registered (25), no lint errors (15), every tool described (5), every tool says what it does to the page in WebMCP's terms: `readOnlyHint` or `consequentialHint` (5) |
| Agent cost | 15 | full when the page has tools (agents call them); else by the page's token estimate: ≤ 2,000 → 15, ≤ 5,000 → 10, ≤ 10,000 → 5 |
| Readable | 20 | `/llms.txt` ([llmstxt.org](https://llmstxt.org/)), a Markdown version (served for `Accept: text/markdown` or linked `rel="alternate"`), robots.txt not shutting AI agents out, a sitemap (5 each) |
| Discoverable | 15 | `Link` headers ([RFC 8288](https://www.rfc-editor.org/rfc/rfc8288)), `/.well-known/agent-skills/index.json` ([Agent Skills Discovery RFC v0.2.0](https://github.com/cloudflare/agent-skills-discovery-rfc)), `/.well-known/api-catalog` ([RFC 9727](https://www.rfc-editor.org/rfc/rfc9727)) (5 each) |

**Agent-ready** = WebMCP tools, no lint errors **and** a score of 70 or more (`READY_SCORE`). Clean, annotated
tools score 65 alone; the bar asks for at least one agent basic on top (a robots.txt that doesn't block
agents counts, as does a sitemap). Sites with tools that miss it are "almost", with what to fix.

Not scored on purpose: OAuth/OIDC discovery, auth.md, payments (x402, MPP, UCP, ACP), DNS-AID, Web Bot Auth,
MCP server cards. They describe things most sites don't have and shouldn't need to be agent-ready; scoring
them would reward publishing empty manifests.

## How the checks run

In the scan browser, behind the same egress proxy as the page (public addresses only), after the page is
read: the browser loads the site's own `/robots.txt` (or, when Chrome shows its error page for it, the page
again) with the page's Content-Security-Policy bypassed, so a strict `connect-src` can't hide files that
exist, and runs same-origin `fetch` calls from an isolated world. Each request aborts after 3 s and drops its
body past 64 KiB; the whole set is bounded by 10 s. Only booleans come back: nothing the site wrote reaches
our server. The one thing read from the page itself, a `rel="alternate"` Markdown link, is read before.

robots.txt follows [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309): a 4xx means no rules (everything
allowed), a 5xx or no answer means the policy can't be read (no points). Otherwise each known AI agent and `*`
gets its effective group (its own, else `*`), and the longest rule matching the home page wins, Allow on ties,
`*` and `$` wildcards included: `Disallow: /*` is a ban.

## Consequences

- Sites on the logo wall that ship WebMCP tools keep their verdict as long as they have one basic; the
  scanner says which.
- The share card and the scan API carry the score; `/verdicts` documents the weights and the bar.
- The weights are ours, stated here and on `/verdicts`; a change to them is a new decision record.

## Changes

- **2026-11-09:** `destructiveHint` no longer counts toward "every tool annotated". It is an MCP annotation
  that WebMCP does not define and browsers ignore (`webmcpx-core`, `Annotation::MCP_ONLY`; the linter warns on
  it), so it told the agent's host nothing. A site whose tools carried only `destructiveHint` loses those 5
  points; the check now uses the same definitions as the linter.
- **2026-11-09:** a page's `<form toolname>`s count as tools (the declarative API, which browsers with
  WebMCP expose with or without a script), with their `tooldescription` and named fields. Before, a site
  that used only forms was scanned as having no tools. Forms the page also registers are counted once.
