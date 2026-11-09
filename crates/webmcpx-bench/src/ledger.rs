//! The scan log: one JSON line per public scan, in `<data dir>/scans.jsonl`.
//!
//! It records what was scanned and what the scan found, never who asked: no address, no user agent, no
//! language. Two uses: counting scans (`webmcpx-bench stats`), and bringing back the week of results that
//! share cards, link previews and badges show after a restart (a deploy).

use std::io::{BufRead, Write};
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use crate::scan::Verdict;

/// One line of the log.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entry {
    /// Seconds since the Unix epoch.
    pub at: u64,
    /// The scanned address, normalized (the scanner's cache key).
    pub url: String,
    /// `fresh` (a new scan), `cached` (a recent report reused) or `failed`.
    pub outcome: Outcome,
    /// What the scan found (absent for a failed scan).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub found: Option<Found>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Outcome {
    Fresh,
    Cached,
    Failed,
}

/// A scan's result, as its share card shows it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Found {
    pub host: String,
    /// Hosts this result answers for: the address scanned and where it ended up (without `www.`).
    pub hosts: Vec<String>,
    pub verdict: Verdict,
    pub tools: usize,
    pub page_tokens: usize,
    pub score: u8,
    pub lint_errors: bool,
    pub scanned_on: String,
}

/// The open log: appends are serialized, each one a whole line.
pub struct Ledger {
    path: PathBuf,
    file: std::sync::Mutex<std::fs::File>,
}

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |d| d.as_secs())
}

impl Ledger {
    /// Opens (or creates) `<dir>/scans.jsonl`.
    pub fn open(dir: &Path) -> std::io::Result<Self> {
        std::fs::create_dir_all(dir)?;
        let path = dir.join("scans.jsonl");
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .read(true)
            .open(&path)?;
        // A crash mid-write leaves a torn last line: end it, so the next entry starts a line of its own.
        let len = file.metadata()?.len();
        if len > 0 {
            use std::io::{Read, Seek, SeekFrom};
            let mut last = [0u8];
            file.seek(SeekFrom::Start(len - 1))?;
            file.read_exact(&mut last)?;
            if last[0] != b'\n' {
                file.write_all(b"\n")?;
            }
        }
        Ok(Self {
            path,
            file: std::sync::Mutex::new(file),
        })
    }

    /// Appends one entry. A failed write is reported on stderr and never fails the scan.
    #[expect(
        clippy::print_stderr,
        reason = "the server's log is its stderr; a lost log line must not fail a scan"
    )]
    pub fn append(&self, entry: &Entry) {
        let Ok(mut line) = serde_json::to_string(entry) else {
            return;
        };
        line.push('\n');
        let mut file = self
            .file
            .lock()
            .unwrap_or_else(std::sync::PoisonError::into_inner);
        if let Err(e) = file.write_all(line.as_bytes()) {
            eprintln!("scan log: {e}");
        }
    }

    /// Every readable entry, oldest first (tests).
    #[cfg(test)]
    fn entries(&self) -> Vec<Entry> {
        let mut all = Vec::new();
        each(&self.path, |e| all.push(e));
        all
    }

    /// Calls `f` with each fresh result from within `within` of now and its age, in the order the scans
    /// ran: replayed into the scanner's bounded maps, a later result of an address (or host) replaces an
    /// earlier one. Streamed: one line in memory at a time, however long the log.
    pub fn replay(&self, within: Duration, mut f: impl FnMut(Entry, Duration)) {
        let now = now();
        each(&self.path, |entry| {
            let age = Duration::from_secs(now.saturating_sub(entry.at));
            if entry.outcome == Outcome::Fresh && entry.found.is_some() && age < within {
                f(entry, age);
            }
        });
    }
}

/// Calls `f` with each readable entry of a log file, oldest first, one line in memory at a time (a torn or
/// unknown line is skipped; a missing file has none).
pub fn each(path: &Path, mut f: impl FnMut(Entry)) {
    let Ok(file) = std::fs::File::open(path) else {
        return;
    };
    for line in std::io::BufReader::new(file).lines().map_while(Result::ok) {
        if let Ok(entry) = serde_json::from_str(&line) {
            f(entry);
        }
    }
}

/// Counts for one span of the log.
#[derive(Default)]
struct Tally {
    scans: usize,
    fresh: usize,
    cached: usize,
    failed: usize,
    sites: std::collections::HashSet<String>,
    ready: usize,
    almost: usize,
    missing: usize,
}

impl Tally {
    fn add(&mut self, e: &Entry) {
        self.scans += 1;
        match e.outcome {
            Outcome::Fresh => self.fresh += 1,
            Outcome::Cached => self.cached += 1,
            Outcome::Failed => self.failed += 1,
        }
        if let Some(found) = &e.found {
            if !self.sites.contains(&found.host) {
                self.sites.insert(found.host.clone());
            }
            if e.outcome == Outcome::Fresh {
                match found.verdict {
                    Verdict::Ready => self.ready += 1,
                    Verdict::Issues => self.almost += 1,
                    Verdict::Missing => self.missing += 1,
                }
            }
        }
    }
}

