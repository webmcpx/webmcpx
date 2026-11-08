# Audit: benchmark reliability (2026-11-08)

- **Reviewer:** Codex (`gpt-6.1-sol`, reasoning high), read-only, asked to judge the benchmark as a skeptical
  researcher, competitor or journalist would (prompt: "is it trustworthy; separate must-fix, disclose, solid").
- **Scope:** the harness (`crates/webmcpx-bench`), tasks and fixtures (`bench/`), the six published result files
  and how the site and README present them, at `origin/main` `6a4978f`.
- **Verdict:** 4 must-fix findings. The arithmetic of the published files reconciled; the weaknesses were
  grading, the baseline's capabilities, attribution of failures and auditability.

## How each finding was handled

| # | Finding | Handling | Where |
|---|---|---|---|
| A1 | "Solved" did not always mean answered correctly (term matching; ungrounded answers passed) | Fixed: answers that say they did not come from the page fail in both arms; checks require full values (24×24, 4.5:1, 200 ms); ORBIT_HOME wrong only when offered as the answer. Regrade: 8 Claude Haiku baseline runs flipped to failed; no other model changed. | `28d5bc1`; `bench/CHANGELOG.md` v1.1 |
| A2 | The baseline lacked navigation, link destinations, select options and access past 40,000 chars | Fixed: competent DOM baseline (navigate, links with destinations, options with values, read in parts). All models rerun. | `606993e`, `f120776`; `bench/CHANGELOG.md` v2 |
| A3 | Site bot checks counted as agent failures (all of GPT-6.1 Sol's baseline failures were Allbirds' bot check) | Fixed: every failed run records `failure` (`blocked`, `ungrounded`, `abstained`, `step_limit`, `wrong`, `harness`). Then, by owner decision, the Allbirds tasks were removed: they measured a bot wall, not the agent. | `28d5bc1`; `bench/CHANGELOG.md` v2 |
| A4 | Results could not be audited independently (no observations, no harness revision, no regrade history; one reproduce command for every model) | Fixed: results schema 5 (`config` with harness revision, limits and tools; per-attempt `started_at`; `history` of regrades and reruns); every tool result in `bench/observations/<model>.jsonl`; per-model reproduce commands. | `606993e`; `bench/METHODOLOGY.md` |
| B5 | Narrow workload; the biggest wins come from sites' own search tools | Disclosed on the site (Method tab) and in `bench/METHODOLOGY.md`. | `606993e` |
| B6 | 3 runs give weak uncertainty; the leaderboard is a cost ranking among tied models | Disclosed (Method tab; METHODOLOGY "Uncertainty", "Ranking"). | `606993e` |
| B7 | Time excludes page load and tool discovery | Defined in `config.timing` and the Method tab. | `606993e` |
| B8 | Cost and cache context | Defined in `config.cost` and METHODOLOGY (dated list prices, cache reads, site-side work not counted). | `606993e` |

## The review, verbatim

Four issues need resolution before further promotion. The published arithmetic is consistent; the main weaknesses concern grading, the baseline’s capabilities, attribution of failures, and auditability. No files were changed.

**(A) Must fix before promoting the benchmark**

1. **High — “Solved” does not reliably mean the question was answered correctly.**

   [task.rs:90](crates/webmcpx-bench/src/task.rs:90) checks for terms anywhere in the answer, without determining what the answer asserts.

   There is an actual published false positive: [Haiku’s refund-method answer](site/src/lib/content/bench/claude-haiku-5-5.json:1919), baseline attempt 2, explicitly says it could not obtain the answer, then repeats both alternatives: original payment method **or** store credit. It passes because [the check accepts “original”](bench/tasks/live-allbirds-refund-method.toml:7). Correcting this single grade changes Haiku baseline success from **98/105 to 97/105**, or **93.3% to 92.4%**.

   Other checks have similarly material weaknesses:

   - “The minimum size is 24 by 1 CSS pixels” passes the touch-target check.
   - “Normal body text needs 3:1; only large text needs 4.5:1” passes the contrast check.
   - “The target is 200 seconds” passes the INP check.
   - A correct explanation distinguishing `ORBIT_CONFIG` from `ORBIT_HOME` fails because merely mentioning the latter is forbidden.

   Grounding is also unchecked. Haiku’s `live-notion-rich-text-limit`, baseline attempt 2, explicitly says its answer comes from its own knowledge rather than the page, yet counts as solved.

   **Fix:** audit all stored answers, add deterministic checks for the actual assertions, units, dimensions, contradictions and abstentions, then regrade both arms across all models. Distinguish factual correctness from verified retrieval. Preserve the original and revised grades with reasons. Keep the deterministic grading policy; adding an LLM judge is unnecessary.

