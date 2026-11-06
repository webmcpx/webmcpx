//! Local HTTP server (axum): the benchmark sites, the webmcpx loader they import, and the built landing.
//!
//! - `/sites/<name>/`  → `bench/sites/<name>/`
//! - `/webmcpx/src/*`, `/webmcpx/wasm/*` → the npm package (the code under test, unbundled)
//! - `/`               → `site/build/` (the landing, after `just site-build`)

use std::net::SocketAddr;
use std::path::Path;

use anyhow::{Context as _, Result};
use axum::Router;
use tokio::net::TcpListener;
use tower_http::services::ServeDir;

pub fn router(root: &Path) -> Router {
    let package = root.join("packages/webmcpx");
    Router::new()
        .nest_service("/sites", ServeDir::new(root.join("bench/sites")))
        .nest_service("/webmcpx/src", ServeDir::new(package.join("src")))
        .nest_service("/webmcpx/wasm", ServeDir::new(package.join("wasm")))
        .fallback_service(ServeDir::new(root.join("site/build")))
}

/// Binds `addr` and serves in the background. Returns the bound address (useful with port 0).
pub async fn spawn(root: &Path, addr: SocketAddr) -> Result<SocketAddr> {
    let listener = TcpListener::bind(addr)
        .await
        .with_context(|| format!("binding {addr}"))?;
    let bound = listener.local_addr()?;
    let app = router(root);
    tokio::spawn(async move { axum::serve(listener, app).await });
    Ok(bound)
}
