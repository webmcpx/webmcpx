# site/ — landing page

SvelteKit 3 + Svelte 5 (runes only) + Tailwind 4 + TypeScript, prerendered by `adapter-static` into `build/`.

## Commands

- `just site-dev`: dev server with hot reload; `/api` is proxied to `just serve`. `just site-fmt`: format.
- `just site`: everything CI runs: svelte-check, Prettier + ESLint, Vitest, build, then Playwright (axe,
  390 px layout, no-JS content, the scan flow with a mocked API, the benchmark tabs) against the build.
- `just serve`: the build, the benchmark sites and the scan API (`/api/scan?url=`, Rust) on
  http://127.0.0.1:4173. The style guide is at `/design`.

## Page narrative (keep this order; cut before adding)

Scan your site (hero) → sites already on WebMCP (logos, each one scans live) → proof (pick a site by logo,
then a question; best live case first; full table behind a disclosure) → the fix (one line) → what the community asked for → scan again.
Few words per section; numbers over adjectives.

## Layout

```
src/
  app.css, app.html          Tailwind entry; `data-js` set before first paint (enables reveals)
  lib/styles/                tokens.css (design tokens), base.css, code.css; tokens.ts lists the colors
  lib/components/ui/         primitives: Button, Stamp, Card, CodeBlock, CopyButton, Tabs, Section, BrandIcon
  lib/components/layout/     Header, Footer, Logo
  lib/features/<section>/    one folder per page section; logic in .ts with a *.spec.ts next to it
                             (scan/ holds the API client and the shared scanner state)
  lib/content/               copy, links, code samples, issues, verified sites, bench.json (data only)
  lib/motion/                Reveal (scroll-in) and its attachment
  lib/server/                build-time only (shiki); never imported by components
  routes/                    +page.server.ts highlights code and trims bench.json at build time;
                             design/ is the style guide
tests/                       Playwright e2e against the prerendered build
```

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
- Icons: `@lucide/svelte/icons/<name>` (one import per icon); brand logos: `simple-icons` via `BrandIcon`.
  Decorative icons get `aria-hidden="true"`.
- Motion: wrap blocks in `<Reveal>` (stagger with `delay`); transitions use `ease-out-expo`. Everything must
  respect `prefers-reduced-motion` (base.css has the global switch) and stay readable without JavaScript.
- No count-up numbers: figures are prerendered text, so crawlers and agents read them.
- Code samples live in `content/snippets.ts` and are highlighted at build time.

## Data and copy

- `lib/content/bench.json` is copied from `bench/results/latest.json` by `just bench`; never edit it by hand
  and never publish numbers that did not come from a run. Each run records where every task ran and what it
  asked (`tasks`, schema 3); the page groups results per site from that (`features/benchmark/sites.ts`),
  never from today's `bench/tasks`. Display names live in `lib/content/benchSites.ts`. The summary is
  computed in Rust (`crates/webmcpx-bench/src/report.rs`). Results are shown per site and per question, never averaged (owner's decision); the featured site
  is labelled as the best case, and every question stays in the full table, which works without JS. Losses are shown, not hidden.
- `lib/content/issues.ts`: every row must describe what the code does today.
- `lib/content/sites.ts`: only sites the scanner verified, with the date; re-check before keeping one.

## Conventions

- Imports use `#lib/...` with the file extension (`#lib/content/site.ts`). No barrel files.
- Components: PascalCase `.svelte`, typed `$props()` with an `interface Props`, snippets (not slots).
  Rune modules end in `.svelte.ts`.
- Internal links go through `resolve()` (`content/site.ts`).
- Must work at 390 px wide without horizontal scroll, and with keyboard only.
