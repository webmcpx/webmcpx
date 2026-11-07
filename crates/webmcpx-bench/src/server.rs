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
use axum::extract::{ConnectInfo, Query, State};
use axum::http::HeaderMap;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use serde::Deserialize;
use serde_json::json;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

use crate::scan::{ScanError, Scanner};
use crate::visitors::{Refused, Visitors};

/// What `/api/scan` needs: the scanner, and per-visitor limits when the scanner is public.
#[derive(Clone)]
struct ScanState {
    scanner: Arc<Scanner>,
    visitors: Option<Arc<Visitors>>,
}

pub fn router(root: &Path, scanner: Option<Arc<Scanner>>) -> Router {
    router_with(root, scanner, None)
}

/// Like [`router`], with per-visitor scan limits (the public scanner).
pub fn router_with(
    root: &Path,
    scanner: Option<Arc<Scanner>>,
    visitors: Option<Arc<Visitors>>,
) -> Router {
    let package = root.join("packages/webmcpx");
    let mut app = Router::new()
        .nest_service("/sites", ServeDir::new(root.join("bench/sites")))
        .nest_service("/webmcpx/src", ServeDir::new(package.join("src")))
        .nest_service("/webmcpx/wasm", ServeDir::new(package.join("wasm")))
        .fallback_service(ServeDir::new(root.join("site/build")));
    if let Some(scanner) = scanner {
        app = app.route(
            "/api/scan",
            get(scan).with_state(ScanState { scanner, visitors }),
        );
    }
    app
}

#[derive(Deserialize)]
struct ScanQuery {
    url: String,
}

async fn scan(
    State(state): State<ScanState>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Query(q): Query<ScanQuery>,
) -> Response {
    let _scanning = match &state.visitors {
        None => None,
        Some(visitors) => {
            let forwarded = headers.get("x-forwarded-for").and_then(|v| v.to_str().ok());
            match visitors.start(visitors.address(peer.ip(), forwarded)) {
                Ok(scanning) => Some(scanning),
                Err(refused) => return too_many(&refused),
            }
        }
    };
    match state.scanner.scan(&q.url).await {
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

fn too_many(refused: &Refused) -> Response {
    let (message, wait) = match refused {
        Refused::Busy => ("Your previous scan is still running.".to_owned(), None),
        Refused::TooSoon(wait) => {
            let secs = wait.as_secs() + 1;
            (
                format!("One scan per minute, please. Try again in {secs} s."),
                Some(secs),
            )
        }
    };
    let mut response = (
        StatusCode::TOO_MANY_REQUESTS,
        Json(json!({ "error": message })),
    )
        .into_response();
    if let Some(secs) = wait {
        response
            .headers_mut()
            .insert(axum::http::header::RETRY_AFTER, secs.into());
    }
    response
}

/// Binds `addr` and serves in the background. Returns the bound address (useful with port 0).
pub async fn spawn(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
) -> Result<SocketAddr> {
    spawn_with(root, addr, scanner, None).await
}

/// Like [`spawn`], with per-visitor scan limits (the public scanner).
pub async fn spawn_with(
    root: &Path,
    addr: SocketAddr,
    scanner: Option<Arc<Scanner>>,
    visitors: Option<Arc<Visitors>>,
) -> Result<SocketAddr> {
    let listener = TcpListener::bind(addr)
        .await
        .with_context(|| format!("binding {addr}"))?;
    let bound = listener.local_addr()?;
    let app = router_with(root, scanner, visitors);
    tokio::spawn(async move {
        axum::serve(
            listener,
            app.into_make_service_with_connect_info::<SocketAddr>(),
        )
        .await
    });
    Ok(bound)
}
