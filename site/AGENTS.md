# site/ — landing page

SvelteKit 3 + Svelte 5 (runes only) + Tailwind 4 + TypeScript, prerendered by `adapter-static` into `build/`.

## Commands

- `just site-dev`: dev server with hot reload. `just site-fmt`: format.
- `just site`: everything CI runs: svelte-check, Prettier + ESLint, Vitest, build, then Playwright (axe in both
  themes, 390 px layout, keyboard tabs, no-JS content, the playground) against the build.
- `just serve`: the build plus the benchmark sites on http://127.0.0.1:4173. The style guide is at `/design`.

## Layout

```
src/
  app.css, app.html          Tailwind entry; theme + `data-js` set before first paint
  lib/styles/                tokens.css (design tokens), base.css, code.css; tokens.ts lists the colors
  lib/components/ui/         primitives: Button, Badge, Card, CodeBlock, CopyButton, IconTile, Tabs, Section
  lib/components/layout/     Header, Footer, Logo, ThemeToggle
  lib/features/<section>/    one folder per page section; its logic in .ts with a *.spec.ts next to it
  lib/content/               copy, links, code samples, issues, bench.json (data, no markup)
  lib/motion/                Reveal (scroll-in) and its attachment
  lib/server/                build-time only (shiki); never imported by components
  routes/                    +page.server.ts highlights code at build time; design/ is the style guide
tests/                       Playwright e2e against the prerendered build
```

## Design system rules

- Colors come only from the semantic tokens in `lib/styles/tokens.css` (`bg-surface`, `text-muted`,
  `border-border`, `bg-accent`, ...). Tailwind's default palette is removed, so `bg-zinc-900` does not exist.
  A new color: add the variable to both themes, map it in `@theme inline`, list it in `tokens.ts`; the token
  test then checks it exists and, if it is text, add its pairs to `PAIRS` for the 4.5:1 contrast check.
- Dark is the default theme; light must look as finished. Use `dark:` only when a token cannot express it.
- Variants live in a `tv()` recipe exported from the component's `<script module>` (see Button). Pass layout
  classes from outside through `class`; don't add a variant for a one-off.
- Icons: `@lucide/svelte/icons/<name>` (one import per icon); brand logos: `simple-icons` via `BrandIcon`.
  Decorative icons get `aria-hidden="true"`.
- Motion: wrap blocks in `<Reveal>` (stagger with `delay`); transitions use `ease-out-expo`. Everything must
  respect `prefers-reduced-motion` (base.css has the global switch) and stay readable without JavaScript.
- No count-up numbers: figures are prerendered text, so crawlers and agents read them.
- Code samples live in `content/snippets.ts` and are highlighted at build time. Outputs shown on the page
  (lint diagnostics, tool envelopes) must be copied from real runs.

## Data and copy

- `lib/content/bench.json` is copied from `bench/results/latest.json` by `just bench`. Never edit it by hand
  and never publish numbers that did not come from a run. Formatting lives in `features/benchmark/bench.ts`
  (the summary itself is computed in Rust, `crates/webmcpx-bench/src/report.rs`). Losses are shown, not hidden.
- `lib/content/issues.ts`: every row must describe what the code does today.

## Conventions

- Imports use `#lib/...` with the file extension (`#lib/content/site.ts`). No barrel files.
- Components: PascalCase `.svelte`, typed `$props()` with an `interface Props`, snippets (not slots).
  Rune modules end in `.svelte.ts`.
- Internal links go through `resolve()` (`content/site.ts`).
- Must work at 390 px wide without horizontal scroll, in both themes, with keyboard only.
