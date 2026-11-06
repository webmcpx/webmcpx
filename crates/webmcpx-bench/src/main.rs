//! `webmcpx-bench`: `run` the benchmark, `serve` the sites and landing, list `tasks`.
//! Data (tables, task lists) goes to stdout; progress and notes go to stderr.
#![expect(
    clippy::print_stderr,
    reason = "progress output is for humans on stderr"
)]

use std::io::Write as _;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{Context as _, Result, bail};
use clap::{Parser, Subcommand};
use webmcpx_bench::arm::Arm;
use webmcpx_bench::cdp::Browser;
use webmcpx_bench::model::{OpenAi, Price, list_price};
use webmcpx_bench::report::{Results, SCHEMA_VERSION, Summary, markdown};
use webmcpx_bench::{Job, repo_root, run_jobs, server, task};

#[derive(Parser)]
#[command(
    name = "webmcpx-bench",
    about = "Benchmark agents with and without WebMCP tools."
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Run tasks in both arms and write a results file. Needs `OPENAI_API_KEY` and Chrome.
    Run {
        /// Only these task ids (repeatable; default: all in bench/tasks).
        #[arg(long = "task", value_name = "ID")]
        tasks: Vec<String>,
        /// Only these arms (repeatable; default: both).
        #[arg(long = "arm", value_enum)]
        arms: Vec<Arm>,
        #[arg(long, default_value = "gpt-6-luna")]
        model: String,
        /// Reasoning effort (none, low, medium, high). Medium is the project default for every run.
        #[arg(long, default_value = "medium")]
        reasoning_effort: String,
        /// Attempts per task and arm.
        #[arg(long, default_value_t = 3)]
        repeat: u32,
        /// Runs in flight at once.
        #[arg(long, default_value_t = 4)]
        jobs: usize,
        /// USD per million tokens as `INPUT,CACHED_INPUT,OUTPUT` (default: the official list price).
        #[arg(long, value_parser = parse_price)]
        price: Option<Price>,
        /// Chrome or Chromium executable (default: `CHROME_PATH`, then the usual locations).
        #[arg(long)]
        chrome: Option<PathBuf>,
    },
    /// Serve the benchmark sites and the built landing on localhost.
    Serve {
        #[arg(long, default_value = "127.0.0.1:4173")]
        addr: SocketAddr,
    },
    /// List tasks.
    Tasks,
}

fn parse_price(s: &str) -> Result<Price, String> {
    let n: Vec<f64> = s
        .split(',')
        .map(|v| v.trim().parse::<f64>().map_err(|e| e.to_string()))
        .collect::<Result<_, _>>()?;
    let [input, cached_input, output] = n[..] else {
        return Err("expected INPUT,CACHED_INPUT,OUTPUT".into());
    };
    Ok(Price {
        input,
        cached_input,
        output,
    })
}

#[tokio::main]
async fn main() -> Result<()> {
    let root = repo_root();
    match Cli::parse().command {
        Command::Tasks => {
            let mut out = std::io::stdout().lock();
            for t in task::load_dir(&root.join("bench/tasks"))? {
                writeln!(out, "{}\t{}\t{}", t.id, t.site, t.prompt)?;
            }
        }
        Command::Serve { addr } => {
            let bound = server::spawn(&root, addr).await?;
            eprintln!("serving http://{bound}/ (sites under /sites/); Ctrl-C to stop");
            tokio::signal::ctrl_c().await?;
        }
        Command::Run {
            tasks,
            arms,
            model,
            reasoning_effort,
            repeat,
            jobs,
            price,
            chrome,
        } => {
            let all = task::load_dir(&root.join("bench/tasks"))?;
            let selected: Vec<_> = all
                .into_iter()
                .filter(|t| tasks.is_empty() || tasks.contains(&t.id))
                .collect();
            if selected.is_empty() {
                bail!("no task matches {tasks:?}; see `webmcpx-bench tasks`");
            }
            let arms = if arms.is_empty() {
                Arm::ALL.to_vec()
            } else {
                arms
            };
            let price = price.or_else(|| list_price(&model));
            let client = OpenAi::from_env(model.clone(), Some(reasoning_effort.clone()))?;
            let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into()).await?;
            let browser = Browser::launch(chrome.as_deref()).await?;

            let work: Vec<Job> = selected
                .iter()
                .flat_map(|t| {
                    arms.iter().flat_map(move |&arm| {
                        (1..=repeat).map(move |attempt| Job {
                            task: t.clone(),
                            arm,
                            attempt,
                        })
                    })
                })
                .collect();
            eprintln!(
                "running {} jobs on {model} ({} tasks x {} arms x {repeat})",
                work.len(),
                selected.len(),
                arms.len()
            );
            let started_at = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
            let runs = run_jobs(
                Arc::new(browser),
                Arc::new(client),
                format!("http://{addr}").into(),
                price,
                work,
                jobs,
                progress,
            )
            .await;
            let results = Results {
                schema_version: SCHEMA_VERSION,
                model: model.clone(),
                reasoning_effort: Some(reasoning_effort),
                price_per_mtok: price,
                started_at,
                summary: Summary::of(&runs),
                runs,
            };
            let json = serde_json::to_string_pretty(&results)?;
            // Always bench/results/latest.json: `just bench` publishes exactly this file.
            let latest = root.join("bench/results/latest.json");
            if let Some(dir) = latest.parent() {
                std::fs::create_dir_all(dir)?;
            }
            std::fs::write(&latest, &json).with_context(|| latest.display().to_string())?;
            let stamped = latest.with_file_name(format!("{model}-{started_at}.json"));
            std::fs::write(&stamped, &json)?;
            writeln!(std::io::stdout().lock(), "{}", markdown(&results))?;
            eprintln!("wrote {} and {}", latest.display(), stamped.display());
        }
    }
    Ok(())
}

fn progress(run: &webmcpx_bench::report::Run) {
    let mark = if run.success { "pass" } else { "FAIL" };
    let note = run
        .harness_error
        .as_deref()
        .map(|e| format!("  harness error: {e}"))
        .unwrap_or_default();
    eprintln!(
        "{mark} {:<28} {:<8} #{}  {:>6} tok  {:>2} steps  {:>5.1}s{note}",
        run.task,
        run.arm,
        run.attempt,
        run.outcome.usage.total(),
        run.outcome.steps,
        f64::from(u32::try_from(run.outcome.duration_ms).unwrap_or(u32::MAX)) / 1000.0,
    );
}
