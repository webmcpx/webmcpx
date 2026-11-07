//! A tiny forward proxy that enforces where the scan browser may connect.
//!
//! Chrome is started with `--proxy-server` pointing here (loopback included), so every request it makes
//! (navigations, redirects, subresources, fetches, web sockets) arrives here first. The proxy resolves
//! the host itself, refuses unless every address is allowed by [`Egress`], and connects to the address it
//! checked, so DNS rebinding cannot swap it afterwards. One request per connection: a reused connection
//! could otherwise carry a request for another host past the check.

use std::net::{IpAddr, SocketAddr};
use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context as _, Result, bail};
use reqwest::Url;
use tokio::io::{AsyncReadExt as _, AsyncWriteExt as _};
use tokio::net::{TcpListener, TcpStream};
use tokio::task::JoinSet;

use crate::scan::is_public;

/// Where the scan browser may connect.
#[derive(Debug, Clone)]
pub enum Egress {
    /// Public internet only: no loopback, private, link-local or reserved addresses.
    Public,
    /// Anywhere (local testing of local sites).
    Any,
    /// Only these exact addresses (tests, closed deployments).
    Only(Vec<SocketAddr>),
}

impl Egress {
    pub fn allows(&self, addr: SocketAddr) -> bool {
        match self {
            Self::Public => is_public(addr.ip()),
            Self::Any => true,
            Self::Only(list) => list
                .iter()
                .any(|a| a.port() == addr.port() && canonical(a.ip()) == canonical(addr.ip())),
        }
    }

    /// Resolves `host:port` and returns the first address, if all of them are allowed.
    pub async fn resolve(&self, host: &str, port: u16) -> Result<SocketAddr> {
        let host = host.trim_start_matches('[').trim_end_matches(']');
        let addrs: Vec<SocketAddr> = tokio::net::lookup_host((host, port))
            .await
            .with_context(|| format!("cannot resolve {host}"))?
            .collect();
        match addrs.first() {
            Some(first) if addrs.iter().all(|a| self.allows(*a)) => Ok(*first),
            Some(_) => bail!("{host} is not a public address"),
            None => bail!("cannot resolve {host}"),
        }
    }
}

fn canonical(ip: IpAddr) -> IpAddr {
    match ip {
        IpAddr::V6(v6) => v6.to_ipv4_mapped().map_or(ip, IpAddr::V4),
        v4 @ IpAddr::V4(_) => v4,
    }
}

/// Longest a proxied connection may live, whatever the peers do.
const MAX_CONNECTION: Duration = Duration::from_secs(60);
/// Most bytes one connection may download: an endless response (a hostile favicon, a stream) is cut here
/// instead of tying up the scan browser until the deadline.
const MAX_DOWNLOAD: u64 = 16 * 1024 * 1024;

/// A running proxy. Dropping it stops the listener and cancels every open connection.
pub struct Proxy {
    pub addr: SocketAddr,
    task: tokio::task::JoinHandle<()>,
}

impl Drop for Proxy {
    fn drop(&mut self) {
        self.task.abort();
    }
}

/// Starts the proxy on a free loopback port.
pub async fn spawn(egress: Egress) -> Result<Proxy> {
    let listener = TcpListener::bind(("127.0.0.1", 0)).await?;
    let addr = listener.local_addr()?;
    let egress = Arc::new(egress);
    let task = tokio::spawn(async move {
        // Connections live in this set: aborting the accept loop drops it, which aborts them all.
        let mut connections = JoinSet::new();
        loop {
            tokio::select! {
                accepted = listener.accept() => {
                    let Ok((client, _)) = accepted else { break };
                    let egress = Arc::clone(&egress);
                    connections.spawn(async move {
                        // A failed or refused connection only affects that request.
                        let _ = tokio::time::timeout(MAX_CONNECTION, handle(client, &egress)).await;
                    });
                }
                Some(_) = connections.join_next(), if !connections.is_empty() => {}
            }
        }
    });
    Ok(Proxy { addr, task })
}

const MAX_HEAD: usize = 32 * 1024;
const FORBIDDEN: &[u8] =
    b"HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";

