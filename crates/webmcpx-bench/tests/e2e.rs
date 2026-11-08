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
    if !built(&root) {
        eprintln!("skipping: run `just wasm js-build` first");
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

/// The npm package as the pages load it: the wasm module and the minified drop-in script.
fn built(root: &std::path::Path) -> bool {
    let package = root.join("packages/webmcpx");
    package.join("wasm/webmcpx_wasm_bg.wasm").is_file() && package.join("dist/auto.js").is_file()
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

/// A competent DOM agent can open a URL it found (a link's destination, a path in an index) and read
/// a page in parts; the baseline was once stuck on a page whose answer was one link away.
#[tokio::test]
async fn baseline_arm_navigates_and_sees_link_destinations() {
    let Some((run, model)) = run_one(
        "docs-config-path",
        Arm::Baseline,
        move |step, _| match step {
            0 => call("read_page", "{}"),
            1 => call("navigate", r#"{"url":"/sites/docs/#env"}"#),
            2 => call("read_page", r#"{"offset":0}"#),
            _ => answer("Set ORBIT_CONFIG to the config file's path."),
        },
    )
    .await
    else {
        return;
    };
    assert_eq!(run.harness_error, None);
    assert!(run.success, "{run:?}");
    let seen = model.seen.lock().unwrap();
    assert!(
        last_tool_result(&seen[1].0).contains(" -> /"),
        "links show where they go"
    );
    assert!(last_tool_result(&seen[2].0).starts_with("Opened "));
    assert!(last_tool_result(&seen[3].0).contains("ORBIT_CONFIG"));
}

/// A select is chosen by the label a user sees ("Price: low to high"), its value shown alongside.
#[tokio::test]
async fn baseline_selects_an_option_by_its_label() {
    let sort = |messages: &[Message]| {
        let page = last_tool_result(messages);
        let line = page
            .lines()
            .find(|l| l.contains("select") && l.contains("Price: low to high"))
            .unwrap_or_else(|| panic!("no sort select in snapshot:\n{page}"));
        assert!(line.contains("(value=price_asc)"), "{line}");
        line[1..line.find(']').unwrap()].parse::<u32>().unwrap()
    };
    let Some((_, model)) = run_one(
        "store-cheapest-blue-mug",
        Arm::Baseline,
        move |step, messages| match step {
            0 | 2 => call("read_page", "{}"),
            1 => call(
                "fill",
                &format!(
                    r#"{{"ref":{},"value":"Price: low to high"}}"#,
                    sort(messages)
                ),
            ),
            _ => answer("Sorted."),
        },
    )
    .await
    else {
        return;
    };
    let seen = model.seen.lock().unwrap();
    let after = last_tool_result(&seen[3].0);
    assert!(
        after
            .lines()
            .any(|l| l.contains("select") && l.contains("value=\"price_asc\"")),
        "{after}"
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
    assert_eq!(seen[0].1, ["read_page", "navigate", "click", "fill"]);
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
    if find_chrome().is_none() || !built(&root) {
        eprintln!("skipping: needs Chrome and `just wasm js-build`");
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
    if find_chrome().is_none() || !built(&root) {
        eprintln!("skipping: needs Chrome and `just wasm js-build`");
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

/// A Chrome that answers /json/version but never its DevTools socket must not hold the browser lock: each
/// scan gives up within its deadline, and so does the next one.
#[tokio::test]
async fn a_chrome_that_never_answers_times_out_each_scan() {
    use tokio::io::{AsyncReadExt as _, AsyncWriteExt as _};
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    tokio::spawn(async move {
        loop {
            let Ok((mut socket, _)) = listener.accept().await else {
                return;
            };
            tokio::spawn(async move {
                let mut buf = [0u8; 2048];
                let n = socket.read(&mut buf).await.unwrap_or(0);
                if String::from_utf8_lossy(&buf[..n]).starts_with("GET /json/version") {
                    let body = format!(
                        r#"{{"webSocketDebuggerUrl":"ws://127.0.0.1:{port}/devtools/browser/x"}}"#
                    );
                    let reply = format!(
                        "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\n\r\n{body}",
                        body.len()
                    );
                    let _ = socket.write_all(reply.as_bytes()).await;
                } else {
                    // The WebSocket upgrade: never answered.
                    tokio::time::sleep(std::time::Duration::from_secs(600)).await;
                }
            });
        }
    });
    let scanner = webmcpx_bench::scan::Scanner::new(None, true)
        .remote(webmcpx_bench::scan::Remote {
            chrome: format!("127.0.0.1:{port}"),
            proxy: ([127, 0, 0, 1], free_port()).into(),
        })
        .deadline(std::time::Duration::from_secs(2));
    for url in ["http://127.0.0.1:9/a", "http://127.0.0.1:9/b"] {
        let start = std::time::Instant::now();
        let r = scanner.scan(url).await;
        assert!(
            matches!(r, Err(webmcpx_bench::scan::ScanError::TimedOut)),
            "{r:?}"
        );
        assert!(
            start.elapsed() < std::time::Duration::from_secs(8),
            "{:?}",
            start.elapsed()
        );
    }
}

/// A remote Chrome outlives our connection to it: the pages we opened must not.
#[tokio::test]
async fn a_dropped_connection_closes_its_pages_in_a_remote_chrome() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let devtools = free_port();
    let _chrome = Browser::launch_with(None, &[format!("--remote-debugging-port={devtools}")])
        .await
        .unwrap();
    let endpoint = format!("127.0.0.1:{devtools}");
    let first = Browser::connect(&endpoint).await.unwrap();
    let _page = first.page(&[]).await.unwrap();
    let observer = Browser::connect(&endpoint).await.unwrap();
    assert_eq!(observer.open_contexts().await.unwrap(), 1);
    drop(first); // As a restarted server or a replaced session would.
    for _ in 0..50 {
        if observer.open_contexts().await.unwrap() == 0 {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
    panic!("the abandoned page is still open");
}

/// Many people scanning the same site at once (a viral link) cost one browser visit, and a repeat
/// within the cache window costs none.
#[tokio::test]
async fn the_same_site_is_scanned_once_for_everyone() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let visits = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let counter = Arc::clone(&visits);
    let site = serve_html(
        axum::Router::new()
            .route(
                "/",
                axum::routing::get(move |headers: axum::http::HeaderMap| {
                    // Navigations only: the scan's agent checks fetch the page too (as Markdown, and HEAD).
                    let accept = headers
                        .get("accept")
                        .and_then(|v| v.to_str().ok())
                        .unwrap_or("");
                    if accept.contains("text/html") {
                        counter.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                    }
                    async { axum::response::Html("<title>t</title><p>Hello</p>") }
                }),
            )
            // With a robots.txt the agent checks run from it, so a scan loads the page once.
            .route(
                "/robots.txt",
                axum::routing::get(|| async { "User-agent: *\nAllow: /\n" }),
            ),
    )
    .await;
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, true));
    let url = format!("http://{site}/");
    let scans: Vec<_> = (0..5)
        .map(|_| {
            let (scanner, url) = (Arc::clone(&scanner), url.clone());
            tokio::spawn(async move { scanner.scan(&url).await.map(|r| r.verdict) })
        })
        .collect();
    for scan in scans {
        assert!(scan.await.unwrap().is_ok());
    }
    assert!(scanner.scan(&url).await.is_ok());
    assert_eq!(visits.load(std::sync::atomic::Ordering::SeqCst), 1);
    assert_eq!(scanner.in_flight(), 0);
}

/// A visitor who gives up while waiting in line (a closed tab) frees their place.
#[tokio::test]
async fn a_cancelled_scan_frees_its_place_in_line() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/{page}",
        axum::routing::get(|| async {
            tokio::time::sleep(std::time::Duration::from_secs(2)).await;
            axum::response::Html("<title>slow</title>")
        }),
    ))
    .await;
    // One scan at a time, one more in line.
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, true).capacity(1, 1));
    let scan = |page: &str| {
        let (scanner, url) = (Arc::clone(&scanner), format!("http://{site}/{page}"));
        tokio::spawn(async move { scanner.scan(&url).await.map(|r| r.verdict) })
    };
    let running = scan("a");
    tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    let gave_up = scan("b");
    tokio::time::sleep(std::time::Duration::from_millis(200)).await;
    gave_up.abort();
    let _ = gave_up.await;
    let next = scan("c");
    assert!(running.await.unwrap().is_ok());
    assert!(
        next.await.unwrap().is_ok(),
        "the place the cancelled scan held was not freed"
    );
}

/// The public scanner: one scan per visitor per period, the visitor read from our proxy's header.
#[tokio::test]
async fn scan_api_limits_each_visitor() {
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, false));
    let visitors = Arc::new(webmcpx_bench::visitors::Visitors::new(
        std::time::Duration::from_secs(60),
        true,
    ));
    let addr = server::spawn_with(
        &repo_root(),
        ([127, 0, 0, 1], 0).into(),
        Some(scanner),
        Some(visitors),
    )
    .await
    .unwrap();
    let client = reqwest::Client::new();
    let scan = |from: &'static str| {
        client
            .get(format!("http://{addr}/api/scan?url=http://127.0.0.1:9/"))
            .header("X-Forwarded-For", from)
            .send()
    };
    // A refused URL still counts: the limit comes first.
    assert_eq!(
        scan("2600::1:2:3:4:5").await.unwrap().status().as_u16(),
        400
    );
    let again = scan("2600:0:0:1::99").await.unwrap();
    assert_eq!(again.status().as_u16(), 429, "same /64, same visitor");
    assert!(again.headers().contains_key("retry-after"));
    let body: serde_json::Value = again.json().await.unwrap();
    assert!(
        body["error"]
            .as_str()
            .unwrap()
            .contains("One scan per minute"),
        "{body}"
    );
    assert_eq!(
        scan("2600:0:0:2::1").await.unwrap().status().as_u16(),
        400,
        "another visitor"
    );
}

