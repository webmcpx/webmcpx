# Benchmark methodology

What the webmcpx benchmark measures, how, and what it can and cannot support. The current method version is in
[`CHANGELOG.md`](CHANGELOG.md); independent reviews and how each point was handled are in [`audits/`](audits/).
Rules for changing any of this: [`AGENTS.md`](AGENTS.md) and the "Evidence" section of the root `AGENTS.md`.

## Question

On the same page, with the same model and the same question, how much does an agent gain (tokens, time, steps,
cost, success) when it calls the page's WebMCP tools instead of reading and driving the page as a browser agent?

## Design

Two arms, everything equal but the tools:

| | Baseline | WebMCP |
|---|---|---|
| Page | the task's page, headless Chrome | the same |
| Model, reasoning effort | the run's model, `medium` | the same |
| System prompt | `agent.rs::SYSTEM_PROMPT` ("the page is the source of truth, not your own knowledge") | the same |
| User prompt | the task's `prompt` | the same |
| Step limit | 12 model turns unless the task sets `max_steps` | the same |
| Tools | `read_page` (text snapshot with refs; links with their destination; selects with options and values; long pages in parts by `offset`), `navigate` (any URL), `click`, `fill` (a select by label or value) | only the tools the page registers with `document.modelContext` |
| Result cap | 40,000 characters per tool result | the same |

The baseline follows DOM-snapshot browser agents such as Playwright MCP and browser-use. It was strengthened
after the 2026-11-08 audit (method v2): a skeptic's first question is whether the baseline was a strawman.

Both arms get the same scripts injected before the page's own (a reference WebMCP host, `src/js/host.js`, and
the baseline's snapshot code, `src/js/baseline.js`); the host exposes WebMCP only in secure contexts, as browsers
do.

## Tasks

