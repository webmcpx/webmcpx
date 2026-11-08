# bench/ — benchmark data

The harness is `crates/webmcpx-bench`; this directory holds what it runs.

- `sites/<name>/index.html` — a fixture site served at `/sites/<name>/`. Sites import the loader from
  `/webmcpx/src/index.js` (the code under test). Custom tools follow the webmcpx envelope contract and
  call the same functions as the UI.
- `tasks/<id>.toml` — one task: `site` (a fixture) or `url` (a live page), `prompt`, optional `max_steps`, and a `[check]` with
  `answer_contains` (all), `answer_any` (at least one), `answer_excludes` (none) and/or `state` (a JS expression that must be truthy after the run).
- The baseline arm is a competent DOM agent (`crates/webmcpx-bench/src/arm.rs`, `js/baseline.js`): `read_page`
  (a text snapshot with refs, links with where they go, selects with their options; long pages in parts by
  `offset`), `navigate` (any URL, relative to the page), `click` and `fill`. Don't weaken it: a skeptic's first
  question is whether the baseline was a strawman.
- `observations/<model>.jsonl` — what every tool call returned, per run (`just bench` writes it next to the
  results file); the results file keeps only sizes. Commit both.
- `results/` — run outputs (git-ignored). `just bench --model <id>` publishes the run as
  `site/src/lib/content/bench/<id>.json`, one file per model. `latest.json` follows `schema_version` 4 (`report.rs`); it records the task metadata (site or URL, prompt) of the run, so editing a task never relabels old numbers, and the tools (name, description) each WebMCP run was given.

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
6. A check found wrong after a run (it rejected a correct answer, or passed a wrong one) is fixed in the task
   file and applied with `just bench-regrade`: it re-grades the stored answers of both arms and never
   re-runs anything (every published model). Say which runs changed and why in the commit.
7. Models: the cheap and the frontier model of OpenAI, Anthropic and Google (`site/src/lib/content/models.ts`),
   all at effort medium. The provider follows the model name (`claude-*`, `gemini-*`, else OpenAI) and its
   key comes from `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`. List prices live in
   `model.rs` with the date they were read; a run stores the price it used.
