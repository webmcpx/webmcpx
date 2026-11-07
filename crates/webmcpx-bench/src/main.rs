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
use webmcpx_bench::arm::{Arm, INIT_SCRIPTS, Session, registered_tools, webmcp_tools};
use webmcpx_bench::cdp::Browser;
use webmcpx_bench::model::{Client, Price, list_price};
use webmcpx_bench::report::{Results, SCHEMA_VERSION, Summary, markdown};
use webmcpx_bench::scan::{Remote, Scanner};
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
    /// Run tasks in both arms and write a results file. Needs Chrome and the model's API key:
    /// `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (`claude-*`) or `GEMINI_API_KEY` (`gemini-*`).
    Run {
        /// Only these task ids (repeatable; default: all in bench/tasks).
        #[arg(long = "task", value_name = "ID")]
        tasks: Vec<String>,
        /// Only these arms (repeatable; default: both).
        #[arg(long = "arm", value_enum)]
        arms: Vec<Arm>,
        #[arg(long, default_value = "gpt-6-luna")]
        model: String,
        /// Reasoning effort (low, medium, high): OpenAI `reasoning.effort`, Anthropic `effort`, Gemini
        /// `thinking_level`. Medium is the project default for every run.
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
    /// Serve the benchmark sites, the built landing and the scan API (`/api/scan?url=`) on localhost.
    Serve {
        #[arg(long, default_value = "127.0.0.1:4173")]
        addr: SocketAddr,
        /// Let scans open localhost and private networks (for testing against local sites only).
        #[arg(long)]
        scan_private: bool,
        #[arg(long)]
        chrome: Option<PathBuf>,
        /// What to serve from: `site/build`, `bench/sites` and `packages/webmcpx` under it (default: this
        /// repository).
        #[arg(long)]
        root: Option<PathBuf>,
        /// Use a Chrome running elsewhere (another container) at this DevTools `host:port`, instead of
        /// starting one. It must use `--proxy-listen` as its proxy and have no other network route.
        #[arg(long, requires = "proxy_listen")]
        remote_chrome: Option<String>,
        /// Where the egress proxy listens for the remote Chrome (e.g. `0.0.0.0:3128`).
        #[arg(long, requires = "remote_chrome")]
        proxy_listen: Option<SocketAddr>,
        /// Scans running at once; more wait in line.
        #[arg(long, default_value_t = 2)]
        scan_parallel: usize,
    },
    /// List tasks (tab-separated).
    Tasks,
    /// Re-grade results files with today's answer checks (answers are not re-run).
    Regrade {
        /// Results files (default: bench/results/latest.json).
        files: Vec<PathBuf>,
    },
    /// Call one WebMCP tool on a live page and print what the agent would get (for writing tasks).
    Call {
        url: String,
        tool: String,
        /// Tool input as JSON.
        #[arg(default_value = "{}")]
        input: String,
        #[arg(long)]
        chrome: Option<PathBuf>,
    },
    /// Snapshot the tools (name, description) every task's page registers today, as JSON for the
    /// landing. Runs record what the agent saw; this fills in for runs older than schema 4.
    Tools {
        #[arg(long)]
        chrome: Option<PathBuf>,
    },
    /// Open live pages and print, as JSON lines, the WebMCP tools each one registers.
    Probe {
        urls: Vec<String>,
        #[arg(long)]
        chrome: Option<PathBuf>,
    },
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
        Command::Regrade { files } => {
            let files = if files.is_empty() {
                vec![root.join("bench/results/latest.json")]
            } else {
                files
            };
            let tasks = task::load_dir(&root.join("bench/tasks"))?;
            for path in files {
                let mut results: Results = serde_json::from_str(
                    &std::fs::read_to_string(&path)
                        .with_context(|| format!("reading {}", path.display()))?,
                )?;
                let r = webmcpx_bench::regrade(&mut results, &tasks);
                std::fs::write(&path, serde_json::to_string_pretty(&results)?)?;
                eprintln!("re-graded {}: {} run(s) changed", path.display(), r.changed);
                for id in &r.skipped {
                    eprintln!("skipped {id}: the task changed since the run (prompt, site or URL)");
                }
                writeln!(std::io::stdout().lock(), "{}", markdown(&results))?;
            }
        }
        Command::Tasks => {
            let mut out = std::io::stdout().lock();
            for t in task::load_dir(&root.join("bench/tasks"))? {
                writeln!(out, "{}\t{}\t{}", t.id, t.place(), t.prompt)?;
            }
        }
        Command::Tools { chrome } => {
            let tasks = task::load_dir(&root.join("bench/tasks"))?;
            let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into(), None).await?;
            let base = format!("http://{addr}");
            let browser = Browser::launch(chrome.as_deref()).await?;
            let mut by_task = std::collections::BTreeMap::new();
            for t in &tasks {
                let page = browser.page(&INIT_SCRIPTS).await?;
                page.goto(&t.page_url(&base)).await?;
                let tools = registered_tools(&page, std::time::Duration::from_secs(10)).await?;
                page.close().await?;
                let mut tools: Vec<_> = tools
                    .iter()
                    .map(|t| serde_json::json!({ "name": t["name"], "description": t["description"] }))
                    .collect();
                tools.sort_by(|a, b| a["name"].as_str().cmp(&b["name"].as_str()));
                eprintln!("{}: {} tools", t.id, tools.len());
                by_task.insert(t.id.clone(), tools);
            }
            let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();
            let out = serde_json::json!({ "captured_on": utc_date(now), "tasks": by_task });
            writeln!(
                std::io::stdout().lock(),
                "{}",
                serde_json::to_string_pretty(&out)?
            )?;
        }
        Command::Probe { urls, chrome } => {
            let browser = Browser::launch(chrome.as_deref()).await?;
            let mut out = std::io::stdout().lock();
            for url in urls {
                let line = match probe(&browser, &url).await {
                    Ok(tools) => serde_json::json!({ "url": url, "tools": tools }),
                    Err(e) => serde_json::json!({ "url": url, "error": format!("{e:#}") }),
                };
                writeln!(out, "{line}")?;
            }
        }
        Command::Call {
            url,
            tool,
            input,
            chrome,
        } => {
            let browser = Browser::launch(chrome.as_deref()).await?;
            let page = browser.page(&INIT_SCRIPTS).await?;
            page.goto(&url).await?;
            let session = Session::new(Arm::Webmcp, &page).await?;
            let result = session.call(&tool, &input).await;
            page.close().await?;
            writeln!(std::io::stdout().lock(), "{result}")?;
        }
        Command::Serve {
            addr,
            scan_private,
            chrome,
            root: served,
            remote_chrome,
            proxy_listen,
            scan_parallel,
        } => {
            let mut scanner = Scanner::new(chrome, scan_private).parallel(scan_parallel);
            if let (Some(chrome), Some(proxy)) = (remote_chrome, proxy_listen) {
                scanner = scanner.remote(Remote { chrome, proxy });
            }
            let served = served.unwrap_or(root);
            let bound = server::spawn(&served, addr, Some(Arc::new(scanner))).await?;
            eprintln!("serving http://{bound}/ (sites under /sites/); Ctrl-C to stop");
            shutdown().await?;
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
            let client = Client::from_env(model.clone(), Some(reasoning_effort.clone()))?;
            let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into(), None).await?;
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
                tasks: task::index(&selected)
                    .into_iter()
                    .map(|(id, info)| (id.to_owned(), info))
                    .collect(),
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

