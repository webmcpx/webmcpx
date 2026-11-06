//! End to end: real Chrome, real sites, real webmcpx loader and wasm; only the model is scripted.
//! Skips (passes with a note) when Chrome is not installed. Needs `just wasm` first.
#![expect(
    clippy::unwrap_used,
    clippy::print_stderr,
    reason = "test helpers fail loudly"
)]

use std::sync::{Arc, Mutex};

use anyhow::Result;
use webmcpx_bench::arm::Arm;
use webmcpx_bench::cdp::{Browser, find_chrome};
use webmcpx_bench::model::{Message, Model, Reply, ToolCall, ToolSpec, Usage};
use webmcpx_bench::report::Run;
use webmcpx_bench::{Job, repo_root, run_jobs, server, task};

/// A model that answers from a script: `f(step, messages, tools)`. Records what it was shown.
struct Scripted<F> {
    f: F,
    seen: Mutex<Vec<(Vec<Message>, Vec<String>)>>,
}

impl<F: Fn(usize, &[Message]) -> Reply + Sync> Model for Scripted<F> {
    fn complete(
        &self,
        messages: &[Message],
        tools: &[ToolSpec],
    ) -> impl Future<Output = Result<Reply>> + Send {
        let mut seen = self.seen.lock().unwrap();
        let step = seen.len();
        seen.push((
            messages.to_vec(),
            tools.iter().map(|t| t.name.clone()).collect(),
        ));
        std::future::ready(Ok((self.f)(step, messages)))
    }
}

fn call(name: &str, args: &str) -> Reply {
    Reply {
        content: None,
        tool_calls: vec![ToolCall::new("c", name, args)],
        usage: Usage {
            input: 100,
            output: 10,
            ..Usage::default()
        },
        raw: Vec::new(),
    }
}

fn answer(text: &str) -> Reply {
    Reply {
        content: Some(text.into()),
        tool_calls: Vec::new(),
        usage: Usage::default(),
        raw: Vec::new(),
    }
}

fn last_tool_result(messages: &[Message]) -> &str {
    messages
        .iter()
        .rev()
        .find_map(|m| match m {
            Message::Tool { content, .. } => Some(content.as_str()),
            _ => None,
        })
        .unwrap_or_default()
}

async fn run_one<F: Fn(usize, &[Message]) -> Reply + Send + Sync + 'static>(
    task_id: &str,
    arm: Arm,
    f: F,
) -> Option<(Run, Arc<Scripted<F>>)> {
    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found (set CHROME_PATH)");
        return None;
    }
    let root = repo_root();
    if !root
        .join("packages/webmcpx/wasm/webmcpx_wasm_bg.wasm")
        .is_file()
    {
        eprintln!("skipping: run `just wasm` first");
        return None;
    }
    let task = task::load_dir(&root.join("bench/tasks"))
        .unwrap()
        .into_iter()
        .find(|t| t.id == task_id)
        .unwrap();
    let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into())
        .await
        .unwrap();
    let browser = Arc::new(Browser::launch(None).await.unwrap());
    let model = Arc::new(Scripted {
        f,
        seen: Mutex::default(),
    });
    let runs = run_jobs(
        browser,
        Arc::clone(&model),
        format!("http://{addr}").into(),
        Some((0.10, 0.50)),
        vec![Job {
            task,
            arm,
            attempt: 1,
        }],
        1,
        |_| {},
    )
    .await;
    Some((runs.into_iter().next().unwrap(), model))
}

#[tokio::test]
async fn webmcp_arm_uses_the_page_tools() {
    let Some((run, model)) = run_one("docs-deploy-timeout", Arm::Webmcp, |step, _| match step {
        0 => call("search_page", r#"{"query":"deploy timeout"}"#),
        _ => answer("90 seconds; change it with --timeout."),
    })
    .await
    else {
        return;
    };
    assert_eq!(run.harness_error, None);
    assert!(run.success, "{run:?}");
    let seen = model.seen.lock().unwrap();
    assert_eq!(
        seen[0].1,
        ["fetch_as_markdown", "get_page_context", "search_page"]
    );
    let result = last_tool_result(&seen[1].0);
    assert!(result.starts_with(r#"{"ok":true"#), "{result}");
    assert!(result.contains("90 seconds"), "{result}");
    assert_eq!(run.cost_usd, Some(0.000_015));
}

#[tokio::test]
async fn baseline_arm_drives_the_dom() {
    // Read the page, find the refs next to "Harbor Mug", set quantity 2, click add.
    let refs = |messages: &[Message]| {
        let page = last_tool_result(messages);
        let line = page
            .lines()
            .find(|l| l.contains("\"Add Harbor Mug to cart\""))
            .unwrap_or_else(|| panic!("no add button in snapshot:\n{page}"));
        let add: u32 = line[1..line.find(']').unwrap()].parse().unwrap();
        add
    };
    let add = Mutex::new(0);
    let Some((run, model)) = run_one(
        "store-cheapest-blue-mug",
        Arm::Baseline,
        move |step, messages| match step {
            0 => call("read_page", "{}"),
            1 => {
                *add.lock().unwrap() = refs(messages);
                call(
                    "fill",
                    &format!(r#"{{"ref":{},"value":"2"}}"#, *add.lock().unwrap() - 1),
                )
            }
            2 => call("click", &format!(r#"{{"ref":{}}}"#, *add.lock().unwrap())),
            _ => answer("Added two Harbor Mugs."),
        },
    )
    .await
    else {
        return;
    };
    assert_eq!(run.harness_error, None);
    assert!(run.success, "{run:?}");
    let seen = model.seen.lock().unwrap();
    assert_eq!(seen[0].1, ["read_page", "click", "fill"]);
    assert_eq!(
        last_tool_result(&seen[3].0),
        "Clicked [".to_owned() + &refs(&seen[1].0).to_string() + "]."
    );
}

#[tokio::test]
async fn store_registers_its_own_tools_next_to_the_standard_ones() {
    let Some((run, model)) = run_one("store-restock-date", Arm::Webmcp, |step, _| match step {
        0 => call("search_products", r#"{"query":"ash glaze"}"#),
        _ => answer("3 January"),
    })
    .await
    else {
        return;
    };
    assert!(run.success, "{run:?}");
    let seen = model.seen.lock().unwrap();
    assert_eq!(
        seen[0].1,
        [
            "add_to_cart",
            "get_cart",
            "get_page_context",
            "search_products"
        ]
    );
    assert!(last_tool_result(&seen[1].0).contains("Back in stock on 3 January"));
}

#[tokio::test]
async fn store_tools_answer_malformed_input_with_an_envelope() {
    let Some((_, model)) = run_one("store-restock-date", Arm::Webmcp, |step, _| match step {
        0 => call("add_to_cart", "null"),
        1 => call("search_products", r#"{"query":null}"#),
        2 => call("add_to_cart", r#"{"sku":"NOPE"}"#),
        _ => answer("done"),
    })
    .await
    else {
        return;
    };
    let seen = model.seen.lock().unwrap();
    for (step, code) in [(1, "INVALID_INPUT"), (2, "INVALID_INPUT"), (3, "NOT_FOUND")] {
        let result = last_tool_result(&seen[step].0);
        assert!(
            result.starts_with(r#"{"ok":false"#) && result.contains(code),
            "step {step}: {result}"
        );
    }
}