2. **High — The baseline has avoidable information-access limitations that materially inflate the comparison.**

   [arm.rs:109](crates/webmcpx-bench/src/arm.rs:109) offers only `read_page`, `click` and `fill`. Its snapshot also:

   - Omits link destinations.
   - Omits select options and their values.
   - Replaces interactive elements’ contents with labels capped at 80 characters.
   - Cuts results at 40,000 characters, with no offset, pagination or search operation to recover the remainder.

   These are consequential omissions, rather than merely a simpler presentation. Haiku’s `live-notion-request-limit` baseline answers identify `/reference/request-limits` in the plain-text documentation index but explain that they cannot open it because there is no clickable link or navigation tool. All three attempts fail. This becomes Haiku’s largest showcased saving: **45.2×**, comparing a successful search tool with an agent unable to navigate to the source it found.

   Repeated reads cannot recover text beyond the fixed cutoff. The published traces contain such truncated reads, including on headline documentation cases.

   **Fix:** provide a competent DOM baseline with URL navigation, complete accessible control information, recoverable snapshots and appropriate keyboard/wait operations. Verify that every question’s evidence is reachable through that interface, then rerun. Alternatively, narrow every claim explicitly to this limited three-tool baseline and publish a comparison against a stronger browser agent before generalizing.

3. **High — The published reliability improvement includes site-access failures without explaining that distinction.**

   In `gpt-6.1-sol.json`, **all five failed baseline answers** report Allbirds connection-verification screens: return-window attempts 2–3 and all three sock-return attempts. The WebMCP arm succeeds through the store’s tool route.

   Consequently, the Allbirds **“3 → 5 fully solved”** result in [README.md:101](README.md:101) does not isolate improved reasoning or tool-use reliability. Different routes encounter different access conditions. Similar failures appear for Haiku, Opus and Flash.

   This can be a useful real-world benefit of the tool route, but it must be identified. The current harness distinguishes neither blocked content nor unavailable evidence from an agent’s substantive failure.

   **Fix:** publish outcome categories separating incorrect answers, exhausted budgets, unavailable content and infrastructure failures. Retain the live operational comparison, explicitly including access differences, and add an equal-access fixture or replay comparison for claims about agent competence. Predeclare how blocked runs are handled; avoid rerunning until access happens to succeed.

4. **High — Published artifacts do not preserve enough evidence or provenance to independently audit the experiment.**

   [agent.rs:36](crates/webmcpx-bench/src/agent.rs:36) records tool names, arguments and result lengths, but discards the observations themselves. [report.rs:19](crates/webmcpx-bench/src/report.rs:19) omits the harness/fixture revision, original checks, step limits, complete tool schemas, resolved model versions and per-attempt timestamps. State-check evidence is not retained, and regrading skips state checks.

   There is a concrete provenance gap: commit **`5460f28`** replaces all six Argon `live-notion-rich-text-limit` runs after an original navigation timeout. The commit documents a symmetric rerun, which is reasonable, but the published JSON retains one original top-level `started_at` and contains no replacement history. A reader downloading the file cannot identify the repaired attempts or original failure.

   Reproduction instructions also show the same default `OPENAI_API_KEY=... just bench` command on every model’s page; that command runs Luna.

   **Fix:** publish immutable observations and a manifest containing configuration, source revisions, checks, tool schemas and per-attempt provenance. Preserve superseded runs and machine-readable regrade/replacement history. Record the supported model pinning and decoding defaults, and generate model-specific reproduction commands. Existing Git explanations should accompany the downloadable results.

**(B) Should disclose or improve**

5. **Medium — The workload supports a narrow case study, not general browser-agent conclusions.**

   The corpus contains **35 questions on seven sites**, repeated three times per arm: ten questions on two author-built fixtures and 25 on five live origins, including the WooCommerce demo. **32 questions are informational; three change cart state, all on the same local fixture.**

   The live documentation questions largely ask for individual facts, while their WebMCP tools offer site-wide search. The largest wins therefore demonstrate the value of those sites’ search tools; they do not establish equivalent gains from installing webmcpx’s script on an arbitrary site.

   Locations: `bench/tasks/*.toml`, `bench/sites/`, and each JSON’s `tasks` object.

   **Fix:** disclose the workload composition and selection process prominently. Separate native site tools, custom fixture tools and the drop-in loader. For broader claims, freeze a larger independently sourced evaluation set before running models, including more varied actions and workflows.

