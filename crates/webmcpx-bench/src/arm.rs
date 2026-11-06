//! The two conditions under test. Both get the same page, prompt and model; only the tools differ.
//! - `baseline`: a DOM-snapshot browser agent (read the page, click and fill by ref).
//! - `webmcp`: only the tools the page registered with `document.modelContext`.

use std::fmt;

use anyhow::{Context as _, Result};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::cdp::Page;
use crate::model::ToolSpec;

/// Injected into every page before its own scripts, in both arms.
pub const INIT_SCRIPTS: [&str; 2] = [include_str!("js/host.js"), include_str!("js/baseline.js")];

/// Longest tool result handed to the model, in characters; longer results are cut with a note.
/// Applies to both arms. Matches the cap typical browser agents put on page snapshots.
pub const RESULT_MAX_CHARS: usize = 40_000;

#[derive(
    Debug,
    Clone,
    Copy,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    Serialize,
    Deserialize,
    clap::ValueEnum,
)]
#[serde(rename_all = "lowercase")]
pub enum Arm {
    Baseline,
    Webmcp,
}

impl Arm {
    pub const ALL: [Self; 2] = [Self::Baseline, Self::Webmcp];
}

impl fmt::Display for Arm {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(match self {
            Self::Baseline => "baseline",
            Self::Webmcp => "webmcp",
        })
    }
}

/// A page plus the tools one arm may use on it.
pub struct Session<'a> {
    pub arm: Arm,
    pub page: &'a Page,
    pub tools: Vec<ToolSpec>,
}

impl<'a> Session<'a> {
    pub async fn new(arm: Arm, page: &'a Page) -> Result<Self> {
        let tools = match arm {
            Arm::Baseline => baseline_tools(),
            Arm::Webmcp => webmcp_tools(page).await?,
        };
        Ok(Self { arm, page, tools })
    }

    /// Runs one tool call and returns the text the model sees. Never fails: errors become text,
    /// as a real agent harness would report them.
    pub async fn call(&self, name: &str, arguments: &str) -> String {
        let result = match serde_json::from_str::<Value>(if arguments.trim().is_empty() {
            "{}"
        } else {
            arguments
        }) {
            Err(e) => Ok(format!("Error: arguments are not valid JSON: {e}")),
            Ok(args) => self.dispatch(name, &args).await,
        };
        cap(result.unwrap_or_else(|e| format!("Error: {e:#}")))
    }

    async fn dispatch(&self, name: &str, args: &Value) -> Result<String> {
        let expression = match (self.arm, name) {
            (Arm::Baseline, "read_page") => "__bench.snapshot()".to_owned(),
            (Arm::Baseline, "click") => format!("__bench.click({})", args["ref"]),
            (Arm::Baseline, "fill") => {
                format!("__bench.fill({}, {})", args["ref"], args["value"])
            }
            (Arm::Webmcp, _) if self.tools.iter().any(|t| t.name == name) => {
                format!("__webmcpHost.call({}, {args})", json!(name))
            }
            _ => return Ok(format!("Error: unknown tool {name}")),
        };
        let value = self.page.eval(&expression).await?;
        Ok(value.as_str().map_or_else(|| value.to_string(), Into::into))
    }
}

fn cap(mut s: String) -> String {
    if let Some((cut, _)) = s.char_indices().nth(RESULT_MAX_CHARS) {
        s.truncate(cut);
        s.push_str("\n[truncated by the agent harness]");
    }
    s
}

fn baseline_tools() -> Vec<ToolSpec> {
    let reference = json!({ "type": "integer", "description": "The [n] ref from read_page." });
    vec![
        ToolSpec {
            name: "read_page".into(),
            description: "Return the visible text of the current page. Interactive elements are \
                          listed as [n] with their label; use n with click and fill."
                .into(),
            parameters: json!({ "type": "object", "properties": {}, "additionalProperties": false }),
        },
        ToolSpec {
            name: "click".into(),
            description: "Click the interactive element [ref]. Refs change after the page \
                          updates; call read_page again to see the result."
                .into(),
            parameters: json!({
                "type": "object", "properties": { "ref": reference },
                "required": ["ref"], "additionalProperties": false
            }),
        },
        ToolSpec {
            name: "fill".into(),
            description: "Set the value of the input, select or textarea [ref].".into(),
            parameters: json!({
                "type": "object",
                "properties": { "ref": reference, "value": { "type": "string" } },
                "required": ["ref", "value"], "additionalProperties": false
            }),
        },
    ]
}

/// Waits briefly for the page to register its tools, then lists them.
async fn webmcp_tools(page: &Page) -> Result<Vec<ToolSpec>> {
    let mut listed = Value::Null;
    let mut stable = 0;
    for _ in 0..100 {
        let now = page.eval("__webmcpHost.list()").await?;
        // Registration is async; take the list once it is non-empty and unchanged for 100 ms.
        stable = if now == listed && now.as_array().is_some_and(|a| !a.is_empty()) {
            stable + 1
        } else {
            0
        };
        listed = now;
        if stable == 4 {
            break;
        }
        tokio::time::sleep(std::time::Duration::from_millis(25)).await;
    }
    let tools = listed.as_array().context("the page registered no tools")?;
    let mut specs: Vec<ToolSpec> = tools
        .iter()
        .map(|t| ToolSpec {
            name: t["name"].as_str().unwrap_or_default().into(),
            description: t["description"].as_str().unwrap_or_default().into(),
            parameters: t["inputSchema"].clone(),
        })
        .collect();
    anyhow::ensure!(!specs.is_empty(), "the page registered no tools");
    specs.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(specs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cap_cuts_on_char_boundaries() {
        assert_eq!(cap("short".into()), "short");
        let long = "é".repeat(RESULT_MAX_CHARS + 5);
        let capped = cap(long);
        assert!(capped.ends_with("[truncated by the agent harness]"));
        assert_eq!(
            capped.chars().filter(|&c| c == 'é').count(),
            RESULT_MAX_CHARS
        );
    }
}
