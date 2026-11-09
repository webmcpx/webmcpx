//! Finding and linting files.

use std::fs;
use std::path::{Path, PathBuf};

use webmcpx_core::Code;
use webmcpx_lint::{Options, Report, apply_fixes, lint};

use crate::Failure;

const SOURCE_EXTENSIONS: &[&str] = &["js", "mjs", "cjs", "jsx", "ts", "mts", "cts", "tsx"];
const SKIP_DIRS: &[&str] = &["node_modules", "target", "dist", "build"];

pub(crate) struct FileResult {
    /// As shown to the user (forward slashes).
    pub(crate) path: String,
    pub(crate) source: String,
    pub(crate) report: Report,
    pub(crate) fixed: usize,
}

pub(crate) fn lint_paths(
    paths: &[PathBuf],
    options: &Options,
    fix: bool,
) -> Result<Vec<FileResult>, Failure> {
    let mut files = Vec::new();
    let roots: &[PathBuf] = if paths.is_empty() {
        &[PathBuf::from(".")]
    } else {
        paths
    };
    for root in roots {
        if root.is_dir() {
            walk(root, &mut files).map_err(|e| read_failure(root, &e))?;
        } else if root.is_file() {
            files.push(root.clone());
        } else {
            return Err(Failure {
                code: Code::NotFound,
                message: format!("{} does not exist", root.display()),
                hint: "Pass existing files or directories.",
            });
        }
    }
    files.sort();
    files.dedup();

    let mut results = Vec::with_capacity(files.len());
    for path in files {
        let mut source = fs::read_to_string(&path).map_err(|e| read_failure(&path, &e))?;
        // Cheap pre-filter: most files in a project never mention WebMCP.
        let is_json = path.extension().is_some_and(|e| e == "json");
        if !is_json && !source.contains("modelContext") && !source.contains("registerTool") {
            continue;
        }
        let mut report = lint(&path, &source, options);
        let mut fixed = 0;
        if fix && let Some(new_source) = apply_fixes(&source, &report.diagnostics) {
            fixed = report
                .diagnostics
                .iter()
                .filter(|d| d.fix.is_some())
                .count();
            fs::write(&path, &new_source).map_err(|e| read_failure(&path, &e))?;
            source = new_source;
            report = lint(&path, &source, options);
        }
        let shown = path.strip_prefix("./").unwrap_or(&path);
        results.push(FileResult {
            path: shown.to_string_lossy().replace('\\', "/"),
            source,
            report,
            fixed,
        });
    }
    Ok(results)
}

fn walk(dir: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
    for (path, is_dir) in entries(dir)? {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default();
        if is_dir {
            if !name.starts_with('.') && !SKIP_DIRS.contains(&name) {
                walk(&path, files)?;
            }
        } else if is_candidate(name) {
            files.push(path);
        }
    }
    Ok(())
}

/// A directory's entries and whether each is a directory: from the host's listing when it gave one (see
/// [`host_listing`]), else read here.
fn entries(dir: &Path) -> std::io::Result<Vec<(PathBuf, bool)>> {
    if let Some(listed) = host_listing().and_then(|l| l.get(dir.to_string_lossy().as_ref())) {
        return Ok(listed
            .iter()
            .map(|(name, is_dir)| (dir.join(name), *is_dir))
            .collect());
    }
    fs::read_dir(dir)?
        .map(|entry| {
            let path = entry?.path();
            let is_dir = path.is_dir();
            Ok((path, is_dir))
        })
        .collect()
}

type Listing = std::collections::HashMap<String, Vec<(String, bool)>>;

/// Node's WASI can't list a directory on Windows (`fd_readdir` is not implemented there), so `npx webmcpx`
/// (bin/rust.js) lists the directories itself and points `WEBMCPX_TREE` at the listing: a JSON object from
/// each directory, as this walk names it, to its entries (`[name, is_dir]`). Only the WebAssembly build
/// reads it; which files are linted is still decided here.
fn host_listing() -> Option<&'static Listing> {
    static LISTING: std::sync::OnceLock<Option<Listing>> = std::sync::OnceLock::new();
    LISTING
        .get_or_init(|| {
            if !cfg!(target_os = "wasi") {
                return None;
            }
            let path = std::env::var_os("WEBMCPX_TREE")?;
            serde_json::from_str(&fs::read_to_string(path).ok()?).ok()
        })
        .as_ref()
}

/// JS/TS sources, plus JSON files that name themselves as WebMCP manifests.
fn is_candidate(name: &str) -> bool {
    let Some((stem, ext)) = name.rsplit_once('.') else {
        return false;
    };
    SOURCE_EXTENSIONS.contains(&ext) && !name.ends_with(".d.ts")
        || ext == "json" && stem.to_ascii_lowercase().contains("webmcp")
}

fn read_failure(path: &Path, e: &std::io::Error) -> Failure {
    Failure {
        code: Code::Unavailable,
        message: format!("{}: {e}", path.display()),
        hint: "Check the path and file permissions.",
    }
}

#[cfg(test)]
mod tests {
    use super::is_candidate;

    #[test]
    fn picks_sources_and_manifests() {
        for yes in ["app.js", "a.tsx", "webmcp.json", "shop.webmcp.json"] {
            assert!(is_candidate(yes), "{yes}");
        }
        for no in ["package.json", "types.d.ts", "README.md", "Makefile"] {
            assert!(!is_candidate(no), "{no}");
        }
    }
}