6. **Medium — Three repetitions give weak uncertainty estimates, and the leaderboard measures cost among saturated models.**

   [report.rs:82](crates/webmcpx-bench/src/report.rs:82) publishes means without dispersion. Three successes out of three do not establish reliable 100% success: under an independent binomial model, the exact two-sided 95% interval is approximately **29%–100%**.

   The **97×** Luna headline is arithmetically supported, but its baseline attempts range from **75,170 to 145,908 tokens**, versus **1,139–1,219** with WebMCP. That variation deserves visibility beside the ratio.

   Every model scores **105/105 with WebMCP**. Thus [the leaderboard comparator](site/src/lib/features/benchmark/bench.ts:101) orders all six entirely by recorded cost. The ranking rule is disclosed correctly, but the numbered places provide no evidence of success differences.

   **Fix:** label results as observed outcomes, show attempt values or ranges and uncertainty, and identify the current leaderboard as a cost ranking among models tied on this suite. Increase repetitions and workload diversity before making comparative reliability claims.

7. **Medium — “Time per run” excludes preparation and mixes task latency with uncontrolled service latency.**

   [lib.rs:113](crates/webmcpx-bench/src/lib.rs:113) navigates and initializes the session before [the timer starts](crates/webmcpx-bench/src/agent.rs:50). WebMCP discovery can wait up to ten seconds for registration; baseline initialization has no equivalent readiness wait. Discovery time is excluded even though it can allow additional hydration.

   Timed work includes network calls, tool latency and retry backoff. The default is four concurrent jobs, without recorded concurrency or randomized/counterbalanced arm scheduling.

   **Fix:** define the existing metric as agent-loop elapsed time. Also record navigation, readiness/discovery and total elapsed time, along with retries and concurrency. Use a common readiness criterion and counterbalanced scheduling.

8. **Medium — Cost and token comparisons need their experimental context stated.**

   The accounting handles cache reads, cache writes and reasoning output, but repeated tasks share substantial cache benefits. For Sol, cached tokens constitute **82.7% of baseline input versus 63.3% with WebMCP**. Flash’s corresponding figures are **31.5% versus 8.1%**. These are observed costs under this execution pattern, rather than a universal price per independent user request.

   Furthermore, [cost calculation](crates/webmcpx-bench/src/model.rs:370) covers the benchmark model’s reported usage. Work performed behind site tools is outside that accounting. Raw tokens and a setting called `medium` also do not constitute equal computational effort across providers.

   Google’s prices are explicitly promotional with expiry dates in `model.rs`; cost rankings can change without any behavioral change.

   **Fix:** label costs as dated estimates of the calling model’s API usage, show cache treatment and price validity dates, and state the boundary around site-side computation. Interpret token savings primarily within each model. A normalized uncached-cost view would complement the observed-cost view.

**(C) Fine as is**

- **Shared experimental core:** both arms use the same model client, user prompt, system prompt, task page and model-turn limit. Both initialization scripts are injected into both arms. I found no task-specific answer injection.
- **Fixture mechanics:** the store UI and tools share business logic; the required facts are present in the fixtures. Cart graders check exact products, quantities and absence of extra lines.
- **Published arithmetic:** all six files contain 210 unique attempts, with three attempts per question and arm. Every task and overall summary reconciles with its underlying runs; every stored cost reconciles with its stored prices. Current files contain no harness or model errors.
- **Token treatment:** reasoning is not added twice to totals; Anthropic cache reads/writes are incorporated into input usage. OpenAI and Anthropic’s stored rates match their current official tables. [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).
- **Showcase disclosure:** the threshold, selected-question count, best-first ordering and raw-results link are visible. Selection does not determine leaderboard scores. README ratios and its Sol best/worst table reconcile with the data, including losses.
- **Regrading safeguards:** answer-only grades reproduce under the current checks; task metadata matches current prompts and locations. Regrading applies across arms, preserves answers and skips changed task identities. Historical corrections are explained in Git.

BENCH REVIEW: 4 MUST-FIX FINDINGS
