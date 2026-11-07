# AGENTS.md — webmcpx

## Verify (run before every commit; it is exactly what CI runs)
- `just check` — fmt, clippy (native + wasm32, `-D warnings`), wasm build, tests (incl. Chrome e2e), JS e2e, size budgets,
  landing check/test/build, cargo deny + shear.
- Fast loop: `just test -p <crate>` (e.g. `just test -p webmcpx-lint`).
- Snapshots: `cargo insta test`, then `cargo insta review`. Never edit `.snap` files by hand.
- After a wasm or loader change: `just wasm js-test size` (the size gate fails the build).
- First time: `just setup`.

## Map
- `crates/webmcpx-core` — the single source of truth: name rules, limits, invisible-Unicode set, result envelope, error codes. `no_std`.
- `crates/webmcpx-std` — standard tool contracts (`tools.rs`) + pure `&str -> envelope JSON` implementations. `no_std`.
- `crates/webmcpx-wasm` — `#[wasm_bindgen]` exports of webmcpx-std. See its AGENTS.md.
- `crates/webmcpx-lint` — rules, one file each in `src/rules/`. `crates/webmcpx` — the CLI.
- `packages/webmcpx` — npm loader: the public browser API. Owns the DOM and `registerTool()`.
- `crates/webmcpx-bench` + `bench/` — benchmark: same agent and pages, with vs without WebMCP. See `bench/AGENTS.md`.
  Run: `OPENAI_API_KEY=... just bench`.
- `site/` — landing (SvelteKit 3, Svelte 5 runes, Tailwind 4, static). Shows `site/src/lib/content/bench.json`. See `site/AGENTS.md`.

## Rules the tooling does not catch
1. A contract changes in one place (`webmcpx-std/src/tools.rs` or `webmcpx-core`). Then run `just gen`;
   the diff of `packages/webmcpx/src/generated.js` belongs in the PR. Never edit generated files.
2. Tools never reject for expected failures: return an envelope with an error `Code`. Hosts drop rejection
   reasons (webmcp#282). In JS, every `execute` goes through `guard()`.
3. New error code → add it to `webmcpx-core/src/codes.rs` with its `explain()` text. Error codes, rule
   names, tool names, the `--json` shape and exit codes (0/1/2) are stable public API.
4. WebAssembly gets pure string -> string functions only: no `web-sys`, no serde, no `format!`, no Unicode
   tables on the hot path (each costs kilobytes; check with `just wasm size`).
5. New lint rule: `crates/webmcpx-lint/src/rules/<snake_name>.rs` with a `RULE` static and pass/fail tests,
   plus one line in `RULES`. New rules start with `preview: true`. Reuse `webmcpx-core` validators.
6. CLI output is deterministic: sorted, no timestamps. Data to stdout, human errors to stderr.
7. A bug fix starts with a failing test.
8. New dependency (Rust or npm) needs a reason in the PR; for wasm, include the size delta from `just size`.

## Don't
- Don't touch versions, `CHANGELOG.md` or release workflows (release-plz owns them).
- Don't use `#[allow]`; use `#[expect(lint, reason = "...")]`.
- Don't add options or abstractions "for later": a safe default beats a setting; generalize on the third use.

## Review (required before every merge)
- Work on a branch. Before merging, run `just review` (Codex, `gpt-6.1-sol`, high reasoning; prompt in
  `scripts/review.md`). Fix each finding, or rebut it with evidence via `just review-reply "<reply>"`.
- Repeat until Codex ends with `VERDICT: NO SUBSTANTIAL FINDINGS`. Only substantial findings count;
  ignore style nits. Summarize the rounds (finding → fix or rebuttal) in the PR description.

## PRs
- Conventional Commits title: `feat(std): ...`, `fix(lint): ...`, `docs: ...`.
- Disclose AI help with an `Assisted-by: <tool>` trailer. You must understand every line you submit.