/// Waits for Ctrl-C, or SIGTERM (how a container is stopped).
async fn shutdown() -> Result<()> {
    #[cfg(unix)]
    {
        let mut term = tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())?;
        tokio::select! {
            r = tokio::signal::ctrl_c() => r?,
            _ = term.recv() => {}
        }
    }
    #[cfg(not(unix))]
    tokio::signal::ctrl_c().await?;
    Ok(())
}

/// The tools `url` registers: name, description and parameter names.
async fn probe(browser: &Browser, url: &str) -> Result<Vec<serde_json::Value>> {
    let page = browser.page(&INIT_SCRIPTS).await?;
    let result = async {
        page.goto(url).await?;
        let tools = webmcp_tools(&page).await?;
        Ok(tools
            .into_iter()
            .map(|t| {
                let params: Vec<&String> = t.parameters["properties"]
                    .as_object()
                    .map(|p| p.keys().collect())
                    .unwrap_or_default();
                serde_json::json!({ "name": t.name, "description": t.description, "params": params })
            })
            .collect())
    }
    .await;
    page.close().await?;
    result
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

/// `YYYY-MM-DD` (UTC) for Unix seconds (Howard Hinnant's days-to-civil algorithm).
fn utc_date(secs: u64) -> String {
    let z = i64::try_from(secs / 86_400).unwrap_or_default() + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + i64::from(month <= 2);
    format!("{year:04}-{month:02}-{day:02}")
}

#[cfg(test)]
mod tests {
    use super::utc_date;

    #[test]
    fn utc_dates() {
        assert_eq!(utc_date(0), "1970-01-01");
        assert_eq!(utc_date(1_794_036_578), "2026-11-07");
        assert_eq!(utc_date(951_782_400), "2000-02-29");
    }
}
