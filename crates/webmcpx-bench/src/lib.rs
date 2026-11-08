//! `webmcpx-bench`: run the same agent on the same pages, with and without WebMCP tools, and compare
//! success, tokens, time and cost. See `bench/AGENTS.md`.

pub mod agent;
pub mod anthropic;
pub mod arm;
pub mod card;
pub mod cdp;
pub mod gemini;
pub mod model;
pub mod proxy;
pub mod report;
pub mod scan;
pub mod server;
pub mod task;
pub mod visitors;

use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::Result;
use tokio::sync::Semaphore;
use tokio::task::JoinSet;

use crate::arm::{Arm, INIT_SCRIPTS, Session};
use crate::cdp::Browser;
use crate::model::{Model, Price};
use crate::report::Run;
use crate::task::Task;

/// The repository root (this crate lives in `crates/webmcpx-bench`).
pub fn repo_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../..")
}

/// One unit of work: a task, an arm and an attempt number.
#[derive(Debug, Clone)]
pub struct Job {
    pub task: Task,
    pub arm: Arm,
    pub attempt: u32,
}

/// Runs `jobs` with at most `parallel` at a time. Each job gets a fresh, isolated page.
/// `on_done` sees each run as it finishes (for progress output). Runs come back in job order.
pub async fn run_jobs<M: Model + Send + 'static>(
    browser: Arc<Browser>,
    model: Arc<M>,
    base_url: Arc<str>,
    price: Option<Price>,
    jobs: Vec<Job>,
    parallel: usize,
    on_done: impl Fn(&Run),
) -> Vec<Run> {
    let gate = Arc::new(Semaphore::new(parallel.max(1)));
    let mut set = JoinSet::new();
    for (i, job) in jobs.into_iter().enumerate() {
        let (browser, model, base_url, gate) = (
            Arc::clone(&browser),
            Arc::clone(&model),
            Arc::clone(&base_url),
            Arc::clone(&gate),
        );
        set.spawn(async move {
            let _permit = gate.acquire_owned().await;
            (i, run_job(&browser, &*model, &base_url, price, job).await)
        });
    }
    let mut runs = Vec::new();
    while let Some(done) = set.join_next().await {
        let (i, run) = done.expect("benchmark jobs do not panic");
        on_done(&run);
        runs.push((i, run));
    }
    runs.sort_by_key(|(i, _)| *i);
    runs.into_iter().map(|(_, r)| r).collect()
}

async fn run_job(
    browser: &Browser,
    model: &impl Model,
    base_url: &str,
    price: Option<Price>,
    job: Job,
) -> Run {
    let mut run = Run {
        task: job.task.id.clone(),
        arm: job.arm,
        attempt: job.attempt,
        started_at: Some(now_ms()),
        success: false,
        harness_error: None,
        failure: None,
        cost_usd: None,
        tools: Vec::new(),
        outcome: agent::Outcome::default(),
    };
    if let Err(e) = attempt(browser, model, base_url, &job, &mut run).await {
        run.harness_error = Some(format!("{e:#}"));
        run.success = false;
    }
    report::classify(&mut run);
    run.cost_usd = report::cost(run.outcome.usage, price);
    run
}

async fn attempt(
    browser: &Browser,
    model: &impl Model,
    base_url: &str,
    job: &Job,
    run: &mut Run,
) -> Result<()> {
    let page = browser.page(&INIT_SCRIPTS).await?;
    let result = async {
        page.goto(&job.task.page_url(base_url)).await?;
        let session = Session::new(job.arm, &page).await?;
        if job.arm == Arm::Webmcp {
            run.tools = session
                .tools
                .iter()
                .map(|t| report::ToolInfo {
                    name: t.name.clone(),
                    description: t.description.clone(),
                })
                .collect();
        }
        run.outcome = agent::run(model, &session, &job.task.prompt, job.task.max_steps).await;
        let check = &job.task.check;
        let answer_ok = !check.has_answer_check()
            || run
                .outcome
                .answer
                .as_deref()
                .is_some_and(|a| check.answer_passes(a));
        let state_ok = match &check.state {
            None => true,
            Some(expr) => page.eval(&format!("Boolean({expr})")).await? == true,
        };
        run.success = run.outcome.stop == agent::Stop::Answered && answer_ok && state_ok;
        Ok(())
    }
    .await;
    page.close().await?;
    result
}

/// What [`regrade`] did.
#[derive(Debug, Default, PartialEq, Eq)]
pub struct Regraded {
    /// Runs whose grade changed.
    pub changed: usize,
    /// Tasks left as graded because today's task asks something else (prompt, site or URL changed
    /// since the run): their answers answer the old question.
    pub skipped: Vec<String>,
}

