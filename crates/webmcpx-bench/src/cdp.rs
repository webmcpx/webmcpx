//! A minimal Chrome DevTools Protocol client: launch headless Chrome, open isolated pages, evaluate
//! JavaScript. Only what the benchmark needs; events are ignored (we poll).

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use anyhow::{Context as _, Result, anyhow, bail};
use futures_util::{SinkExt as _, StreamExt as _};
use serde_json::{Value, json};
use tokio::io::{AsyncBufReadExt as _, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::tungstenite::Message as Ws;

type Pending = Arc<Mutex<HashMap<u64, oneshot::Sender<Result<Value, String>>>>>;

#[derive(Clone)]
struct Conn {
    tx: mpsc::UnboundedSender<Ws>,
    pending: Pending,
    next_id: Arc<AtomicU64>,
}

impl Conn {
    async fn connect(url: &str) -> Result<Self> {
        let (socket, _) = tokio_tungstenite::connect_async(url)
            .await
            .with_context(|| format!("connecting to {url}"))?;
        let (mut sink, mut stream) = socket.split();
        let (tx, mut rx) = mpsc::unbounded_channel::<Ws>();
        tokio::spawn(async move {
            while let Some(msg) = rx.recv().await {
                if sink.send(msg).await.is_err() {
                    break;
                }
            }
        });
        let pending: Pending = Arc::default();
        let routes = Arc::clone(&pending);
        tokio::spawn(async move {
            while let Some(Ok(msg)) = stream.next().await {
                let Ws::Text(text) = msg else { continue };
                let Ok(v) = serde_json::from_str::<Value>(&text) else {
                    continue;
                };
                let Some(id) = v["id"].as_u64() else { continue };
                let Some(reply) = lock(&routes).remove(&id) else {
                    continue;
                };
                let result = match v.get("error") {
                    Some(e) => Err(e.to_string()),
                    None => Ok(v["result"].clone()),
                };
                // The caller may have timed out and dropped its receiver.
                let _ = reply.send(result);
            }
            // Connection closed: dropping the senders fails every waiting call.
            lock(&routes).clear();
        });
        Ok(Self {
            tx,
            pending,
            next_id: Arc::new(AtomicU64::new(1)),
        })
    }

    async fn call(&self, session: Option<&str>, method: &str, params: Value) -> Result<Value> {
        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        let mut msg = json!({ "id": id, "method": method, "params": params });
        if let Some(s) = session {
            msg["sessionId"] = s.into();
        }
        let (reply, response) = oneshot::channel();
        lock(&self.pending).insert(id, reply);
        self.tx
            .send(Ws::text(msg.to_string()))
            .map_err(|_| anyhow!("browser connection closed"))?;
        match tokio::time::timeout(Duration::from_secs(60), response).await {
            Ok(Ok(Ok(v))) => Ok(v),
            Ok(Ok(Err(e))) => bail!("{method}: {e}"),
            Ok(Err(_)) => bail!("{method}: browser connection closed"),
            Err(_) => {
                lock(&self.pending).remove(&id);
                bail!("{method}: timed out")
            }
        }
    }
}

fn lock<T>(m: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    // A panic while holding the lock cannot leave the map inconsistent.
    m.lock().unwrap_or_else(std::sync::PoisonError::into_inner)
}

/// A headless Chrome: a process we started (killed on drop), or one running elsewhere that we connected to.
pub struct Browser {
    conn: Conn,
    _child: Option<Child>,
    _profile: Option<tempfile::TempDir>,
}

impl Drop for Browser {
    fn drop(&mut self) {
        // Close the DevTools connection: a remote Chrome then disposes every context we opened. (A Chrome
        // we started is killed with its process anyway.)
        let _ = self.conn.tx.send(Ws::Close(None));
    }
}

impl Browser {
    pub async fn launch(executable: Option<&Path>) -> Result<Self> {
        Self::launch_with(executable, &[]).await
    }

    /// Like [`launch`](Self::launch), with extra command-line switches (e.g. a proxy).
    pub async fn launch_with(executable: Option<&Path>, extra_args: &[String]) -> Result<Self> {
        let executable = match executable {
            Some(p) => p.to_path_buf(),
            None => find_chrome().context(
                "Chrome not found: install Google Chrome or Chromium, or pass --chrome <path>",
            )?,
        };
        let profile = tempfile::tempdir()?;
        let mut cmd = Command::new(&executable);
        cmd.args([
            "--headless",
            "--remote-debugging-port=0",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking",
            "--disable-component-update",
            "--disable-extensions",
            "--window-size=1280,900",
        ])
        .arg(format!("--user-data-dir={}", profile.path().display()))
        .args(extra_args);
        if std::env::var_os("CI").is_some() {
            // CI containers often lack the user namespaces Chrome's sandbox needs.
            cmd.arg("--no-sandbox");
        }
        let mut child = cmd
            .arg("about:blank")
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .with_context(|| format!("starting {}", executable.display()))?;
        let stderr = child.stderr.take().context("no stderr")?;
        let mut lines = BufReader::new(stderr).lines();
        let url = tokio::time::timeout(Duration::from_secs(30), async {
            while let Some(line) = lines.next_line().await? {
                if let Some(url) = line.strip_prefix("DevTools listening on ") {
                    return Ok(url.trim().to_owned());
                }
            }
            bail!("Chrome exited before opening the DevTools port")
        })
        .await
        .context("timed out waiting for Chrome")??;
        // Keep draining stderr so Chrome never blocks on a full pipe.
        tokio::spawn(async move { while let Ok(Some(_)) = lines.next_line().await {} });
        Ok(Self {
            conn: Conn::connect(&url).await?,
            _child: Some(child),
            _profile: Some(profile),
        })
    }

    /// Connects to a Chrome that is already running elsewhere (another container), given the `host:port`
    /// of its DevTools endpoint. That Chrome's own switches (proxy, sandbox) are set where it runs.
    pub async fn connect(endpoint: &str) -> Result<Self> {
        let addr = tokio::net::lookup_host(endpoint)
            .await
            .with_context(|| format!("resolving {endpoint}"))?
            .next()
            .with_context(|| format!("{endpoint} has no address"))?;
        // Chrome only answers DevTools requests whose Host is an IP address or localhost.
        let version: Value = reqwest::get(format!("http://{addr}/json/version"))
            .await
            .with_context(|| format!("reaching Chrome at {endpoint}"))?
            .error_for_status()?
            .json()
            .await?;
        let ws = version["webSocketDebuggerUrl"]
            .as_str()
            .context("Chrome did not report a DevTools URL")?;
        let path = ws
            .split_once("/devtools/")
            .map(|(_, path)| path)
            .context("unexpected DevTools URL")?;
        Ok(Self {
            conn: Conn::connect(&format!("ws://{addr}/devtools/{path}")).await?,
            _child: None,
            _profile: None,
        })
    }

    /// How many isolated contexts (pages opened with [`page`](Self::page)) are still alive.
    pub async fn open_contexts(&self) -> Result<usize> {
        let r = self
            .conn
            .call(None, "Target.getBrowserContexts", json!({}))
            .await?;
        Ok(r["browserContextIds"].as_array().map_or(0, Vec::len))
    }

    /// Opens a page in its own browser context (no shared cookies or storage), with `init_scripts`
    /// evaluated before any page script on every navigation.
    pub async fn page(&self, init_scripts: &[&str]) -> Result<Page> {
        let context = self
            .conn
            // Disposed if our connection drops (a restarted server, a replaced session), so a remote Chrome
            // never keeps an abandoned page running.
            .call(
                None,
                "Target.createBrowserContext",
                json!({ "disposeOnDetach": true }),
            )
            .await?["browserContextId"]
            .as_str()
            .context("no browserContextId")?
            .to_owned();
        let target = self
            .conn
            .call(
                None,
                "Target.createTarget",
                json!({ "url": "about:blank", "browserContextId": context }),
            )
            .await?["targetId"]
            .as_str()
            .context("no targetId")?
            .to_owned();
        let session = self
            .conn
            .call(
                None,
                "Target.attachToTarget",
                json!({ "targetId": target, "flatten": true }),
            )
            .await?["sessionId"]
            .as_str()
            .context("no sessionId")?
            .to_owned();
        let page = Page {
            conn: self.conn.clone(),
            session,
            context,
        };
        page.send("Page.enable", json!({})).await?;
        for source in init_scripts {
            page.send(
                "Page.addScriptToEvaluateOnNewDocument",
                json!({ "source": source }),
            )
            .await?;
        }
        Ok(page)
    }
}

pub struct Page {
    conn: Conn,
    session: String,
    context: String,
}

impl Page {
    async fn send(&self, method: &str, params: Value) -> Result<Value> {
        self.conn.call(Some(&self.session), method, params).await
    }

    /// Navigates and waits for the `load` event (polled).
    pub async fn goto(&self, url: &str) -> Result<()> {
        let nav = self.send("Page.navigate", json!({ "url": url })).await?;
        if let Some(e) = nav["errorText"].as_str() {
            bail!("navigating to {url}: {e}");
        }
        // Up to 30 s: live sites load slower than the local fixtures.
        for _ in 0..1200 {
            if self.eval("document.readyState").await? == "complete" {
                return Ok(());
            }
            tokio::time::sleep(Duration::from_millis(25)).await;
        }
        bail!("{url} did not finish loading")
    }

    /// Evaluates `expression` (awaiting promises) and returns its JSON value.
    pub async fn eval(&self, expression: &str) -> Result<Value> {
        let r = self
            .send(
                "Runtime.evaluate",
                json!({ "expression": expression, "awaitPromise": true, "returnByValue": true }),
            )
            .await?;
        if let Some(e) = r.get("exceptionDetails") {
            let text = e["exception"]["description"]
                .as_str()
                .or_else(|| e["text"].as_str())
                .unwrap_or("exception");
            bail!("{text}");
        }
        Ok(r["result"]["value"].clone())
    }

    /// Closes the page and its browser context.
    pub async fn close(self) -> Result<()> {
        self.conn
            .call(
                None,
                "Target.disposeBrowserContext",
                json!({ "browserContextId": self.context }),
            )
            .await
            .map(drop)
    }
}

/// `CHROME_PATH`, then the usual install locations and `PATH`.
pub fn find_chrome() -> Option<PathBuf> {
    if let Some(p) = std::env::var_os("CHROME_PATH") {
        return Some(p.into());
    }
    let apps = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    if let Some(p) = apps.iter().map(PathBuf::from).find(|p| p.is_file()) {
        return Some(p);
    }
    let names = [
        "google-chrome",
        "google-chrome-stable",
        "chromium",
        "chromium-browser",
        "chrome",
    ];
    let path = std::env::var_os("PATH")?;
    std::env::split_paths(&path)
        .flat_map(|dir| names.iter().map(move |n| dir.join(n)))
        .find(|p| p.is_file())
}
