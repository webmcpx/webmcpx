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
    let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into(), None)
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
        webmcpx_bench::model::list_price("gpt-6-luna"),
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
    // The run records the tools the agent was given, with the descriptions it read.
    let search = run.tools.iter().find(|t| t.name == "search_page").unwrap();
    assert!(
        search.description.starts_with("Find passages"),
        "{search:?}"
    );
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

#[tokio::test]
async fn scan_api_reports_the_tools_of_a_page() {
    let root = repo_root();
    if find_chrome().is_none()
        || !root
            .join("packages/webmcpx/wasm/webmcpx_wasm_bg.wasm")
            .is_file()
    {
        eprintln!("skipping: needs Chrome and `just wasm`");
        return;
    }
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, true));
    let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into(), Some(scanner))
        .await
        .unwrap();
    let get = |url: String| async move {
        let r = reqwest::get(url).await.unwrap();
        (
            r.status().as_u16(),
            r.json::<serde_json::Value>().await.unwrap(),
        )
    };

    let (status, store) = get(format!(
        "http://{addr}/api/scan?url=http://{addr}/sites/store/"
    ))
    .await;
    assert_eq!(status, 200, "{store}");
    assert_eq!(store["verdict"], "ready", "{store}");
    let names: Vec<&str> = store["tools"]
        .as_array()
        .unwrap()
        .iter()
        .map(|t| t["name"].as_str().unwrap())
        .collect();
    assert!(
        names.contains(&"search_products") && names.contains(&"get_page_context"),
        "{names:?}"
    );
    assert!(store["page_tokens"].as_u64().unwrap() > 0);

    let (status, bad) = get(format!("http://{addr}/api/scan?url=file:///etc/passwd")).await;
    assert_eq!(status, 400, "{bad}");
}

/// A free loopback port (bound and released at once).
fn free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap()
        .port()
}

/// Production runs Chrome in its own container: the scanner connects to it and serves it the egress
/// proxy. Here that Chrome is a local process started the same way.
#[tokio::test]
async fn scans_with_a_remote_chrome_through_the_shared_proxy() {
    let root = repo_root();
    if find_chrome().is_none() || !root.join("packages/webmcpx/wasm").exists() {
        eprintln!("skipping: needs Chrome and `just wasm`");
        return;
    }
    let (devtools, proxy) = (free_port(), free_port());
    let _chrome = Browser::launch_with(
        None,
        &[
            format!("--remote-debugging-port={devtools}"),
            format!("--proxy-server=http://127.0.0.1:{proxy}"),
            "--proxy-bypass-list=<-loopback>".to_owned(),
        ],
    )
    .await
    .unwrap();
    let scanner =
        webmcpx_bench::scan::Scanner::new(None, true).remote(webmcpx_bench::scan::Remote {
            chrome: format!("127.0.0.1:{devtools}"),
            proxy: ([127, 0, 0, 1], proxy).into(),
        });
    let addr = server::spawn(&root, ([127, 0, 0, 1], 0).into(), Some(Arc::new(scanner)))
        .await
        .unwrap();
    let r = reqwest::get(format!(
        "http://{addr}/api/scan?url=http://{addr}/sites/store/"
    ))
    .await
    .unwrap();
    assert_eq!(r.status().as_u16(), 200);
    let report: serde_json::Value = r.json().await.unwrap();
    assert_eq!(report["verdict"], "ready", "{report}");
}

#[tokio::test]
async fn scan_api_refuses_private_hosts_by_default() {
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, false));
    let addr = server::spawn(&repo_root(), ([127, 0, 0, 1], 0).into(), Some(scanner))
        .await
        .unwrap();
    let r = reqwest::get(format!(
        "http://{addr}/api/scan?url=http://{addr}/sites/store/"
    ))
    .await
    .unwrap();
    assert_eq!(r.status().as_u16(), 400);
    let body: serde_json::Value = r.json().await.unwrap();
    assert!(
        body["error"]
            .as_str()
            .unwrap()
            .contains("not a public address"),
        "{body}"
    );
}

/// Serves `routes` on a free loopback port.
async fn serve_html(routes: axum::Router) -> std::net::SocketAddr {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move { axum::serve(listener, routes).await });
    addr
}

#[tokio::test]
async fn scan_browser_never_reaches_refused_hosts() {
    use axum::response::{Html, Redirect};
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::{ScanError, Scanner};

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    // The "private" endpoint: any connection to it is a failure.
    let trap = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let t = trap.local_addr().unwrap();
    let page = format!(
        r#"<!doctype html><title>p</title><img src="http://{t}/img"><iframe src="http://{t}/frame"></iframe>
        <script>fetch("http://{t}/fetch").catch(()=>{{}}); new WebSocket("ws://{t}/ws");</script>"#
    );
    let site = serve_html(
        axum::Router::new()
            .route("/", get(move || std::future::ready(Html(page.clone()))))
            .route(
                "/go",
                get(move || std::future::ready(Redirect::temporary(&format!("http://{t}/secret")))),
            ),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));

    let ok = scanner.scan(&format!("http://{site}/")).await;
    assert!(ok.is_ok(), "{ok:?}");
    let redirected = scanner.scan(&format!("http://{site}/go")).await;
    assert!(
        matches!(redirected, Err(ScanError::BadUrl(_) | ScanError::Failed(_))),
        "{redirected:?}"
    );

    let hit = tokio::time::timeout(std::time::Duration::from_millis(500), trap.accept()).await;
    assert!(hit.is_err(), "the scan browser connected to a refused host");
}

#[tokio::test]
async fn timed_out_scans_leave_no_page_running() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::{ScanError, Scanner};

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        get(|| std::future::ready(Html("<!doctype html><script>while (true) {}</script>"))),
    ))
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]))
        .deadline(std::time::Duration::from_secs(3));
    for _ in 0..2 {
        let r = scanner.scan(&format!("http://{site}/")).await;
        assert!(matches!(r, Err(ScanError::TimedOut)), "{r:?}");
        assert_eq!(scanner.open_contexts().await.unwrap(), 0);
    }
}

#[tokio::test]
async fn a_stalled_or_endless_favicon_never_costs_the_report() {
    use axum::body::Body;
    use axum::response::{Html, Response};
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let endless = || async {
        let chunk = bytes_of(64 * 1024);
        let stream =
            futures_util::stream::repeat_with(move || Ok::<_, std::io::Error>(chunk.clone()));
        Response::builder()
            .header("content-type", "image/png")
            .body(Body::from_stream(stream))
            .unwrap()
    };
    let site = serve_html(
        axum::Router::new()
            .route(
                "/slow/",
                get(|| {
                    std::future::ready(Html(
                        r#"<!doctype html><title>s</title><link rel="icon" href="/never.png">"#,
                    ))
                }),
            )
            .route("/never.png", get(std::future::pending::<&'static str>))
            .route(
                "/huge/",
                get(|| {
                    std::future::ready(Html(
                        r#"<!doctype html><title>h</title><link rel="icon" href="/endless.png">"#,
                    ))
                }),
            )
            .route("/endless.png", get(endless)),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    for path in ["slow", "huge"] {
        let started = std::time::Instant::now();
        let report = scanner
            .scan(&format!("http://{site}/{path}/"))
            .await
            .unwrap();
        assert!(report.favicon.is_none(), "{path}");
        assert!(
            started.elapsed() < std::time::Duration::from_secs(20),
            "{path} took {:?}",
            started.elapsed()
        );
    }
}

fn bytes_of(n: usize) -> axum::body::Bytes {
    axum::body::Bytes::from(vec![0u8; n])
}
