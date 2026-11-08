# site/ — landing page

SvelteKit 3 + Svelte 5 (runes only) + Tailwind 4 + TypeScript, prerendered by `adapter-static` into `build/`.

## Commands

- `just site-dev`: dev server with hot reload; `/api` is proxied to `just serve`. `just site-fmt`: format.
- `just site`: everything CI runs: svelte-check, Prettier + ESLint, Vitest, build, then Playwright (axe,
  390 px layout, no-JS content, the scan flow with a mocked API, the benchmark tabs) against the build.
- `just serve`: the build, the benchmark sites and the scan API (`/api/scan?url=`, Rust) on
  http://127.0.0.1:4173.

## Page narrative (keep this order; cut before adding)

Scan your site (hero, with two entry buttons: "Scan your site" and "Set up your agent") → sites already on
WebMCP (logos, each one scans live) → why WebMCP (four pains it removes, each backed by the draft or the
benchmark; the saving is computed) → proof (`#leaderboard`: pick a site by logo; biggest savings first) →
then one section per audience, each standing on its own (nobody has to do both):

- For sites (`#for-sites`, `features/fix`, where a scan's "Fix it" lands): install tabs (coding agent,
  HTML, npm), then your own tools (`#own`: `tool()`, forms, React/Vue/Svelte as tabs).
- For agents (`#for-agents`, `features/agents`; no site or scan needed): the whole-run token saving across
  models (`tokenSaving()`, computed from the published runs, left out when none is), one prompt with
  Copy, then the two ways as small print: MCP, or `document.modelContext` from any browser automation.

Then WebMCP vs MCP → what the community asked for → the footer (giant lockup, every link with its icon,
notices). The header and footer menus name both audiences ("For sites", "For agents"), in page order.
Tabs list "Agent" (the coding agent) first, always, then the most used options; the first opens by default
(`CodeTabs`, built on `Tabs`). The agent section is one prompt, not a list of clients.
Few words per section; numbers over adjectives.

## Layout

```
src/
  app.css, app.html          Tailwind entry; `data-js` set before first paint (enables reveals)
  lib/styles/                tokens.css (design tokens), base.css, code.css; tokens.ts lists the colors
  lib/components/ui/         primitives: Button, Stamp, Card, CodeBlock, CodeTabs, CopyButton, Tabs, Section, BrandIcon
  lib/components/layout/     Header, Footer, Logo
  lib/features/<section>/    one folder per page section; logic in .ts with a *.spec.ts next to it
                             (scan/ holds the API client and the shared scanner state)
  lib/content/               copy, links, code samples, issues, verified sites, bench/<model>.json (data only)
  lib/motion/                Reveal (scroll-in) and its attachment
  lib/server/                build-time only (shiki); never imported by components
  routes/                    +page.server.ts highlights code and trims each bench/<model>.json at build time;
                             brand/ is the brand manual and design system
tests/                       Playwright e2e against the prerendered build
```

## Brand

- `/brand` is both the brand manual and the design system: name rules, the three marks with downloads
  (`static/brand-assets/`), construction, clear space, color (hex and contrast computed from `tokens.css`),
  type, components, misuse and trademark wording. Data lives in `lib/content/brand.ts`; the policy is the
  repo's `TRADEMARK.md`. Research and brief: `reports/Marca e logo do webmcpx.md` (outside the repo).
- The primary mark is the Junction; the lockup is "webmcp" with the Junction as the final x (`Logo`).
  Where the site fonts can't load (README, slides), use the outlined lockup in `static/brand-assets/lockup/`
  (`lockup-ink`, `lockup-paper`, `lockup` in currentColor), made by `scripts/lockup.py` from the font itself.
  Real brands' logos are never redrawn; new marks of our own go through a brief, Codex and the four checks
  (16px, one color, inverse, circle crop).