/// `SvelteKit` (and others) wrap the whole page in a `display: contents` element, which has no box: the
/// snapshot must read through it instead of dropping the page (it once measured webmcpx.dev at 16 tokens).
#[tokio::test]
async fn the_snapshot_reads_through_display_contents_wrappers() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let words = "Kettles carry a two-year warranty from the date of purchase. ".repeat(20);
    let page = format!(
        r#"<title>t</title><div style="display: contents"><main><h1>Care</h1><p>{words}</p>
        <details><summary>Returns</summary><div style="display: contents">SECRET-UNTIL-OPENED<p>NESTED-SECRET</p></div></details>
        <div id="cv" style="content-visibility: hidden"><div style="display: contents">CV-SECRET</div></div>
        <div style="visibility: hidden"><div style="display: contents">VIS-SECRET</div></div>
        </main></div>"#
    );
    let site = serve_html(axum::Router::new().route(
        "/",
        axum::routing::get(move || {
            let page = page.clone();
            async move { axum::response::Html(page) }
        }),
    ))
    .await;
    let scanner = webmcpx_bench::scan::Scanner::new(None, true);
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert!(
        report.page_tokens > 200,
        "the wrapped page was dropped: {} tokens",
        report.page_tokens
    );
    // What a closed <details> hides stays hidden, wrapper or not.
    let browser = Browser::launch(None).await.unwrap();
    let page = browser
        .page(&webmcpx_bench::arm::INIT_SCRIPTS)
        .await
        .unwrap();
    page.goto(&format!("http://{site}/")).await.unwrap();
    let snapshot = page.eval("__bench.snapshot()").await.unwrap();
    let snapshot = snapshot.as_str().unwrap();
    assert!(snapshot.contains("Kettles carry"), "{snapshot}");
    for hidden in [
        "SECRET-UNTIL-OPENED",
        "NESTED-SECRET",
        "CV-SECRET",
        "VIS-SECRET",
    ] {
        assert!(!snapshot.contains(hidden), "{hidden} leaked:\n{snapshot}");
    }
    page.eval(
        "document.querySelector('details').open = true; \
         document.getElementById('cv').style.contentVisibility = 'visible'",
    )
    .await
    .unwrap();
    let opened = page.eval("__bench.snapshot()").await.unwrap();
    let opened = opened.as_str().unwrap();
    assert!(
        opened.contains("SECRET-UNTIL-OPENED") && opened.contains("CV-SECRET"),
        "{opened}"
    );
}

