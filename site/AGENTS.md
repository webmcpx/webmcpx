# site/ — landing page

SvelteKit 3 + Svelte 5 (runes only) + Tailwind 4, prerendered by `adapter-static` into `build/`.

- Dev: `just site-dev`. Verify: `just site` (svelte-check, vitest, build). Preview the build with the
  benchmark sites: `just serve` (http://127.0.0.1:4173).
- Data: `src/lib/bench.json` is copied from `bench/results/latest.json` by `just bench`. Never edit it by hand
  and never publish numbers that did not come from a run. Types and formatting live in `src/lib/bench.ts`
  (the summary itself is computed in Rust, `crates/webmcpx-bench/src/report.rs`).
- `src/lib/issues.ts` lists spec-tracker pain points; every row must describe what the code does today.
- Imports use the `#lib/...` alias with the file extension (`#lib/bench.ts`).
- Logic goes in `.ts` modules with a `*.spec.ts` next to them; components stay presentational.
- Must work at 390 px wide without horizontal scroll, in light and dark mode.