/// Re-applies today's answer checks to the answers a run recorded, for tasks graded on the answer alone
/// (a `state` check needs the live page, so those runs keep their grade) and only where today's task
/// still asks what the run asked (`results.tasks`). Answers never change; only the grading does,
/// identically for both arms.
pub fn regrade(results: &mut report::Results, tasks: &[Task]) -> Regraded {
    let mut out = Regraded::default();
    for task in tasks {
        if results
            .tasks
            .get(&task.id)
            .is_some_and(|recorded| *recorded != task.info())
        {
            out.skipped.push(task.id.clone());
        }
    }
    let mut flips = Vec::new();
    for run in &mut results.runs {
        let Some(task) = tasks.iter().find(|t| t.id == run.task) else {
            continue;
        };
        if out.skipped.contains(&task.id)
            || !results.tasks.contains_key(&task.id)
            || task.check.state.is_some()
            || run.harness_error.is_some()
        {
            continue;
        }
        let answer_ok = !task.check.has_answer_check()
            || run
                .outcome
                .answer
                .as_deref()
                .is_some_and(|a| task.check.answer_passes(a));
        let success = run.outcome.stop == agent::Stop::Answered && answer_ok;
        if success != run.success {
            run.success = success;
            out.changed += 1;
            flips.push(serde_json::json!({
                "task": run.task, "arm": run.arm, "attempt": run.attempt, "success": success
            }));
        }
    }
    // Every run's failure category, also for runs whose grade regrading leaves alone.
    results.runs.iter_mut().for_each(report::classify);
    // Kept in the file, so a reader sees which grades changed after the run, and when.
    if !flips.is_empty() {
        results
            .history
            .push(serde_json::json!({ "regraded_at": now_ms() / 1000, "changed": flips }));
    }
    results.summary = report::Summary::of(&results.runs);
    out
}

/// Unix milliseconds now (0 if the clock is before 1970).
fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::report::{Results, Run};

    fn task(id: &str, check: &str) -> Task {
        let mut t: Task = toml::from_str(&format!(
            "site = \"docs\"\nprompt = \"q\"\n[check]\n{check}\n"
        ))
        .unwrap();
        t.id = id.into();
        t
    }

    fn run(task: &str, success: bool, answer: &str) -> Run {
        Run {
            task: task.into(),
            arm: Arm::Webmcp,
            attempt: 1,
            started_at: None,
            success,
            harness_error: None,
            failure: None,
            cost_usd: None,
            tools: Vec::new(),
            outcome: agent::Outcome {
                answer: Some(answer.into()),
                stop: agent::Stop::Answered,
                ..agent::Outcome::default()
            },
        }
    }

    #[test]
    fn regrade_applies_fixed_answer_checks_and_leaves_state_checks_alone() {
        let tasks = [
            task("unit", r#"answer_any = ["MB", "MiB"]"#),
            task("cart", r#"state = "true""#),
        ];
        let mut results = Results {
            schema_version: report::SCHEMA_VERSION,
            model: "m".into(),
            reasoning_effort: None,
            price_per_mtok: None,
            started_at: 0,
            tasks: tasks.iter().map(|t| (t.id.clone(), t.info())).collect(),
            config: None,
            history: Vec::new(),
            runs: vec![
                run("unit", false, "20 MiB"),
                run("unit", false, "20 GB"),
                run("cart", false, "done"),
            ],
            summary: report::Summary::default(),
        };
        assert_eq!(
            regrade(&mut results, &tasks),
            Regraded {
                changed: 1,
                skipped: Vec::new()
            }
        );
        let grades: Vec<bool> = results.runs.iter().map(|r| r.success).collect();
        assert_eq!(grades, [true, false, false]);
        assert_eq!(
            results.summary.tasks["unit"][&Arm::Webmcp].success_rate,
            0.5
        );
    }

    #[test]
    fn regrade_skips_tasks_that_changed_since_the_run() {
        let mut edited = task("unit", r#"answer_any = ["MiB"]"#);
        let original = task("unit", r#"answer_any = ["MiB"]"#);
        edited.prompt = "a different question".into();
        let mut results = Results {
            schema_version: report::SCHEMA_VERSION,
            model: "m".into(),
            reasoning_effort: None,
            price_per_mtok: None,
            started_at: 0,
            tasks: [(original.id.clone(), original.info())].into(),
            config: None,
            history: Vec::new(),
            runs: vec![run("unit", false, "20 MiB")],
            summary: report::Summary::default(),
        };
        let r = regrade(&mut results, &[edited]);
        assert_eq!(r.skipped, ["unit"]);
        assert_eq!(r.changed, 0);
        assert!(!results.runs[0].success);
    }
}