/// A hostile page can't send the scanner megabytes: not by redefining `slice`, `JSON.stringify` or a
/// getter, nor with schemas that each pass their own cap. The shared browser connection survives, and
/// the next scan works.
#[tokio::test]
async fn a_hostile_page_cannot_flood_the_scanner() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let tampered = r#"<!doctype html><title>t</title><main><p>Hello.</p></main><script>
      String.prototype.slice = function () { return String(this); };
      JSON.stringify = () => "x".repeat(5e6);
      document.title = "T".repeat(3e6);
      Object.defineProperty(document, "readyState", { get: () => "z".repeat(3e6) });
      document.modelContext.registerTool({ name: "big", description: "d".repeat(3e6), execute() {} });
    </script>"#;
    // A frame name is page-set and unbounded, and Chrome sends it in Page.frameNavigated: this page can
    // end its own connection (its scan fails), never the one other scans use.
    let frame_name = r#"<!doctype html><title>f</title><script>
      const f = document.createElement("iframe");
      document.documentElement.append(f);
      f.contentWindow.name = "n".repeat(7e7);
      f.src = "/plain";
    </script>"#;
    let schemas = r#"<!doctype html><title>s</title><script>
      for (let i = 0; i < 200; i++) document.modelContext.registerTool({
        name: "t" + i, description: "d",
        inputSchema: { type: "object", properties: { v: { enum: Array(24900).fill(0) } } },
        execute() {},
      });
    </script>"#;
    // Inherited toJSON hooks run inside the captured JSON.stringify too: the overflow error itself must
    // not be one of them.
    let to_json = r#"<!doctype html><title>j</title><script>
      Object.prototype.toJSON = function () { return this.error ? "x".repeat(7e7) : this; };
      for (let i = 0; i < 200; i++) document.modelContext.registerTool({
        name: "t" + i, description: "d".repeat(2000),
        inputSchema: { type: "object", properties: { v: { enum: Array(4000).fill(0) } } }, execute() {},
      });
    </script>"#;
    // A throw carries its message out through CDP: list() must catch it in the page.
    let throws = r#"<!doctype html><title>x</title><script>
      document.modelContext.registerTool({ name: "t", description: "d", execute() {},
        get annotations() { throw new Error("X".repeat(7e7)); } });
    </script>"#;
    let site = serve_html(
        axum::Router::new()
            .route(
                "/framename",
                axum::routing::get(move || std::future::ready(axum::response::Html(frame_name))),
            )
            .route(
                "/throws",
                axum::routing::get(move || std::future::ready(axum::response::Html(throws))),
            )
            .route(
                "/tampered",
                axum::routing::get(move || std::future::ready(axum::response::Html(tampered))),
            )
            .route(
                "/tojson",
                axum::routing::get(move || std::future::ready(axum::response::Html(to_json))),
            )
            .route(
                "/schemas",
                axum::routing::get(move || std::future::ready(axum::response::Html(schemas))),
            )
            .route(
                "/plain",
                axum::routing::get(|| {
                    std::future::ready(axum::response::Html(
                        "<!doctype html><title>Plain</title><p>ok</p>",
                    ))
                }),
            ),
    )
    .await;
    let scanner = webmcpx_bench::scan::Scanner::new(None, true);
    let report = scanner
        .scan(&format!("http://{site}/tampered"))
        .await
        .unwrap();
    assert!(
        report.title.chars().count() <= 300,
        "{} chars",
        report.title.len()
    );
    assert!(
        report
            .tools
            .iter()
            .all(|t| t.description.chars().count() <= 2_000)
    );
    let err = scanner
        .scan(&format!("http://{site}/schemas"))
        .await
        .unwrap_err();
    assert!(format!("{err:?}").contains("over 1000000 chars"), "{err:?}");
    let (hostile, plain) = (
        format!("http://{site}/framename"),
        format!("http://{site}/plain"),
    );
    let (_, beside) = tokio::join!(scanner.scan(&hostile), async {
        tokio::time::sleep(std::time::Duration::from_millis(300)).await;
        scanner.scan(&plain).await
    });
    assert_eq!(
        beside.unwrap().title,
        "Plain",
        "a scan beside the hostile one"
    );
    let err = scanner
        .scan(&format!("http://{site}/throws"))
        .await
        .unwrap_err();
    assert!(format!("{err:?}").contains("threw"), "{err:?}");
    let err = scanner
        .scan(&format!("http://{site}/tojson"))
        .await
        .unwrap_err();
    assert!(format!("{err:?}").contains("over 1000000 chars"), "{err:?}");
    let plain = scanner.scan(&format!("http://{site}/plain")).await.unwrap();
    assert_eq!(plain.title, "Plain");
}