async fn handle(mut client: TcpStream, egress: &Egress) -> Result<()> {
    let (head, rest) = read_head(&mut client).await?;
    let Some(request) = Request::parse(&head) else {
        client.write_all(FORBIDDEN).await?;
        return Ok(());
    };
    let Ok(addr) = egress.resolve(&request.host, request.port).await else {
        client.write_all(FORBIDDEN).await?;
        return Ok(());
    };
    let upstream = TcpStream::connect(addr).await;
    let Ok(mut upstream) = upstream else {
        client
            .write_all(
                b"HTTP/1.1 502 Bad Gateway\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            )
            .await?;
        return Ok(());
    };
    match request.forward {
        None => {
            client
                .write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n")
                .await?;
        }
        Some(head) => {
            upstream.write_all(head.as_bytes()).await?;
            upstream.write_all(&rest).await?;
        }
    }
    relay(client, upstream).await;
    Ok(())
}

/// Copies both ways until either side is done, then closes both: a silent peer cannot keep the other
/// side (or this task) alive.
async fn relay(client: TcpStream, upstream: TcpStream) {
    let (mut client_rx, mut client_tx) = client.into_split();
    let (upstream_rx, mut upstream_tx) = upstream.into_split();
    let mut capped = upstream_rx.take(MAX_DOWNLOAD);
    tokio::select! {
        _ = tokio::io::copy(&mut client_rx, &mut upstream_tx) => {}
        _ = tokio::io::copy(&mut capped, &mut client_tx) => {}
    }
}

/// Reads up to the end of the request head; returns it and any bytes read past it.
async fn read_head(client: &mut TcpStream) -> Result<(String, Vec<u8>)> {
    let mut buf = Vec::with_capacity(2048);
    let mut chunk = [0u8; 2048];
    loop {
        let n = client.read(&mut chunk).await?;
        if n == 0 {
            bail!("connection closed before the request head");
        }
        buf.extend_from_slice(&chunk[..n]);
        if let Some(end) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
            let rest = buf.split_off(end + 4);
            return Ok((String::from_utf8_lossy(&buf).into_owned(), rest));
        }
        if buf.len() > MAX_HEAD {
            bail!("request head too large");
        }
    }
}

#[derive(Debug, PartialEq)]
struct Request {
    host: String,
    port: u16,
    /// The head to send upstream for plain HTTP; `None` for `CONNECT` tunnels.
    forward: Option<String>,
}

