# Benchmark method changelog

Every change that can move a published number, newest first: what changed, why, and the measured impact per
model. Rules: root `AGENTS.md` ("Evidence"). The method itself: [`METHODOLOGY.md`](METHODOLOGY.md).

## v2 (2026-11-08): a competent baseline, Allbirds removed, auditable results

**Why:** an independent review ([`audits/2026-11-08-benchmark-reliability.md`](audits/2026-11-08-benchmark-reliability.md))
found the baseline too weak (no URL navigation, no link destinations or select options, no way past 40,000
characters), ungrounded answers graded as solved, site bot checks counted as agent failures, and results that
could not be audited.

**Changes:**
- Baseline: `navigate`, links with destinations, select options with values (choose by label), `read_page` in
  parts by `offset`, labels up to 200 characters (`f120776`, `606993e`).
- Grading: answers that say they did not come from the page, or that report a bot check, fail in both arms;
  checks require full values (24×24, 4.5:1, 200 ms); every failed run records why (`28d5bc1`).
- Tasks: the five Allbirds questions removed (owner decision): Allbirds showed a bot check to the headless
  baseline, so they measured a bot wall, not the agent. 30 questions on 6 sites.
- Results schema 5: `config` (harness revision, limits, tools), per-attempt `started_at`, `history`, and
  `observations/<model>.jsonl` with every tool result (`606993e`).
- All six models rerun at harness revision `670f20f` (effort `medium`, 3 attempts per question and arm).
- Claude Opus 5.5: `live-notion-page-size` rerun for both arms after a harness error (the page did not
  finish loading); recorded in the file's `history`.

**Impact** (solved, baseline → WebMCP; tokens per run, baseline → WebMCP):

| Model | v1 (35 questions, weak baseline) | v2 (30 questions, competent baseline) |
|---|---|---|
| GPT-6 Luna | 93% → 100%; 18.3k → 3.2k (5.7×) | 99% → 100%; 17.5k → 2.9k (6.0×) |
| GPT-6.1 Sol | 95% → 100%; 11.6k → 3.8k (3.1×) | 100% → 100%; 14.1k → 3.4k (4.1×) |
| Claude Haiku 5.5 | 86% → 100%; 22.1k → 6.4k (3.4×) | 100% → 100%; 16.4k → 5.8k (2.8×) |
| Gemini 3.8 Flash | 98% → 100%; 26.1k → 5.4k (4.8×) | 100% → 100%; 25.9k → 5.5k (4.7×) |
| Claude Opus 5.5 | 99% → 100%; 16.0k → 6.8k (2.4×) | 100% → 100%; 16.2k → 5.9k (2.7×) |
| Gemini 4 Argon | 100% → 100%; 12.8k → 4.8k (2.6×) | 100% → 100%; 18.1k → 4.6k (4.0×) |

v1 Haiku success is after the v1.1 regrade below. **Reading:** with a competent baseline, both arms solve
almost everything; WebMCP's gain is the same answer for 2.7× to 6× fewer tokens (and lower cost and fewer
steps), not a higher solve rate. v1 overstated the success gap (weak baseline, bot checks).

**Superseded:** the v1 result files are in git history (`git show 6a4978f:site/src/lib/content/bench/<model>.json`).

## v1.1 (2026-11-08): ungrounded answers fail; failures classified

Regrade only (`28d5bc1`), nothing rerun: 8 Claude Haiku baseline runs flipped to failed (answers from the model's
own knowledge or "could not confirm"); no other model changed. Every failed run gained `failure`.

## v1 (2026-11-07): first published method

35 questions on 7 sites; baseline with `read_page`, `click`, `fill`; checks by terms; results schema 4.
Regrades on 2026-11-07 fixed two checks that rejected correct answers (`e9b98a2`) and Markdown emphasis
(`a50dd11`).
