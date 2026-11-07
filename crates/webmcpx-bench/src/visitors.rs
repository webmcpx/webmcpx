//! Per-visitor scan limits for the public scanner: one scan at a time, and one per period. A visitor is
//! an IPv4 address or an IPv6 /64 (one household or server can rotate through a /64). Behind a proxy
//! (production: Cloudflare → nginx), the address comes from `X-Forwarded-For`, which nginx sets to the
//! visitor's `CF-Connecting-IP`.

use std::collections::HashMap;
use std::net::{IpAddr, Ipv6Addr};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// Past this many tracked visitors, those idle for a full period are forgotten.
const PRUNE_AT: usize = 10_000;

pub struct Visitors {
    every: Duration,
    /// Read the visitor from `X-Forwarded-For` (set by our own proxy), not from the TCP peer.
    behind_proxy: bool,
    seen: Mutex<HashMap<IpAddr, Seen>>,
}

struct Seen {
    started: Instant,
    scanning: bool,
}

/// Why a visitor may not scan now.
#[derive(Debug, PartialEq, Eq)]
pub enum Refused {
    /// Their previous scan is still running.
    Busy,
    /// Their last scan started less than a period ago; they may scan again after this long.
    TooSoon(Duration),
}

/// Held while a visitor's scan runs.
pub struct Scanning {
    visitors: Arc<Visitors>,
    key: IpAddr,
}

impl Drop for Scanning {
    fn drop(&mut self) {
        if let Some(seen) = lock(&self.visitors.seen).get_mut(&self.key) {
            seen.scanning = false;
        }
    }
}

impl Visitors {
    pub fn new(every: Duration, behind_proxy: bool) -> Self {
        Self {
            every,
            behind_proxy,
            seen: Mutex::default(),
        }
    }

    /// The visitor's address: the first `X-Forwarded-For` entry behind a proxy, else the TCP peer. Behind a
    /// proxy, a request without a valid header counts as the proxy itself (one shared allowance).
    pub fn address(&self, peer: IpAddr, forwarded_for: Option<&str>) -> IpAddr {
        if !self.behind_proxy {
            return peer;
        }
        forwarded_for
            .and_then(|h| h.split(',').next())
            .and_then(|ip| ip.trim().parse().ok())
            .unwrap_or(peer)
    }

    /// Starts a scan for `ip`, or says why not.
    pub fn start(self: &Arc<Self>, ip: IpAddr) -> Result<Scanning, Refused> {
        let key = visitor(ip);
        let mut seen = lock(&self.seen);
        if seen.len() >= PRUNE_AT {
            seen.retain(|_, s| s.scanning || s.started.elapsed() < self.every);
        }
        if let Some(s) = seen.get(&key) {
            if s.scanning {
                return Err(Refused::Busy);
            }
            let since = s.started.elapsed();
            if since < self.every {
                return Err(Refused::TooSoon(self.every.saturating_sub(since)));
            }
        }
        seen.insert(
            key,
            Seen {
                started: Instant::now(),
                scanning: true,
            },
        );
        Ok(Scanning {
            visitors: Arc::clone(self),
            key,
        })
    }
}

/// Whom a scan counts against: an IPv4 address, or the /64 of an IPv6 address (IPv4-mapped IPv6 is IPv4).
pub fn visitor(ip: IpAddr) -> IpAddr {
    match ip {
        IpAddr::V4(_) => ip,
        IpAddr::V6(v6) => v6.to_ipv4_mapped().map_or_else(
            || {
                let s = v6.segments();
                IpAddr::V6(Ipv6Addr::new(s[0], s[1], s[2], s[3], 0, 0, 0, 0))
            },
            IpAddr::V4,
        ),
    }
}

fn lock<T>(m: &Mutex<T>) -> std::sync::MutexGuard<'_, T> {
    // No code panics while holding this lock; recover the data if one ever does.
    m.lock().unwrap_or_else(std::sync::PoisonError::into_inner)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ip(s: &str) -> IpAddr {
        s.parse().unwrap()
    }

    #[test]
    fn an_ipv6_visitor_is_their_slash_64_in_any_notation() {
        let net = ip("2600:0:0:1::");
        for same in [
            "2600::1:2:3:4:5",
            "2600:0:0:1::1",
            "2600:0000:0000:0001:ffff::",
            "2600:0:0:1:a:b:c:d",
        ] {
            assert_eq!(visitor(ip(same)), net, "{same}");
        }
        assert_eq!(visitor(ip("2600::2:2:3:4:5")), ip("2600:0:0:2::"));
        assert_eq!(visitor(ip("2600:1234::1")), visitor(ip("2600:1234::2")));
        assert_ne!(visitor(ip("2600:1234::1")), visitor(ip("2600:1235::1")));
        assert_eq!(visitor(ip("203.0.113.7")), ip("203.0.113.7"));
        assert_eq!(visitor(ip("::ffff:203.0.113.7")), ip("203.0.113.7"));
    }

    #[test]
    fn one_scan_at_a_time_and_one_per_period() {
        let v = Arc::new(Visitors::new(Duration::from_millis(200), false));
        let me = ip("2600::1:2:3:4:5");
        let scanning = v.start(me).unwrap();
        // Same /64, another address: still the same visitor.
        assert_eq!(v.start(ip("2600:0:0:1::9")).err(), Some(Refused::Busy));
        assert!(
            v.start(ip("2600:0:0:2::1")).is_ok(),
            "another /64 is another visitor"
        );
        drop(scanning);
        assert!(matches!(v.start(me), Err(Refused::TooSoon(_))));
        std::thread::sleep(Duration::from_millis(250));
        assert!(v.start(me).is_ok());
    }

    #[test]
    fn behind_a_proxy_the_visitor_is_the_forwarded_address() {
        let proxy = ip("172.18.0.3");
        let direct = Visitors::new(Duration::from_secs(60), false);
        assert_eq!(
            direct.address(proxy, Some("203.0.113.7")),
            proxy,
            "a header from a stranger is ignored"
        );
        let behind = Visitors::new(Duration::from_secs(60), true);
        assert_eq!(
            behind.address(proxy, Some("203.0.113.7, 10.0.0.1")),
            ip("203.0.113.7")
        );
        assert_eq!(behind.address(proxy, Some("not an ip")), proxy);
        assert_eq!(behind.address(proxy, None), proxy);
    }
}