/// Sharing a result: the link's page carries that site's card, the card renders, the badge shows the
/// verdict, and a repeat scan comes from the cache without counting against the visitor's limit.
#[tokio::test]
async fn shared_scans_have_a_card_a_badge_and_cost_nothing() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        axum::routing::get(|| async { axum::response::Html("<title>t</title><p>Hello there</p>") }),
    ))
    .await;
    let root = tempfile::tempdir().unwrap();
    std::fs::create_dir_all(root.path().join("site/build")).unwrap();
    std::fs::write(
        root.path().join("site/build/index.html"),
        r#"<html><head><meta property="og:image" content="/og.png"></head><body>landing</body></html>"#,
    )
    .unwrap();
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, true));
    let visitors = Arc::new(webmcpx_bench::visitors::Visitors::new(
        std::time::Duration::from_secs(60),
        false,
    ));
    let addr = server::spawn_with(
        root.path(),
        ([127, 0, 0, 1], 0).into(),
        Some(scanner),
        Some(visitors),
    )
    .await
    .unwrap();
    let target = format!("http://{site}/");
    let api = format!("http://{addr}/api/scan?url={target}");
    assert_eq!(reqwest::get(&api).await.unwrap().status().as_u16(), 200);
    // Same visitor, within the minute: served from the cache, not refused.
    assert_eq!(reqwest::get(&api).await.unwrap().status().as_u16(), 200);

    std::fs::write(root.path().join("site/build/index.md"), "# landing").unwrap();
    let markdown = reqwest::Client::new()
        .get(format!("http://{addr}/"))
        .header("accept", "text/markdown, text/html;q=0.9")
        .send()
        .await
        .unwrap();
    assert_eq!(
        markdown.headers()["content-type"],
        "text/markdown; charset=utf-8"
    );
    assert_eq!(markdown.headers()["vary"], "Accept");
    assert_eq!(markdown.text().await.unwrap(), "# landing");
    let html = reqwest::get(format!("http://{addr}/")).await.unwrap();
    // Browsers get HTML at the same URL, so caches must key on Accept.
    assert_eq!(html.headers()["vary"], "Accept");
    let html = html.text().await.unwrap();
    assert!(html.contains("landing</body>"), "{html}");
    // A file that does not exist is a 404, never a server error.
    for missing in ["favicon.ico", "x/y.txt", "nope/"] {
        let status = reqwest::get(format!("http://{addr}/{missing}"))
            .await
            .unwrap()
            .status();
        assert_eq!(status, reqwest::StatusCode::NOT_FOUND, "{missing}");
    }

    let page = reqwest::get(format!("http://{addr}/?scan={target}"))
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    assert!(page.contains("/og/scan.png?url="), "{page}");
    assert!(
        page.contains("Not agent-ready yet") && page.contains("landing"),
        "{page}"
    );

    let card = reqwest::get(format!("http://{addr}/og/scan.png?url={target}"))
        .await
        .unwrap();
    assert_eq!(card.headers()["content-type"], "image/png");
    let png = card.bytes().await.unwrap();
    assert!(
        png.starts_with(b"\x89PNG") && png.len() > 10_000,
        "{} bytes",
        png.len()
    );

    let host = target.trim_start_matches("http://").trim_end_matches('/');
    let badge = reqwest::get(format!("http://{addr}/badge/{host}.svg"))
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    assert!(badge.contains(">not yet</text>"), "{badge}");
    let unknown = reqwest::get(format!("http://{addr}/badge/never.example.svg"))
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    assert!(unknown.contains(">scan</text>"));
}

