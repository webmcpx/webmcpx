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
        let file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)?;
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

    /// Every readable entry, oldest first (a torn or unknown line is skipped).
    pub fn entries(&self) -> Vec<Entry> {
        read(&self.path)
    }

    /// The newest result of each address within `within` of now, with its age: what a restart brings back.
    pub fn recent(&self, within: Duration) -> Vec<(Entry, Duration)> {
        let now = now();
        let mut latest = std::collections::HashMap::new();
        for entry in self.entries() {
            if entry.outcome == Outcome::Fresh && entry.found.is_some() {
                let age = Duration::from_secs(now.saturating_sub(entry.at));
                if age < within {
                    latest.insert(entry.url.clone(), (entry, age));
                }
            }
        }
        latest.into_values().collect()
    }
}

/// The entries of a log file, oldest first; none when it can't be read.
pub fn read(path: &Path) -> Vec<Entry> {
    let Ok(file) = std::fs::File::open(path) else {
        return Vec::new();
    };
    std::io::BufReader::new(file)
        .lines()
        .map_while(Result::ok)
        .filter_map(|line| serde_json::from_str(&line).ok())
        .collect()
}

/// The counts `webmcpx-bench stats` prints: all time, and per UTC day for the last `days`.
pub fn stats(entries: &[Entry], days: u64) -> String {
    use std::collections::{BTreeMap, HashSet};
    use std::fmt::Write as _;
    let count = |list: &[&Entry]| {
        let of = |o: Outcome| list.iter().filter(|e| e.outcome == o).count();
        let sites: HashSet<&str> = list
            .iter()
            .filter_map(|e| e.found.as_ref().map(|f| f.host.as_str()))
            .collect();
        let verdict = |v: Verdict| {
            list.iter()
                .filter(|e| e.outcome == Outcome::Fresh)
                .filter(|e| e.found.as_ref().is_some_and(|f| f.verdict == v))
                .count()
        };
        format!(
            "{} scans ({} fresh, {} cached, {} failed), {} sites; fresh: {} agent-ready, {} almost, {} not agent-ready",
            list.len(),
            of(Outcome::Fresh),
            of(Outcome::Cached),
            of(Outcome::Failed),
            sites.len(),
            verdict(Verdict::Ready),
            verdict(Verdict::Issues),
            verdict(Verdict::Missing),
        )
    };
    let all: Vec<&Entry> = entries.iter().collect();
    let mut out = format!("all time: {}\n", count(&all));
    let today = now() / 86_400;
    let mut by_day: BTreeMap<u64, Vec<&Entry>> = BTreeMap::new();
    for e in entries {
        let day = e.at / 86_400;
        if today.saturating_sub(day) < days {
            by_day.entry(day).or_default().push(e);
        }
    }
    for (day, list) in by_day.iter().rev() {
        let _ = writeln!(out, "{}: {}", crate::scan::civil(*day), count(list));
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
        assert_eq!(ledger.entries().len(), 4);
        let recent = ledger.recent(Duration::from_hours(168));
        assert_eq!(recent.len(), 1);
        assert_eq!(recent[0].0.url, "https://a.example/");
        let stats = stats(&ledger.entries(), 7);
        assert!(
            stats.starts_with("all time: 4 scans (2 fresh, 1 cached, 1 failed), 2 sites;"),
            "{stats}"
        );
        // Nothing about who scanned is written.
        let raw = std::fs::read_to_string(dir.join("scans.jsonl")).unwrap();
        assert!(!raw.contains("ip") && !raw.contains("agent\""), "{raw}");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
