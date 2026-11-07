//! The results file (`schema_version` 1) and its summary. The landing page reads this file as is,
//! so the summary is computed here, once.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use serde::{Deserialize, Serialize};

use crate::agent::Outcome;
use crate::arm::Arm;
use crate::model::{Price, Usage};

/// 2: `price_per_mtok` became `{input, cached_input, output}`; usage gained `cache_write`.
/// 3: `tasks` (where each task ran and what it asked) travels with the run.
/// 4: each `webmcp` run records the `tools` (name, description) the agent was given.
pub const SCHEMA_VERSION: u32 = 4;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Results {
    pub schema_version: u32,
    pub model: String,
    pub reasoning_effort: Option<String>,
    /// Prices used for `cost_usd`, if known.
    pub price_per_mtok: Option<Price>,
    /// Unix seconds.
    pub started_at: u64,
    /// The tasks as they were when this run started: `{id: {site | url, prompt}}`. Readers must use
    /// this, not the current task files, which may have changed since.
    #[serde(default)]
    pub tasks: std::collections::BTreeMap<String, serde_json::Value>,
    pub runs: Vec<Run>,
    pub summary: Summary,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Run {
    pub task: String,
    pub arm: Arm,
    pub attempt: u32,
    pub success: bool,
    /// Set when the harness itself failed (not the agent); such runs count as failures.
    pub harness_error: Option<String>,
    pub cost_usd: Option<f64>,
    /// The tools the agent was given, as the page registered them (`webmcp` arm only).
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub tools: Vec<ToolInfo>,
    #[serde(flatten)]
    pub outcome: Outcome,
}

/// What an agent sees of a tool before calling it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Summary {
    pub arms: BTreeMap<Arm, ArmSummary>,
    pub tasks: BTreeMap<String, BTreeMap<Arm, ArmSummary>>,
}

/// Means over runs, plus the success rate.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct ArmSummary {
    pub runs: u32,
    pub success_rate: f64,
    pub tokens: f64,
    pub input_tokens: f64,
    pub output_tokens: f64,
    pub steps: f64,
    pub tool_calls: f64,
    pub duration_ms: f64,
    pub cost_usd: Option<f64>,
}

pub fn cost(usage: Usage, price: Option<Price>) -> Option<f64> {
    price.map(|p| p.cost(usage))
}

fn summarize<'a>(runs: impl Iterator<Item = &'a Run>) -> ArmSummary {
    let runs: Vec<&Run> = runs.collect();
    #[expect(clippy::cast_precision_loss, reason = "small counts")]
    let mean = |f: &dyn Fn(&Run) -> f64| runs.iter().map(|r| f(r)).sum::<f64>() / runs.len() as f64;
    #[expect(clippy::cast_precision_loss, reason = "small counts")]
    ArmSummary {
        runs: u32::try_from(runs.len()).unwrap_or(u32::MAX),
        success_rate: mean(&|r| f64::from(u8::from(r.success))),
        tokens: mean(&|r| r.outcome.usage.total() as f64),
        input_tokens: mean(&|r| r.outcome.usage.input as f64),
        output_tokens: mean(&|r| r.outcome.usage.output as f64),
        steps: mean(&|r| f64::from(r.outcome.steps)),
        tool_calls: mean(&|r| r.outcome.tool_calls.len() as f64),
        duration_ms: mean(&|r| r.outcome.duration_ms as f64),
        cost_usd: runs
            .iter()
            .all(|r| r.cost_usd.is_some())
            .then(|| mean(&|r| r.cost_usd.unwrap_or_default())),
    }
}

impl Summary {
    pub fn of(runs: &[Run]) -> Self {
        let mut s = Self::default();
        let mut keys: Vec<(&str, Arm)> = runs.iter().map(|r| (r.task.as_str(), r.arm)).collect();
        keys.sort_unstable();
        keys.dedup();
        for (task, arm) in keys {
            let of = |r: &&Run| r.task == task && r.arm == arm;
            s.tasks
                .entry(task.into())
                .or_default()
                .insert(arm, summarize(runs.iter().filter(of)));
        }
        for arm in Arm::ALL {
            if runs.iter().any(|r| r.arm == arm) {
                s.arms
                    .insert(arm, summarize(runs.iter().filter(|r| r.arm == arm)));
            }
        }
        s
    }
}