impl Request {
    fn parse(head: &str) -> Option<Self> {
        let mut lines = head.split("\r\n");
        let mut first = lines.next()?.split(' ');
        let (method, target, version) = (first.next()?, first.next()?, first.next()?);
        if method.eq_ignore_ascii_case("CONNECT") {
            let url = Url::parse(&format!("https://{target}")).ok()?;
            return Some(Self {
                host: url.host_str()?.to_owned(),
                port: url.port_or_known_default()?,
                forward: None,
            });
        }
        let url = Url::parse(target).ok()?;
        if url.scheme() != "http" {
            return None;
        }
        let mut path = url.path().to_owned();
        if let Some(query) = url.query() {
            path.push('?');
            path.push_str(query);
        }
        let mut forward = format!("{method} {path} {version}\r\n");
        for line in lines.filter(|l| !l.is_empty()) {
            let name = line.split(':').next().unwrap_or_default().trim();
            // Hop-by-hop headers: the proxy decides the connection, one request per connection.
            if [
                "connection",
                "proxy-connection",
                "keep-alive",
                "proxy-authorization",
            ]
            .iter()
            .any(|h| name.eq_ignore_ascii_case(h))
            {
                continue;
            }
            forward.push_str(line);
            forward.push_str("\r\n");
        }
        forward.push_str("Connection: close\r\n\r\n");
        Some(Self {
            host: url.host_str()?.to_owned(),
            port: url.port_or_known_default()?,
            forward: Some(forward),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_connect_and_plain_http() {
        let c = Request::parse("CONNECT example.com:443 HTTP/1.1\r\nHost: example.com:443\r\n\r\n")
            .unwrap();
        assert_eq!(
            (c.host.as_str(), c.port, c.forward),
            ("example.com", 443, None)
        );

        let g = Request::parse(
            "GET http://a.example:8080/x?y=1 HTTP/1.1\r\nHost: a.example:8080\r\nProxy-Connection: keep-alive\r\nAccept: */*\r\n\r\n",
        )
        .unwrap();
        assert_eq!((g.host.as_str(), g.port), ("a.example", 8080));
        assert_eq!(
            g.forward.unwrap(),
            "GET /x?y=1 HTTP/1.1\r\nHost: a.example:8080\r\nAccept: */*\r\nConnection: close\r\n\r\n"
        );

        let v6 = Request::parse("CONNECT [::1]:443 HTTP/1.1\r\n\r\n").unwrap();
        assert_eq!(v6.host, "[::1]");
        assert!(Request::parse("GET ftp://a.example/ HTTP/1.1\r\n\r\n").is_none());
        assert!(Request::parse("garbage").is_none());
    }

    #[test]
    fn egress_policies() {
        let local: SocketAddr = "127.0.0.1:80".parse().unwrap();
        let public: SocketAddr = "1.1.1.1:443".parse().unwrap();
        assert!(!Egress::Public.allows(local));
        assert!(Egress::Public.allows(public));
        assert!(Egress::Any.allows(local));
        let only = Egress::Only(vec![local]);
        assert!(only.allows(local));
        assert!(only.allows("[::ffff:127.0.0.1]:80".parse().unwrap()));
        assert!(!only.allows("127.0.0.1:81".parse().unwrap()));
    }

    /// The regression the review asked for: a refused destination receives no connection at all.
    #[tokio::test]
    async fn refused_destinations_receive_nothing() {
        let trap = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let trap_addr = trap.local_addr().unwrap();
        let proxy = spawn(Egress::Public).await.unwrap();
        for request in [
            format!("GET http://{trap_addr}/secret HTTP/1.1\r\nHost: {trap_addr}\r\n\r\n"),
            format!("CONNECT {trap_addr} HTTP/1.1\r\n\r\n"),
            format!(
                "GET http://localhost:{}/ HTTP/1.1\r\n\r\n",
                trap_addr.port()
            ),
        ] {
            let mut c = TcpStream::connect(proxy.addr).await.unwrap();
            c.write_all(request.as_bytes()).await.unwrap();
            let mut reply = String::new();
            c.read_to_string(&mut reply).await.unwrap();
            assert!(reply.starts_with("HTTP/1.1 403"), "{reply}");
        }
        let hit = tokio::time::timeout(std::time::Duration::from_millis(200), trap.accept()).await;
        assert!(hit.is_err(), "the trap got a connection");
    }

    /// Chrome hangs up (scan timed out) while the upstream server stays silent: the upstream connection
    /// must close too, not linger in a detached task.
    #[tokio::test]
    async fn a_client_hanging_up_closes_the_upstream() {
        let silent = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let silent_addr = silent.local_addr().unwrap();
        let proxy = spawn(Egress::Only(vec![silent_addr])).await.unwrap();
        let mut c = TcpStream::connect(proxy.addr).await.unwrap();
        c.write_all(format!("GET http://{silent_addr}/ HTTP/1.1\r\nHost: x\r\n\r\n").as_bytes())
            .await
            .unwrap();
        let (mut upstream, _) = silent.accept().await.unwrap();
        let mut head = [0u8; 64];
        let _ = upstream.read(&mut head).await.unwrap();
        drop(c);
        // The proxy closes its side: the silent server sees EOF instead of an open socket.
        let mut rest = Vec::new();
        let closed =
            tokio::time::timeout(Duration::from_secs(2), upstream.read_to_end(&mut rest)).await;
        assert!(
            closed.is_ok(),
            "upstream connection still open after the client left"
        );
    }

    #[tokio::test]
    async fn dropping_the_proxy_cancels_its_connections() {
        let silent = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let silent_addr = silent.local_addr().unwrap();
        let proxy = spawn(Egress::Only(vec![silent_addr])).await.unwrap();
        let mut c = TcpStream::connect(proxy.addr).await.unwrap();
        c.write_all(format!("CONNECT {silent_addr} HTTP/1.1\r\n\r\n").as_bytes())
            .await
            .unwrap();
        let (mut upstream, _) = silent.accept().await.unwrap();
        drop(proxy);
        let mut rest = Vec::new();
        let closed =
            tokio::time::timeout(Duration::from_secs(2), upstream.read_to_end(&mut rest)).await;
        assert!(closed.is_ok(), "connection survived the proxy");
    }

    #[tokio::test]
    async fn an_endless_download_is_cut() {
        let source = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let source_addr = source.local_addr().unwrap();
        tokio::spawn(async move {
            let (mut s, _) = source.accept().await.unwrap();
            let chunk = vec![0u8; 64 * 1024];
            while s.write_all(&chunk).await.is_ok() {}
        });
        let proxy = spawn(Egress::Only(vec![source_addr])).await.unwrap();
        let mut c = TcpStream::connect(proxy.addr).await.unwrap();
        c.write_all(format!("CONNECT {source_addr} HTTP/1.1\r\n\r\n").as_bytes())
            .await
            .unwrap();
        let mut got = Vec::new();
        let read = tokio::time::timeout(Duration::from_secs(10), c.read_to_end(&mut got)).await;
        assert!(read.is_ok(), "the download was not cut");
        let header = b"HTTP/1.1 200 Connection Established\r\n\r\n".len() as u64;
        assert_eq!(got.len() as u64, header + MAX_DOWNLOAD);
    }
}