/// A burst of requests for one unrendered card renders it once; nobody waits forever.
#[tokio::test]
async fn a_burst_of_card_requests_renders_once() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        axum::routing::get(|| async { axum::response::Html("<title>t</title><p>Hi</p>") }),
    ))
    .await;
    let scanner = Arc::new(webmcpx_bench::scan::Scanner::new(None, true));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    let tasks: Vec<_> = (0..20)
        .map(|_| {
            let (scanner, report) = (Arc::clone(&scanner), report.clone());
            tokio::spawn(async move { scanner.card(&report).await })
        })
        .collect();
    let mut cards = Vec::new();
    for t in tasks {
        if let Ok(png) = t.await.unwrap() {
            cards.push(png);
        }
    }
    assert!(!cards.is_empty() && cards.len() <= 20);
    // Every card served is the one rendering.
    assert!(cards.iter().all(|c| Arc::ptr_eq(c, &cards[0])));
}

/// The generic preview image every page and cold share link falls back to ships with the site.
#[test]
fn the_generic_preview_image_ships_with_the_site() {
    let png = std::fs::read(repo_root().join("site/static/og.png")).unwrap();
    assert!(png.starts_with(b"\x89PNG\r\n\x1a\n"));
    // IHDR: width and height, big-endian, at bytes 16..24.
    let (w, h) = (
        u32::from_be_bytes(png[16..20].try_into().unwrap()),
        u32::from_be_bytes(png[20..24].try_into().unwrap()),
    );
    assert_eq!((w, h), (1200, 630));
}

