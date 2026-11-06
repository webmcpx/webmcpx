# bench/ — benchmark data

The harness is `crates/webmcpx-bench`; this directory holds what it runs.

- `sites/<name>/index.html` — a fixture site served at `/sites/<name>/`. Sites import the loader from
  `/webmcpx/src/index.js` (the code under test). Custom tools follow the webmcpx envelope contract and
  call the same functions as the UI.
- `tasks/<id>.toml` — one task: `site` (a fixture) or `url` (a live page), `prompt`, optional `max_steps`, and a `[check]` with
  `answer_contains` (all), `answer_any` (at least one), `answer_excludes` (none) and/or `state` (a JS expression that must be truthy after the run).
- `results/` — run outputs (git-ignored). `latest.json` follows `schema_version` 1 (`report.rs`).

Rules:
1. Grading is deterministic. Never add an LLM judge.
2. Both arms get the same page, prompt, system prompt, model and step limit; only the tools differ.
   Don't tune a task to favor one arm. A task must be solvable from the page alone, in both arms.
3. Prompts read like a real user; facts the check needs must be on the page, with a plausible distractor.
4. A new task or site lands with a scripted e2e test only if it exercises new harness behavior.
5. Live tasks (`live-*.toml`, `url = ...`) use public sites that already register WebMCP tools. Find them
   with `webmcpx-bench probe <url>`, check the fact with `webmcpx-bench call <url> <tool> '<json>'` and
   the page itself, and note the date and source in a comment. Read-only questions only: never add to a
   real cart, check out, book, or send messages. Live facts drift; a failing live task is re-verified
   before anyone blames an arm.
