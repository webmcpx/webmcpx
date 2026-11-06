//! Benchmark tasks: one TOML file per task in `bench/tasks/`, graded deterministically (no LLM judge).

use std::path::Path;

use anyhow::{Context as _, Result, ensure};
use serde::Deserialize;

#[derive(Debug, Clone, PartialEq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Task {
    /// File stem; set by `load_dir`.
    #[serde(skip)]
    pub id: String,
    /// Directory under `bench/sites/`.
    pub site: String,
    /// What the user asks the agent.
    pub prompt: String,
    #[serde(default = "default_max_steps")]
    pub max_steps: u32,
    pub check: Check,
}

const fn default_max_steps() -> u32 {
    12
}

/// Success criteria. Every given criterion must hold.
#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Check {
    /// Each string must appear in the final answer as a whole term: case-insensitive,
    /// whitespace-normalized, and not inside a longer word or number (`10` does not match `100`).
    #[serde(default)]
    pub answer_contains: Vec<String>,
    /// None of these may appear in the final answer (catches hedged "X or Y" answers).
    #[serde(default)]
    pub answer_excludes: Vec<String>,
    /// A JavaScript expression evaluated on the page after the run; it must be truthy.
    pub state: Option<String>,
}

impl Task {
    pub fn url(&self, base: &str) -> String {
        format!("{base}/sites/{}/", self.site)
    }
}

impl Check {
    /// Grades the answer part of the check; the `state` part needs the page.
    pub fn answer_passes(&self, answer: &str) -> bool {
        let answer = normalize(answer);
        self.answer_contains
            .iter()
            .all(|s| has_term(&answer, &normalize(s)))
            && !self
                .answer_excludes
                .iter()
                .any(|s| has_term(&answer, &normalize(s)))
    }
}

/// Whether `term` occurs in `text` with no word character glued to its word-character edges.
fn has_term(text: &str, term: &str) -> bool {
    let word = |c: char| c.is_alphanumeric() || c == '_';
    let glued_start = term.starts_with(word);
    let glued_end = term.ends_with(word);
    text.match_indices(term).any(|(at, _)| {
        !(glued_start && text[..at].ends_with(word))
            && !(glued_end && text[at + term.len()..].starts_with(word))
    })
}

fn normalize(s: &str) -> String {
    s.split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

/// Loads every `*.toml` in `dir`, sorted by id.
pub fn load_dir(dir: &Path) -> Result<Vec<Task>> {
    let mut tasks = Vec::new();
    for entry in std::fs::read_dir(dir).with_context(|| format!("reading {}", dir.display()))? {
        let path = entry?.path();
        if path.extension().is_some_and(|e| e == "toml") {
            tasks.push(load(&path)?);
        }
    }
    tasks.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(tasks)
}

fn load(path: &Path) -> Result<Task> {
    let text = std::fs::read_to_string(path)?;
    let mut task: Task = toml::from_str(&text).with_context(|| format!("{}", path.display()))?;
    path.file_stem()
        .and_then(|s| s.to_str())
        .context("task file name is not UTF-8")?
        .clone_into(&mut task.id);
    let c = &task.check;
    ensure!(
        !c.answer_contains.is_empty() || c.state.is_some(),
        "{}: [check] needs answer_contains or state",
        path.display()
    );
    Ok(task)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn check(contains: &[&str], excludes: &[&str]) -> Check {
        Check {
            answer_contains: contains.iter().map(|s| (*s).into()).collect(),
            answer_excludes: excludes.iter().map(|s| (*s).into()).collect(),
            state: None,
        }
    }

    #[test]
    fn answers_match_case_and_whitespace_insensitively() {
        let c = check(&["90 seconds", "--timeout"], &[]);
        assert!(c.answer_passes("The default is 90\nSeconds; change it with `--TIMEOUT`."));
        assert!(!c.answer_passes("90 seconds"));
    }

    #[test]
    fn numbers_match_whole_values_only() {
        assert!(!check(&["10"], &[]).answer_passes("It keeps 100 past releases."));
        assert!(!check(&["90", "--timeout"], &[]).answer_passes("190 seconds; use --timeout"));
        assert!(!check(&["106"], &[]).answer_passes("The total is $1060.00."));
        assert!(check(&["106"], &[]).answer_passes("The total is $106.00."));
        assert!(check(&["10"], &[]).answer_passes("10 releases (deploy.retain_releases)."));
        assert!(!check(&["ORBIT_CONFIG"], &[]).answer_passes("ORBIT_CONFIGURE"));
    }

    #[test]
    fn excludes_reject_hedged_answers() {
        let c = check(&["ORBIT_CONFIG"], &["ORBIT_HOME"]);
        assert!(c.answer_passes("Set ORBIT_CONFIG."));
        assert!(!c.answer_passes("ORBIT_CONFIG or maybe ORBIT_HOME"));
    }

    #[test]
    fn every_bundled_task_loads() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../bench/tasks");
        let tasks = load_dir(&dir).unwrap();
        assert!(tasks.len() >= 4, "found {}", tasks.len());
        let sites = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../bench/sites");
        for t in &tasks {
            assert!(
                sites.join(&t.site).join("index.html").is_file(),
                "{}: unknown site {}",
                t.id,
                t.site
            );
        }
    }

    #[test]
    fn rejects_tasks_without_a_check() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::write(
            dir.path().join("t.toml"),
            "site = \"docs\"\nprompt = \"hi\"\n[check]\n",
        )
        .unwrap();
        let err = load_dir(dir.path()).unwrap_err().to_string();
        assert!(err.contains("needs answer_contains or state"), "{err}");
    }
}