/// WebMCP exists only in secure contexts: the same page has tools on loopback (secure) and none over
/// plain http on another host, as in the browsers.
#[tokio::test]
async fn an_insecure_page_has_no_model_context() {
    if find_chrome().is_none() {
        eprintln!("skipping: needs Chrome");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        axum::routing::get(|| {
            std::future::ready(axum::response::Html(
                r#"<!doctype html><script>document.modelContext?.registerTool({ name: "t", description: "d", execute() {} });</script>"#,
            ))
        }),
    ))
    .await;
    let browser = Browser::launch_with(
        None,
        &["--host-resolver-rules=MAP insecure.test 127.0.0.1".to_owned()],
    )
    .await
    .unwrap();
    let page = browser
        .page(&webmcpx_bench::arm::INIT_SCRIPTS)
        .await
        .unwrap();
    let wait = std::time::Duration::from_millis(500);
    page.goto(&format!("http://{site}/")).await.unwrap();
    let secure = webmcpx_bench::arm::registered_tools(&page, wait)
        .await
        .unwrap();
    assert_eq!(secure.len(), 1);
    page.goto(&format!("http://insecure.test:{}/", site.port()))
        .await
        .unwrap();
    let insecure = webmcpx_bench::arm::registered_tools(&page, wait)
        .await
        .unwrap();
    assert!(insecure.is_empty(), "{insecure:?}");
    // A page can rebind `globalThis`, never `window`: the list still comes from the real host.
    page.goto(&format!("http://{site}/")).await.unwrap();
    page.eval(
        r#"globalThis = { __webmcpHost: { list: () => JSON.stringify([{ name: "fake", description: "", annotations: {}, document: "0" }]) } }"#,
    )
    .await
    .unwrap();
    let real = webmcpx_bench::arm::registered_tools(&page, wait)
        .await
        .unwrap();
    assert_eq!(real.len(), 1);
    assert_eq!(real[0]["name"], "t");
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

/// A renderer stuck in a script while loading makes every readiness check time out: goto gives up after
/// its 30 s of wall-clock time, not 1,200 checks of 60 s each.
#[tokio::test]
async fn goto_gives_up_on_a_page_stuck_while_loading() {
    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        axum::routing::get(|| {
            std::future::ready(axum::response::Html(
                "<!doctype html><script>while (true) {}</script>",
            ))
        }),
    ))
    .await;
    let browser = Browser::launch(None).await.unwrap();
    let page = browser.page(&[]).await.unwrap();
    let start = std::time::Instant::now();
    assert!(page.goto(&format!("http://{site}/")).await.is_err());
    assert!(
        start.elapsed() < std::time::Duration::from_secs(45),
        "{:?}",
        start.elapsed()
    );
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
async fn a_cancelled_scan_leaves_no_page_running() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        get(|| std::future::ready(Html("<!doctype html><script>while (true) {}</script>"))),
    ))
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    // The visitor goes away mid-scan: the scan future is dropped while the page runs.
    let gone = tokio::time::timeout(
        std::time::Duration::from_millis(1500),
        scanner.scan(&format!("http://{site}/")),
    )
    .await;
    assert!(gone.is_err(), "the scan should still be running");
    // Disposal runs in the background; give a loaded machine up to 15 s.
    for _ in 0..150 {
        if scanner.open_contexts().await.unwrap() == 0 {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
    panic!("the cancelled scan left its page running");
}

#[tokio::test]
async fn tools_registered_in_a_same_origin_frame_count() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::{Scanner, Verdict};

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(
        axum::Router::new()
            .route("/", get(|| std::future::ready(Html(
                r#"<!doctype html><title>Top</title><main><p>Shop.</p></main><iframe src="/frame"></iframe>"#,
            ))))
            .route("/frame", get(|| std::future::ready(Html(
                r#"<!doctype html><script>document.modelContext.registerTool({ name: "checkout", description: "Pay for the cart.", inputSchema: { type: "object", properties: {} }, annotations: { consequentialHint: true }, execute: () => "ok" })</script>"#,
            )))),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert_eq!(report.verdict, Verdict::Ready, "{:?}", report.diagnostics);
    assert_eq!(report.tools.len(), 1);
}

#[tokio::test]
async fn a_page_cannot_send_the_scanner_megabytes() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        get(|| std::future::ready(Html(
            r#"<!doctype html><script>
              const huge = "\u00ad".repeat(3_000_000);
              for (let i = 0; i < 300; i++) document.modelContext.registerTool({ name: "t" + i, description: huge, execute: () => "" });
            </script>"#,
        ))),
    ))
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert_eq!(report.tools.len(), 200);
    assert!(
        report
            .tools
            .iter()
            .all(|t| t.description.chars().count() <= 2_000)
    );
}

