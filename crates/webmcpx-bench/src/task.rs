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
    /// A fixture: directory under `bench/sites/`. Exactly one of `site` and `url` is set.
    pub site: Option<String>,
    /// A live page on the public web that registers WebMCP tools itself.
    pub url: Option<String>,
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
    /// At least one of these must appear (same matching), for facts with several correct wordings.
    #[serde(default)]
    pub answer_any: Vec<String>,
    /// None of these may appear in the final answer (catches hedged "X or Y" answers).
    #[serde(default)]
    pub answer_excludes: Vec<String>,
    /// A JavaScript expression evaluated on the page after the run; it must be truthy.
    pub state: Option<String>,
}

impl Task {
    /// The page to open: the live `url`, or the fixture served from `base`.
    pub fn page_url(&self, base: &str) -> String {
        match (&self.url, &self.site) {
            (Some(url), _) => url.clone(),
            (None, site) => format!("{base}/sites/{}/", site.as_deref().unwrap_or_default()),
        }
    }

    /// Where the task runs, for listings: the fixture name or the live URL.
    /// Where the task runs and what it asks, for readers of the results (the landing page).
    pub fn info(&self) -> serde_json::Value {
        let mut info = serde_json::json!({ "prompt": self.prompt });
        if let Some(site) = &self.site {
            info["site"] = site.as_str().into();
        }
        if let Some(url) = &self.url {
            info["url"] = url.as_str().into();
        }
        info
    }

    pub fn place(&self) -> &str {
        self.url
            .as_deref()
            .or(self.site.as_deref())
            .unwrap_or_default()
    }
}

/// `{id: info}` for every task, sorted by id (deterministic output).
pub fn index(tasks: &[Task]) -> std::collections::BTreeMap<&str, serde_json::Value> {
    tasks.iter().map(|t| (t.id.as_str(), t.info())).collect()
}

impl Check {
    pub fn has_answer_check(&self) -> bool {
        !self.answer_contains.is_empty()
            || !self.answer_any.is_empty()
            || !self.answer_excludes.is_empty()
    }

    /// Grades the answer part of the check; the `state` part needs the page.
    pub fn answer_passes(&self, answer: &str) -> bool {
        let answer = normalize(answer);
        self.answer_contains
            .iter()
            .all(|s| has_term(&answer, &normalize(s)))
            && (self.answer_any.is_empty()
                || self
                    .answer_any
                    .iter()
                    .any(|s| has_term(&answer, &normalize(s))))
            && !self
                .answer_excludes
                .iter()
                .any(|s| has_term(&answer, &normalize(s)))
    }
}

/// Whether `term` occurs in `text`. A numeric term must equal a number in the text by value
/// (`106` matches `$106.00`, not `$106.99` or `1,060`); any other term must not be glued to a word.
fn has_term(text: &str, term: &str) -> bool {
    if let Ok(expected) = term.parse::<f64>() {
        return numbers(text).any(|n| (n - expected).abs() < 1e-9);
    }
    let word = |c: char| c.is_alphanumeric() || c == '_';
    let glued_start = term.starts_with(word);
    let glued_end = term.ends_with(word);
    text.match_indices(term).any(|(at, _)| {
        let joined_before = glued_start && text[..at].ends_with(word);
        let joined_after = glued_end && text[at + term.len()..].starts_with(word);
        !joined_before && !joined_after
    })
}