- The agent-ready badge comes in four styles (`lib/content/badges/`: Card for light pages, Flat for footers,
  Dark for dark pages, README: a Markdown image of the site's latest verdict served at `/badge/<host>.svg`)
  and is offered only after a scan says ready. The first three inline the SVG (`badgeEmbed()` in
  `features/scan/scan.ts`), so sites load nothing from us; every style links to a live re-scan of that
  site: a claim anyone can check, never a static seal.
- Every page carries the trademark notices (`NOTICES`) in the footer. Never call webmcpx official, a W3C
  standard or MCP certified.

## Design system rules

- Style: "paper and ink". Off-white paper, near-black ink, 2px outlines, short hard offset shadows, pill
  buttons, one highlighter yellow (`marker`) used sparingly. Serious and editorial: sentence-case headlines in
  Bricolage Grotesque, Geist for text, Geist Mono for small uppercase labels. No mascots or jokes.
- Colors come only from the tokens in `lib/styles/tokens.css` (`bg-paper`, `text-ink-2`, `border-ink`,
  `bg-marker`, ...). Tailwind's default palette is removed, so `bg-zinc-900` does not exist. A new color: add
  the variable, map it in `@theme inline`, list it in `tokens.ts`, and add its text/background pairs to
  `PAIRS` in `tokens.spec.ts` (4.5:1 contrast check). One theme only.
- Variants live in a `tv()` recipe exported from the component's `<script module>` (see Button). Pass layout
  classes from outside through `class`; don't add a variant for a one-off.
- Icons: `@lucide/svelte/icons/<name>` (one import per icon). Decorative icons get `aria-hidden="true"`.
- Site logos live in `lib/content/logos.ts` as path data and render with `SiteLogo` (currentColor; wordmarks
  keep their aspect ratio). Real brands use their own published artwork (simple-icons or the brand's site),
  with the source noted; never redraw or AI-generate a real brand's logo. Our fictional test brands (Orbit,
  Kiln & Co) have original marks. A test keeps logos to drawing data only.
- Motion: wrap blocks in `<Reveal>` (stagger with `delay`); transitions use `ease-out-expo`. Everything must
  respect `prefers-reduced-motion` (base.css has the global switch) and stay readable without JavaScript.
- No count-up numbers: figures are prerendered text, so crawlers and agents read them.
- Code samples live in `content/snippets.ts` and are highlighted at build time. Code always wraps and shows
  whole (`CodeBlock`, `code.css`): never a sideways scroll that hides part of a command (owner's rule).

## Data and copy

- "Why WebMCP?" (`content/why.ts`) and "WebMCP vs MCP" (`content/versus.ts`) come from the research in
  `reports/Por que adotar WebMCP.md` (outside the repo). Every reason names its source; our benchmark is
  labelled as ours and quoted as a best case, never an average. Don't add "safer", accessibility,
  analytics, discoverability or "faster than APIs" claims: the evidence is thin or points the other way.
  WebMCP is a browser API, not MCP on the wire: never call it "MCP for the browser".

- `lib/content/bench/<model>.json` (one per model) is copied from `bench/results/latest.json` by `just bench`;
  a model switcher picks the run (`lib/content/models.ts`: cheap and frontier per provider, provider logos
  in `logos.ts`), and the site and detail tabs stay put across models. Only the selected model renders; without
  JavaScript, each model has its own prerendered page (`routes/benchmark/[model]`), linked from the
  section. Every published model is shown, even with no showcased question. Never edit a results file by hand
  and never publish numbers that did not come from a run. Each run records where every task ran and what it
  asked (`tasks`, schema 3); the page groups results per site from that (`features/benchmark/sites.ts`),
  never from today's `bench/tasks`. Display names live in `lib/content/benchSites.ts`. The summary is
  computed in Rust (`crates/webmcpx-bench/src/report.rs`). Results are shown per site and per question, never averaged (owner's decision); sites (and their questions) are
  sorted by biggest saving and the section says so, so the first one shown is disclosed as the best case; and every question stays in the full table, which works without JS. Losses are shown, not hidden.
- Under each site's questions, tabs (with icons) show only that site: one chart per metric, its WebMCP tools
  as a table (name, description: the text the agent reads, and the calls the agent made) and the method.
  Tools and calls come from the same attempt. `Tabs` puts every panel in the HTML and hides inactive ones
  only when JavaScript runs, so all of it reads without JavaScript. Schema 4 runs record the tools the agent was given; for older runs the page uses
  `lib/content/tools.json` (`just bench-tools`, a dated snapshot) and says it was captured after the run.
- The benchmark section shows selected cases (owner's decision): questions where webmcpx used at most half
  the tokens and solved at least as often (`showcase()` in `features/benchmark/sites.ts`); sites without one
  are hidden. The rule, the "N of M questions" count and the link to the full results must stay visible
  next to it, and no number on the page may be computed over the selection as if it were the whole run.
- `lib/content/issues.ts`: every row must describe what the code does today.
- Words follow the WebMCP draft (Draft Community Group Report, 2 November 2026): tool, `name`/`title`/
  `description`, `inputSchema`, annotations (`readOnlyHint`, `untrustedContentHint`, `consequentialHint`),
  `document.modelContext.registerTool()`. webmcpx conventions (result envelope, paging, lint thresholds) are
  named as ours, never as spec rules. A benchmark item is a "question" (what the agent is asked on a site),
  never a "task", which the draft uses for event-loop tasks; "browser agent" means the browser's own agent.
- `lib/content/sites.ts`: only sites the scanner verified, with the date; re-check before keeping one.

## Conventions

- Imports use `#lib/...` with the file extension (`#lib/content/site.ts`). No barrel files.
- Components: PascalCase `.svelte`, typed `$props()` with an `interface Props`, snippets (not slots).
  Rune modules end in `.svelte.ts`.
- Internal links are English paths through `useI18n().href('/brand/')`, so readers stay in their language.
- Copy lives in `lib/i18n/dict/en.ts` (typed `Messages`); components read `useI18n().m`. Sentences with markup
  use `Rich` with `{placeholders}`, counts use `i18n.plural()`. Never concatenate translated fragments.

## Languages (i18n)

- 11 languages (`lib/i18n/locales.ts`): the most spoken left-to-right ones plus Japanese. English is at `/`,
  the rest under `/<code>/`; every page is prerendered in every language, with `<html lang>` and hreflang.
  No automatic redirect: an English page offers the browser's language once (`LanguageSuggestion`).
- Every language is a transcreation, written as a local developer-marketing writer would, never a literal
  translation: same facts and caveats, local idiom, the terms local developers really use, local typography
  (French thin spaces, German „…“, CJK full-width punctuation). Brand, API, tool and code names stay as is.
- A copy change lands in `dict/en.ts` and in every `dict/<code>.ts` in the same PR (TypeScript fails on a
  missing key). Respect the length notes in `en.ts`; check the layout with `tests/i18n.spec.ts` (no
  overflow at 390 and 1280 px in every language) and look at the screenshots for CJK and Indic scripts.
- Scripts the brand fonts lack use native system fonts (`base.css`, `:lang()` rules): CJK and Indic get
  smaller, untracked display type; Chinese headings break only at punctuation and at `\u200b` placed in the
  copy. The wordmark (`font-brand`) is artwork and never changes font.
- Must work at 390 px wide without horizontal scroll, and with keyboard only. Anything that moves on its own
  (the question rotator) pauses on hover and focus, has a pause control, and stays still for reduced motion.