#[tokio::test]
async fn a_huge_title_or_text_never_breaks_the_shared_connection() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(axum::Router::new().route(
        "/",
        get(|| {
            std::future::ready(Html(
                r#"<!doctype html><main id="m"></main><script>
              const big = "word ".repeat(15_000_000);
              document.title = big;
              document.getElementById("m").textContent = big;
            </script>"#,
            ))
        }),
    ))
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert!(report.title.chars().count() <= 300);
    assert!(report.page_tokens > 1_000_000);
    // The same connection still serves the next scan.
    assert!(scanner.scan(&format!("http://{site}/?again")).await.is_ok());
}

#[tokio::test]
async fn a_frame_tool_named_like_the_pages_is_still_checked() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::{Scanner, Verdict};

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(
        axum::Router::new()
            .route("/", get(|| std::future::ready(Html(
                r#"<!doctype html><title>Top</title><script>document.modelContext.registerTool({ name: "search", description: "Search the shop.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true }, execute: () => "" })</script><iframe src="/frame"></iframe>"#,
            ))))
            .route("/frame", get(|| std::future::ready(Html(
                r#"<!doctype html><script>document.modelContext.registerTool({ name: "search", description: "Search the frame.", inputSchema: { type: "string" }, execute: () => "" })</script>"#,
            )))),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    // Both definitions are reported; the frame's invalid schema makes it "Almost", and the same name in
    // two documents is not a duplicate.
    assert_eq!(report.tools.len(), 2);
    assert_eq!(report.verdict, Verdict::Issues);
    let rules: Vec<_> = report.diagnostics.iter().map(|d| d.rule).collect();
    assert!(rules.contains(&"invalid-input-schema"), "{rules:?}");
    assert!(!rules.contains(&"duplicate-name"), "{rules:?}");
}