fn normalize(s: &str) -> String {
    s.split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

/// Numbers in `text`: digits with `,` thousands separators and an optional decimal part.
fn numbers(text: &str) -> impl Iterator<Item = f64> + '_ {
    let bytes = text.as_bytes();
    let digit_at = |i: usize| bytes.get(i).is_some_and(u8::is_ascii_digit);
    let mut i = 0;
    std::iter::from_fn(move || {
        while i < bytes.len() && !(digit_at(i) && (i == 0 || !bytes[i - 1].is_ascii_alphanumeric()))
        {
            i += 1;
        }
        if i == bytes.len() {
            return None;
        }
        let mut value = String::new();
        while digit_at(i) || (bytes.get(i) == Some(&b',') && digit_at(i + 1)) {
            if bytes[i] != b',' {
                value.push(char::from(bytes[i]));
            }
            i += 1;
        }
        if bytes.get(i) == Some(&b'.') && digit_at(i + 1) {
            value.push('.');
            i += 1;
            while digit_at(i) {
                value.push(char::from(bytes[i]));
                i += 1;
            }
        }
        value.parse().ok()
    })
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
    ensure!(
        task.site.is_some() != task.url.is_some(),
        "{}: set exactly one of `site` and `url`",
        path.display()
    );
    let c = &task.check;
    ensure!(
        c.has_answer_check() || c.state.is_some(),
        "{}: [check] needs answer_contains, answer_any or state",
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
            ..Check::default()
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
        assert!(!check(&["106"], &[]).answer_passes("The total is $106.99."));
        assert!(!check(&["106"], &[]).answer_passes("The total is $1,060."));
        assert!(check(&["1060"], &[]).answer_passes("The total is $1,060."));
        // Answers that end in a number, with nothing after it.
        assert!(check(&["10"], &[]).answer_passes("10"));
        assert!(check(&["106"], &[]).answer_passes("The cart total is $106"));
        assert!(check(&["1060"], &[]).answer_passes("Total: 1,060"));
        assert!(check(&["106"], &[]).answer_passes("Total: 106, shipping included"));
        assert!(check(&["10"], &[]).answer_passes("10 releases (deploy.retain_releases)."));
        assert!(!check(&["ORBIT_CONFIG"], &[]).answer_passes("ORBIT_CONFIGURE"));
    }

    #[test]
    fn number_scan_never_panics_on_any_prefix() {
        let text = "a1,2.3,4.,5 x9 $106.00, 1,060.5. 7";
        for end in (0..=text.len()).filter(|&e| text.is_char_boundary(e)) {
            let _ = numbers(&text[..end]).count();
        }
        assert_eq!(numbers("$1,060.5 and 7").collect::<Vec<_>>(), [1060.5, 7.0]);
    }

    #[test]
    fn any_accepts_each_correct_wording() {
        let c = Check {
            answer_any: vec!["quota".into(), "build minutes".into()],
            ..Check::default()
        };
        assert!(c.answer_passes("Your quota is exceeded."));
        assert!(c.answer_passes("Your build minutes are used up."));
        assert!(!c.answer_passes("The deploy timed out."));
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
            if let Some(site) = &t.site {
                let page = sites.join(site).join("index.html");
                assert!(page.is_file(), "{}: unknown site {site}", t.id);
            }
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
        assert!(
            err.contains("needs answer_contains, answer_any or state"),
            "{err}"
        );
    }

    #[test]
    fn index_exports_where_each_task_runs() {
        let tasks = load_dir(&crate::repo_root().join("bench/tasks")).unwrap();
        let index = index(&tasks);
        assert_eq!(index.len(), tasks.len());
        let notion = &index["live-notion-request-limit"];
        assert!(
            notion["url"]
                .as_str()
                .unwrap()
                .starts_with("https://developers.notion.com/")
        );
        assert!(notion.get("site").is_none());
        assert_eq!(index["docs-deploy-timeout"]["site"], "docs");
        assert!(
            index
                .values()
                .all(|i| i["prompt"].as_str().is_some_and(|p| !p.is_empty()))
        );
    }

    #[test]
    fn allbirds_exchange_check_needs_the_restriction() {
        let tasks = load_dir(&crate::repo_root().join("bench/tasks")).unwrap();
        let check = &tasks
            .iter()
            .find(|t| t.id == "live-allbirds-exchange-country")
            .unwrap()
            .check;
        for ok in [
            "No. Allbirds only allows exchanges in the country where the item was purchased.",
            "No, exchanges must be made in the same country.",
            "Returns/exchanges can only be done in the country of purchase.",
        ] {
            assert!(check.answer_passes(ok), "{ok}");
        }
        for wrong in [
            "Yes, an item bought in the US can be exchanged in any country, including London.",
            "Probably not; US purchases go through the US returns process.",
        ] {
            assert!(!check.answer_passes(wrong), "{wrong}");
        }
    }

    #[test]
    fn notion_upload_check_accepts_both_units() {
        let tasks = load_dir(&crate::repo_root().join("bench/tasks")).unwrap();
        let check = &tasks
            .iter()
            .find(|t| t.id == "live-notion-upload-size")
            .unwrap()
            .check;
        assert!(check.answer_passes("The limit is **20 MiB**."));
        assert!(check.answer_passes("Files up to 20 MB."));
        assert!(!check.answer_passes("Files up to 5 GiB."));
    }

    #[test]
    fn woo_stock_check_allows_the_price() {
        let tasks = load_dir(&crate::repo_root().join("bench/tasks")).unwrap();
        let check = &tasks
            .iter()
            .find(|t| t.id == "live-woo-notebook-stock")
            .unwrap()
            .check;
        // The notebook costs $24: naming the price is right, not the mug's stock of 24.
        assert!(check.answer_passes(
            "There are **3 Agent Notebooks left in stock**, priced at **$24 each**."
        ));
        assert!(check.answer_passes("3 left."));
        for wrong in [
            "There are 24 left in stock.",
            "Only 15 in stock.",
            "24 units remain.",
        ] {
            assert!(!check.answer_passes(wrong), "{wrong}");
        }
    }
}