impl std::fmt::Display for Tally {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{} scans ({} fresh, {} cached, {} failed), {} sites; fresh: {} agent-ready, {} almost, {} not agent-ready",
            self.scans,
            self.fresh,
            self.cached,
            self.failed,
            self.sites.len(),
            self.ready,
            self.almost,
            self.missing
        )
    }
}

/// What `webmcpx-bench stats` prints for the log at `path`: all time, and per UTC day for the last `days`.
/// Streamed: memory grows with the number of sites, not of scans.
pub fn stats(path: &Path, days: u64) -> String {
    use std::fmt::Write as _;
    let today = now() / 86_400;
    let mut all = Tally::default();
    let mut by_day: std::collections::BTreeMap<u64, Tally> = std::collections::BTreeMap::new();
    each(path, |e| {
        all.add(&e);
        let day = e.at / 86_400;
        if today.saturating_sub(day) < days {
            by_day.entry(day).or_default().add(&e);
        }
    });
    let mut out = format!("all time: {all}\n");
    for (day, tally) in by_day.iter().rev() {
        let _ = writeln!(out, "{}: {tally}", crate::scan::civil(*day));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn found(host: &str) -> Found {
        Found {
            host: host.to_owned(),
            hosts: vec![host.to_owned()],
            verdict: Verdict::Missing,
            tools: 0,
            page_tokens: 300,
            score: 25,
            lint_errors: false,
            scanned_on: "2026-11-09".to_owned(),
        }
    }

    #[test]
    fn the_log_survives_a_restart_and_counts_scans() {
        let dir = std::env::temp_dir().join(format!("webmcpx-ledger-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let at = now();
        {
            let ledger = Ledger::open(&dir).unwrap();
            for (url, outcome, f, age) in [
                (
                    "https://a.example/",
                    Outcome::Fresh,
                    Some(found("a.example")),
                    60,
                ),
                (
                    "https://a.example/",
                    Outcome::Cached,
                    Some(found("a.example")),
                    30,
                ),
                ("https://b.example/", Outcome::Failed, None, 20),
                // Older than a week: counted, not brought back.
                (
                    "https://c.example/",
                    Outcome::Fresh,
                    Some(found("c.example")),
                    8 * 86_400,
                ),
            ] {
                ledger.append(&Entry {
                    at: at - age,
                    url: url.to_owned(),
                    outcome,
                    found: f,
                });
            }
        }
        // A torn last line (a crash mid-write) is skipped.
        std::fs::OpenOptions::new()
            .append(true)
            .open(dir.join("scans.jsonl"))
            .unwrap()
            .write_all(b"{\"at\":1,")
            .unwrap();
        let ledger = Ledger::open(&dir).unwrap();
        // The next entry after a torn line is kept whole.
        ledger.append(&Entry {
            at,
            url: "https://d.example/".to_owned(),
            outcome: Outcome::Failed,
            found: None,
        });
        assert_eq!(ledger.entries().len(), 5);
        assert_eq!(ledger.entries()[4].url, "https://d.example/");
        let mut recent = Vec::new();
        ledger.replay(Duration::from_hours(168), |e, _| recent.push(e.url));
        assert_eq!(recent, ["https://a.example/"]);
        let stats = stats(&dir.join("scans.jsonl"), 7);
        assert!(
            stats.starts_with("all time: 5 scans (2 fresh, 1 cached, 2 failed), 2 sites;"),
            "{stats}"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// Two pages of one site: a restart brings both back in the order they ran, so the site's badge shows
    /// the latest verdict, whatever the hash order.
    #[test]
    fn a_restart_replays_scans_in_order() {
        let dir = std::env::temp_dir().join(format!("webmcpx-ledger-order-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let ledger = Ledger::open(&dir).unwrap();
        let at = now();
        for i in 0..20 {
            ledger.append(&Entry {
                at: at - 100 + i,
                url: format!("https://a.example/{i}"),
                outcome: Outcome::Fresh,
                found: Some(found("a.example")),
            });
        }
        let mut urls = Vec::new();
        ledger.replay(Duration::from_hours(1), |e, _| urls.push(e.url));
        let expected: Vec<String> = (0..20).map(|i| format!("https://a.example/{i}")).collect();
        assert_eq!(urls, expected);
        // Nothing about who scanned is written.
        let raw = std::fs::read_to_string(dir.join("scans.jsonl")).unwrap();
        assert!(!raw.contains("ip") && !raw.contains("agent\""), "{raw}");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