`tasks/*.toml`, one question each, on 6 sites (method v2): Cloudflare developer docs, Notion developer docs,
specification.website and a WooCommerce demo store (live sites that ship their own WebMCP tools), plus two local
fixtures served by the harness (`sites/docs`, an invented CLI's docs; `sites/store`, a small shop) whose tools come
from webmcpx. Most questions are read-only fact lookups; three change a cart (local store), graded on page state.

Live tasks were picked on sites that already register WebMCP tools (`webmcpx-bench probe`), and each fact was
checked on the page and through the tool, with the date and source in the task file. Facts drift: a failing live
task is re-verified before anyone blames an arm.

Limits of the workload (also on the site's Method tab): 30 questions is a case study, not a census of the web;
the largest savings come from the live sites' own site-wide search tools, not from installing webmcpx on an
arbitrary page.

## Runs

3 attempts per question and arm (`--repeat 3`), 4 in flight at once by default (`config.concurrency`). Each run
records its model, reasoning effort, the prices it used, the harness revision and limits (`config`), and per
attempt: start time, answer, stop reason, steps, tool calls (name, arguments, result size), token usage, time,
cost, grade and, when it failed, why. What every tool call returned is in `observations/<model>.jsonl`.

## Grading

Deterministic, never an LLM judge (`task.rs`):

- `answer_contains` (all), `answer_any` (at least one), `answer_excludes` (none): case- and whitespace-insensitive
  terms, Markdown emphasis ignored; a number matches a number by value (`106` matches `$106.00`, not `1,060`).
- An answer that says it came from the model's own knowledge, or that it could not get or confirm the answer on
  the page, fails in both arms: the benchmark measures finding the answer on the page.
- `state`: a JavaScript expression that must be true on the page after the run (cart contents).
- A run succeeds only if the agent answered (not out of steps) and every check passes.

A check found wrong after a run is fixed in the task file and applied to stored answers with `just bench-regrade`
(both arms, every model, nothing re-run). Each regrade is recorded in the results file's `history` with the runs
whose grade changed.

Failed runs are classified (`failure`): `harness` (the harness failed, not the agent), `step_limit`,
`model_error`, `blocked` (the site showed a bot or connection check), `ungrounded`, `abstained` (the agent said
it did not find the answer) or `wrong`. A harness failure is rerun for both arms of that question, with the
replacement recorded in `history`.

## Metrics

- **Success rate:** solved attempts / attempts.
- **Tokens:** input (cache reads included) + output (reasoning included), as each provider reports them.
  Compare within a model; token counts are not comparable across providers.
- **Time:** the agent loop (model and tool calls), after the page loaded and, in the WebMCP arm, its tools were
  listed. Includes network latency to the provider; not a controlled latency benchmark.
- **Steps:** model turns.
- **Cost:** the benchmark model's API usage at the list prices in `src/model.rs` (with the date they were read,
  stored in each results file), cache reads at their price. Work done behind a site's tools is not counted.
  Promotional prices expire; a cost ranking can change without any behavior change.

## Presentation

- **Per site, never averaged across sites** (site/AGENTS.md); every question and both arms are published.
- **Selected cases** on the landing: questions where WebMCP used at most half the tokens and did not solve less
  (`SHOWCASE_MIN_SAVING = 2`); the rule and the count are shown next to them, with a link to all results.
- **Leaderboard:** success with WebMCP, then lower cost per run, then id, as agent leaderboards rank (HAL,
  Aider). When models tie on success, the order is a cost ranking; the caption says how it is ranked.

## Uncertainty

3 of 3 solved is evidence, not proof of 100%: the exact 95% binomial interval for 3/3 is about 29%–100%. Ratios
are of means over 3 attempts; per-attempt values are in the results. Increase `--repeat` before making
comparative reliability claims between models.

## Threats to validity

- **Site behavior:** live sites change content, rate-limit or show bot checks to headless browsers. Bot checks are
  recorded as `blocked`; the Allbirds tasks were removed in v2 because they measured a bot wall, not the agent.
- **Fixtures we wrote:** the local sites and their tools are ours; they exercise the drop-in loader and the
  `<form toolname>` path, and are labeled "local" on the site.
- **Provider differences:** reasoning effort `medium` and token accounting differ by provider.
- **Caching:** repeated tasks share prompt-cache benefits differently per arm and provider (see `cached` usage).
- **Provenance:** the published runs (method v2) were made from a working tree with uncommitted changes; each
  results file records it (`config.uncommitted_changes: true`), and the exact code is not recoverable from the
  repository. The next published run comes from a clean commit.
- **Tokens, not time:** the benchmark measures the tokens an agent reads and writes; fewer tokens is not
  claimed to mean faster answers.

## Reproduce

```sh
git clone https://github.com/webmcpx/webmcpx
cd webmcpx && just setup
ANTHROPIC_API_KEY=... just bench --model claude-haiku-5-5 --reasoning-effort medium
```

Each model's page on webmcpx.dev shows its own command (provider key and model id).

## References

- WebMCP draft and explainer: <https://github.com/webmachinelearning/webmcp>
- W3C WebMCP polyfill used by the bridge and the drop-in: <https://www.npmjs.com/package/@w3c/webmcp-polyfill>
- Baseline style: Playwright MCP <https://github.com/microsoft/playwright-mcp>, browser-use
  <https://github.com/browser-use/browser-use>
- Leaderboard ranking practice: HAL, Holistic Agent Leaderboard (Princeton) <https://hal.cs.princeton.edu>,
  Aider leaderboards <https://aider.chat/docs/leaderboards/>
- Prices (dates in `src/model.rs`): OpenAI <https://developers.openai.com/api/docs/pricing>, Anthropic
  <https://platform.claude.com/docs/en/about-claude/pricing>, Google <https://aistudio.google.com/docs/pricing>
- Exact binomial (Clopper–Pearson) interval: Clopper & Pearson (1934), Biometrika 26(4):404–413.
