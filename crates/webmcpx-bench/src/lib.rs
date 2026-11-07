//! `webmcpx-bench`: run the same agent on the same pages, with and without WebMCP tools, and compare
//! success, tokens, time and cost. See `bench/AGENTS.md`.

pub mod agent;
pub mod arm;
pub mod cdp;
pub mod model;
pub mod proxy;
pub mod report;
pub mod scan;
pub mod server;
pub mod task;

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
        success: false,
        harness_error: None,
        cost_usd: None,
        outcome: agent::Outcome::default(),
    };
    if let Err(e) = attempt(browser, model, base_url, &job, &mut run).await {
        run.harness_error = Some(format!("{e:#}"));
        run.success = false;
    }
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
