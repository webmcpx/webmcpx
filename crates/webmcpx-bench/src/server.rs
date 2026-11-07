//! Local HTTP server (axum): the benchmark sites, the webmcpx loader they import, the built landing and
//! the scan API.
//!
//! - `/sites/<name>/`  → `bench/sites/<name>/`
//! - `/webmcpx/src/*`, `/webmcpx/wasm/*` → the npm package (the code under test, unbundled)
//! - `/api/scan?url=`  → [`scan::Report`] as JSON (when a scanner is given)
//! - `/`               → `site/build/` (the landing, after `just site`)

use std::net::SocketAddr;
use std::path::Path;
use std::sync::Arc;

use anyhow::{Context as _, Result};
use axum::Json;
use axum::Router;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use serde::Deserialize;
use serde_json::json;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

use crate::scan::{ScanError, Scanner};

pub fn router(root: &Path, scanner: Option<Arc<Scanner>>) -> Router {
    let package = root.join("packages/webmcpx");
    let mut app = Router::new()
        .nest_service("/sites", ServeDir::new(root.join("bench/sites")))
        .nest_service("/webmcpx/src", ServeDir::new(package.join("src")))
        .nest_service("/webmcpx/wasm", ServeDir::new(package.join("wasm")))
        .fallback_service(ServeDir::new(root.join("site/build")));
    if let Some(scanner) = scanner {
        app = app.route("/api/scan", get(scan).with_state(scanner));
    }
    app
}

#[derive(Deserialize)]
struct ScanQuery {
    url: String,
}

async fn scan(State(scanner): State<Arc<Scanner>>, Query(q): Query<ScanQuery>) -> Response {
    match scanner.scan(&q.url).await {
        Ok(report) => Json(report).into_response(),
        Err(e) => {
            let (status, message) = match e {
                ScanError::BadUrl(m) => (StatusCode::BAD_REQUEST, m),
                ScanError::Busy => (
                    StatusCode::TOO_MANY_REQUESTS,
                    "Too many scans right now. Try again in a minute.".to_owned(),
                ),
                ScanError::TimedOut => (
                    StatusCode::GATEWAY_TIMEOUT,
                    "The page took too long to load.".to_owned(),
                ),
                ScanError::Failed(m) => (StatusCode::UNPROCESSABLE_ENTITY, m),
            };
            (status, Json(json!({ "error": message }))).into_response()
        }
    }
}

/// Binds `addr` and serves in the background. Returns the bound address (useful with port 0).
pub async fn spawn(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
) -> Result<SocketAddr> {
    let listener = TcpListener::bind(addr)
        .await
        .with_context(|| format!("binding {addr}"))?;
    let bound = listener.local_addr()?;
    let app = router(root, scanner);
    tokio::spawn(async move { axum::serve(listener, app).await });
    Ok(bound)
}