#[tokio::test]
async fn a_page_that_checks_for_its_own_model_context_property_still_registers() {
    use axum::response::Html;
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::{Scanner, Verdict};

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    // Like Shopify storefronts (which broke when the host moved to Document.prototype): register only
    // when document has modelContext as its own property.
    let site = serve_html(axum::Router::new().route(
        "/",
        get(|| std::future::ready(Html(
            r#"<!doctype html><title>Shop</title><script>
              if (Object.prototype.hasOwnProperty.call(document, "modelContext"))
                document.modelContext.registerTool({ name: "search_catalog", description: "Search the catalog.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true }, execute: () => "" });
            </script>"#,
        ))),
    ))
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert_eq!(
        report.verdict,
        Verdict::Ready,
        "{:?} {:?}",
        report.diagnostics,
        report.score_items
    );
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

#[tokio::test]
async fn the_score_reads_the_agent_basics_and_a_robots_block_costs_points() {
    use axum::http::header;
    use axum::response::{Html, IntoResponse};
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let page = || async {
        (
            [(header::LINK, r#"</llms.txt>; rel="describedby""#)],
            Html(r#"<!doctype html><title>basics</title><link rel="alternate" type="text/markdown" href="/index.md">"#),
        )
            .into_response()
    };
    let text = |body: &'static str, kind: &'static str| {
        move || async move { ([(header::CONTENT_TYPE, kind)], body).into_response() }
    };
    let site = serve_html(
        axum::Router::new()
            .route("/", get(page))
            .route(
                "/robots.txt",
                get(text(
                    "User-agent: GPTBot\nDisallow: /\n\nSitemap: /sitemap.xml\n",
                    "text/plain",
                )),
            )
            .route("/llms.txt", get(text("# basics\n", "text/plain")))
            .route(
                "/.well-known/agent-skills/index.json",
                get(text(r#"{"skills": []}"#, "application/json")),
            )
            .route(
                "/.well-known/api-catalog",
                get(text(r#"{"linkset": []}"#, "application/linkset+json")),
            ),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    let got = |id: &str| {
        report
            .score_items
            .iter()
            .find(|i| i.id == id)
            .unwrap()
            .points
    };
    for id in [
        "llms_txt",
        "markdown",
        "sitemap",
        "link_headers",
        "agent_skills",
        "api_catalog",
    ] {
        assert_eq!(got(id), 5, "{id}: {:?}", report.score_items);
    }
    assert_eq!(got("robots"), 0, "GPTBot is shut out");
    assert_eq!(got("tools"), 0);
}

#[tokio::test]
async fn the_agent_checks_follow_robots_rules_and_ignore_the_page_csp() {
    use axum::http::{StatusCode, header};
    use axum::response::{Html, IntoResponse};
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    // A page whose CSP forbids every fetch: the checks must still read the site's files.
    async fn site_with(robots: axum::routing::MethodRouter) -> std::net::SocketAddr {
        serve_html(
            axum::Router::new()
                .route(
                    "/",
                    get(|| async {
                        (
                            [(header::CONTENT_SECURITY_POLICY, "connect-src 'none'")],
                            Html("<!doctype html><title>csp</title><p>Hi</p>"),
                        )
                            .into_response()
                    }),
                )
                .route("/robots.txt", robots)
                .route(
                    "/sitemap.xml",
                    get(|| async {
                        (
                            [(header::CONTENT_TYPE, "application/xml")],
                            "<urlset></urlset>",
                        )
                            .into_response()
                    }),
                ),
        )
        .await
    }

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let text = |body: &'static str| {
        get(move || async move { ([(header::CONTENT_TYPE, "text/plain")], body).into_response() })
    };
    let cases: Vec<(&str, axum::routing::MethodRouter, u8)> = vec![
        ("open", text("User-agent: *\nDisallow: /private\n"), 5),
        ("wildcard ban", text("User-agent: *\nDisallow: /*\n"), 0),
        (
            "ban, one bot allowed",
            text("User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /\n"),
            0,
        ),
        (
            "allow wins a tie",
            text("User-agent: *\nDisallow: /\nAllow: /\n"),
            5,
        ),
        (
            "a ban past the 64 KiB cut is not missed",
            text(Box::leak(
                format!(
                    "{}User-agent: GPTBot\nDisallow: /\n",
                    "# padding\n".repeat(8_000)
                )
                .into_boxed_str(),
            )),
            0,
        ),
        (
            "an empty Disallow ends its group",
            text("User-agent: GPTBot\nDisallow:\n\nUser-agent: ExampleBot\nDisallow: /\n"),
            5,
        ),
        ("missing (404)", get(|| async { StatusCode::NOT_FOUND }), 5),
        (
            "down (503)",
            get(|| async { StatusCode::SERVICE_UNAVAILABLE }),
            0,
        ),
    ];
    for (name, robots, want) in cases {
        let site = site_with(robots).await;
        let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
        let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
        let got = |id: &str| {
            report
                .score_items
                .iter()
                .find(|i| i.id == id)
                .unwrap()
                .points
        };
        assert_eq!(got("robots"), want, "{name}");
        assert_eq!(
            got("sitemap"),
            5,
            "{name}: the CSP must not block the checks"
        );
    }
}

#[tokio::test]
async fn the_agent_checks_keep_the_page_icon() {
    use axum::http::header;
    use axum::response::{Html, IntoResponse};
    use axum::routing::get;
    use webmcpx_bench::proxy::Egress;
    use webmcpx_bench::scan::Scanner;

    // A 1x1 PNG.
    const PNG: &[u8] = &[
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 0x49, 0x48, 0x44, 0x52, 0,
        0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1F, 0x15, 0xC4, 0x89, 0, 0, 0, 0x0D, 0x49, 0x44,
        0x41, 0x54, 0x78, 0x9C, 0x63, 0, 1, 0, 0, 5, 0, 1, 0x0D, 0x0A, 0x2D, 0xB4, 0, 0, 0, 0,
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
    ];

    if find_chrome().is_none() {
        eprintln!("skipping: Chrome not found");
        return;
    }
    let site = serve_html(
        axum::Router::new()
            .route(
                "/",
                get(|| async { Html(r#"<!doctype html><title>i</title><link rel="icon" href="/assets/icon.png">"#) }),
            )
            .route("/assets/icon.png", get(|| async { ([(header::CONTENT_TYPE, "image/png")], PNG).into_response() }))
            .route("/robots.txt", get(|| async { "User-agent: *\nAllow: /\n" })),
    )
    .await;
    let scanner = Scanner::with_egress(None, Egress::Only(vec![site]));
    let report = scanner.scan(&format!("http://{site}/")).await.unwrap();
    assert!(
        report
            .favicon
            .as_deref()
            .is_some_and(|f| f.starts_with("data:image/png")),
        "the icon the page declares, read before the checks leave the page"
    );
}