/// A Markdown table for the terminal and PR descriptions.
pub fn markdown(results: &Results) -> String {
    let mut out = format!("Model: `{}`", results.model);
    if let Some(e) = &results.reasoning_effort {
        let _ = write!(out, " (reasoning: {e})");
    }
    out.push_str(
        "\n\n| Task | Arm | Success | Tokens | Steps | Time | Cost |\n|---|---|---|---|---|---|---|\n",
    );
    let rows = results
        .summary
        .tasks
        .iter()
        .flat_map(|(task, arms)| arms.iter().map(move |(arm, s)| (task.as_str(), *arm, s)))
        .chain(
            results
                .summary
                .arms
                .iter()
                .map(|(arm, s)| ("**all**", *arm, s)),
        );
    for (task, arm, s) in rows {
        let _ = writeln!(
            out,
            "| {task} | {arm} | {:.0}% | {:.0} | {:.1} | {:.1}s | {} |",
            s.success_rate * 100.0,
            s.tokens,
            s.steps,
            s.duration_ms / 1000.0,
            s.cost_usd
                .map_or_else(|| "n/a".into(), |c| format!("${c:.5}")),
        );
    }
    if let (Some(b), Some(w)) = (
        results.summary.arms.get(&Arm::Baseline),
        results.summary.arms.get(&Arm::Webmcp),
    ) && w.tokens > 0.0
    {
        let _ = writeln!(
            out,
            "\nWebMCP vs baseline: {}, {}.",
            compare(b.tokens, w.tokens, "fewer tokens", "more tokens"),
            compare(b.duration_ms, w.duration_ms, "faster", "slower"),
        );
    }
    out
}

/// "2.5x fewer tokens" when `webmcp` is lower, "1.4x more tokens" when it is higher.
fn compare(baseline: f64, webmcp: f64, better: &str, worse: &str) -> String {
    if webmcp <= baseline {
        format!("{:.1}x {better}", baseline / webmcp.max(f64::MIN_POSITIVE))
    } else {
        format!("{:.1}x {worse}", webmcp / baseline.max(f64::MIN_POSITIVE))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::Stop;

    fn run(task: &str, arm: Arm, success: bool, input: u64, ms: u64) -> Run {
        Run {
            task: task.into(),
            arm,
            attempt: 1,
            success,
            harness_error: None,
            tools: Vec::new(),
            cost_usd: cost(
                Usage {
                    input,
                    output: 100,
                    ..Usage::default()
                },
                crate::model::list_price("gpt-6-luna"),
            ),
            outcome: Outcome {
                answer: Some("x".into()),
                stop: Stop::Answered,
                steps: 2,
                tool_calls: Vec::new(),
                usage: Usage {
                    input,
                    output: 100,
                    ..Usage::default()
                },
                duration_ms: ms,
            },
        }
    }

    #[test]
    fn comparisons_name_the_direction() {
        assert_eq!(
            compare(15.0, 1.5, "fewer tokens", "more tokens"),
            "10.0x fewer tokens"
        );
        assert_eq!(compare(3.6, 4.9, "faster", "slower"), "1.4x slower");
    }

    #[test]
    fn summarizes_per_task_and_arm() {
        let runs = [
            run("docs", Arm::Baseline, true, 9_900, 4_000),
            run("docs", Arm::Baseline, false, 19_900, 6_000),
            run("docs", Arm::Webmcp, true, 900, 1_000),
            run("store", Arm::Webmcp, true, 1_900, 3_000),
        ];
        let results = Results {
            schema_version: SCHEMA_VERSION,
            model: "gpt-6-luna".into(),
            reasoning_effort: None,
            price_per_mtok: crate::model::list_price("gpt-6-luna"),
            started_at: 0,
            tasks: std::collections::BTreeMap::new(),
            summary: Summary::of(&runs),
            runs: runs.into(),
        };
        insta::assert_snapshot!(markdown(&results), @"
        Model: `gpt-6-luna`

        | Task | Arm | Success | Tokens | Steps | Time | Cost |
        |---|---|---|---|---|---|---|
        | docs | baseline | 50% | 15000 | 2.0 | 5.0s | $0.00154 |
        | docs | webmcp | 100% | 1000 | 2.0 | 1.0s | $0.00014 |
        | store | webmcp | 100% | 2000 | 2.0 | 3.0s | $0.00024 |
        | **all** | baseline | 50% | 15000 | 2.0 | 5.0s | $0.00154 |
        | **all** | webmcp | 100% | 1500 | 2.0 | 2.0s | $0.00019 |

        WebMCP vs baseline: 10.0x fewer tokens, 2.5x faster.
        ");
    }
}
