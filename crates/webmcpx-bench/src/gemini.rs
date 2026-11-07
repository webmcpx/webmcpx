//! Google Gemini Interactions API (`/v1beta/interactions`) client, stateless (`store: false`).
//!
//! `thinking_level` sets the depth of thinking, the counterpart of OpenAI's `reasoning.effort`. The
//! model's steps (thoughts with their signatures, function calls, output) are sent back verbatim on
//! the next turn, followed by the function results. Implicit caching is automatic.

use std::time::Duration;

use anyhow::{Context as _, Result, bail};
use serde_json::{Value, json};

use crate::model::{Message, Model, Reply, ToolCall, ToolSpec, Usage, post_json};

pub struct Gemini {
    http: reqwest::Client,
    base_url: String,
    api_key: String,
    model: String,
    thinking_level: Option<String>,
}

impl Gemini {
    /// Reads `GEMINI_API_KEY` and, if set, `GEMINI_BASE_URL`.
    pub fn from_env(model: String, thinking_level: Option<String>) -> Result<Self> {
        let api_key = std::env::var("GEMINI_API_KEY")
            .context("set GEMINI_API_KEY (an API key from Google AI Studio)")?;
        let base_url = std::env::var("GEMINI_BASE_URL")
            .unwrap_or_else(|_| "https://generativelanguage.googleapis.com/v1beta".into());
        Ok(Self {
            http: reqwest::Client::builder()
                .timeout(Duration::from_secs(300))
                .build()?,
            base_url: base_url.trim_end_matches('/').into(),
            api_key,
            model,
            thinking_level,
        })
    }
}

fn text(t: &str) -> Value {
    json!([{ "type": "text", "text": t }])
}

/// The request body. Deterministic for a given input (tested by snapshot).
pub fn request_body(
    model: &str,
    thinking_level: Option<&str>,
    messages: &[Message],
    tools: &[ToolSpec],
) -> Value {
    let mut system = Vec::new();
    let mut steps: Vec<Value> = Vec::new();
    for m in messages {
        match m {
            Message::System { content } => system.push(content.as_str()),
            Message::User { content } => {
                steps.push(json!({ "type": "user_input", "content": text(content) }));
            }
            Message::Assistant { raw, .. } if !raw.is_empty() => steps.extend(raw.iter().cloned()),
            Message::Assistant {
                content,
                tool_calls,
                ..
            } => {
                if let Some(t) = content {
                    steps.push(json!({ "type": "model_output", "content": text(t) }));
                }
                steps.extend(tool_calls.iter().map(|c| {
                    json!({
                        "type": "function_call", "id": c.id, "name": c.function.name,
                        "arguments": serde_json::from_str::<Value>(&c.function.arguments)
                            .unwrap_or_else(|_| json!({})),
                    })
                }));
            }
            Message::Tool {
                tool_call_id,
                content,
            } => steps.push(json!({
                "type": "function_result", "call_id": tool_call_id, "result": content
            })),
        }
    }
    let mut body = json!({ "model": model, "input": steps, "store": false });
    if !system.is_empty() {
        body["system_instruction"] = json!(system.join("\n\n"));
    }
    if !tools.is_empty() {
        body["tools"] = tools
            .iter()
            .map(|t| {
                json!({
                    "type": "function", "name": t.name, "description": t.description,
                    "parameters": t.parameters
                })
            })
            .collect();
    }
    if let Some(level) = thinking_level {
        body["generation_config"] = json!({ "thinking_level": level });
    }
    body
}

/// Parses an Interaction.
pub fn parse_reply(response: &Value) -> Result<Reply> {
    if response["status"] == "failed" {
        bail!("interaction failed: {}", response["errors"]);
    }
    let Some(steps) = response["steps"].as_array() else {
        bail!("response has no steps: {response}");
    };
    // Only the model's own steps are echoed back (in case the response repeats the input).
    let steps: Vec<Value> = steps
        .iter()
        .filter(|s| !matches!(s["type"].as_str(), Some("user_input" | "function_result")))
        .cloned()
        .collect();
    let mut out = String::new();
    let mut tool_calls = Vec::new();
    for step in &steps {
        match step["type"].as_str() {
            Some("function_call") => tool_calls.push(ToolCall::new(
                step["id"].as_str().context("function_call without id")?,
                step["name"]
                    .as_str()
                    .context("function_call without name")?,
                &step["arguments"].to_string(),
            )),
            Some("model_output") => {
                for part in step["content"].as_array().into_iter().flatten() {
                    if let Some(t) = part["text"].as_str() {
                        out.push_str(t);
                    }
                }
            }
            _ => {}
        }
    }
    let u = &response["usage"];
    let n = |k: &str| u[k].as_u64().unwrap_or(0);
    let thought = n("total_thought_tokens");
    Ok(Reply {
        content: (!out.is_empty()).then_some(out),
        tool_calls,
        usage: Usage {
            input: n("total_input_tokens"),
            cached: n("total_cached_tokens"),
            cache_write: 0,
            // Thought tokens are counted apart from output and billed as output.
            output: n("total_output_tokens") + thought,
            reasoning: thought,
        },
        raw: steps,
    })
}

impl Model for Gemini {
    async fn complete(&self, messages: &[Message], tools: &[ToolSpec]) -> Result<Reply> {
        let body = request_body(&self.model, self.thinking_level.as_deref(), messages, tools);
        let url = format!("{}/interactions", self.base_url);
        let response = post_json(&url, &body, || {
            self.http.post(&url).header("x-goog-api-key", &self.api_key)
        })
        .await?;
        parse_reply(&response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn body_is_interactions_shape() {
        let tools = [ToolSpec {
            name: "search_page".into(),
            description: "Find passages.".into(),
            parameters: json!({"type": "object", "properties": {}}),
        }];
        let messages = [
            Message::System {
                content: "sys".into(),
            },
            Message::User {
                content: "q".into(),
            },
            Message::Assistant {
                content: None,
                tool_calls: Vec::new(),
                raw: vec![
                    json!({"type": "thought", "signature": "s"}),
                    json!({"type": "function_call", "id": "f1", "name": "search_page", "arguments": {}}),
                ],
            },
            Message::Tool {
                tool_call_id: "f1".into(),
                content: "a".into(),
            },
            Message::Assistant {
                content: Some("Checking.".into()),
                tool_calls: vec![ToolCall::new("f2", "search_page", "{\"q\":1}")],
                raw: Vec::new(),
            },
        ];
        insta::assert_json_snapshot!(request_body("gemini-3.8-flash", Some("medium"), &messages, &tools), @r#"
        {
          "generation_config": {
            "thinking_level": "medium"
          },
          "input": [
            {
              "content": [
                {
                  "text": "q",
                  "type": "text"
                }
              ],
              "type": "user_input"
            },
            {
              "signature": "s",
              "type": "thought"
            },
            {
              "arguments": {},
              "id": "f1",
              "name": "search_page",
              "type": "function_call"
            },
            {
              "call_id": "f1",
              "result": "a",
              "type": "function_result"
            },
            {
              "content": [
                {
                  "text": "Checking.",
                  "type": "text"
                }
              ],
              "type": "model_output"
            },
            {
              "arguments": {
                "q": 1
              },
              "id": "f2",
              "name": "search_page",
              "type": "function_call"
            }
          ],
          "model": "gemini-3.8-flash",
          "store": false,
          "system_instruction": "sys",
          "tools": [
            {
              "description": "Find passages.",
              "name": "search_page",
              "parameters": {
                "properties": {},
                "type": "object"
              },
              "type": "function"
            }
          ]
        }
        "#);
    }

    #[test]
    fn parses_steps_and_usage() {
        let response = json!({
            "status": "requires_action",
            "steps": [
                {"type": "thought", "signature": "s"},
                {"type": "model_output", "content": [{"type": "text", "text": "Let me look."}]},
                {"type": "function_call", "id": "f1", "name": "click", "arguments": {"ref": 3}}
            ],
            "usage": {"total_input_tokens": 100, "total_cached_tokens": 64,
                      "total_output_tokens": 9, "total_thought_tokens": 30, "total_tokens": 139}
        });
        let reply = parse_reply(&response).unwrap();
        assert_eq!(reply.content.as_deref(), Some("Let me look."));
        assert_eq!(
            reply.tool_calls,
            [ToolCall::new("f1", "click", "{\"ref\":3}")]
        );
        assert_eq!(
            reply.usage,
            Usage {
                input: 100,
                cached: 64,
                cache_write: 0,
                output: 39,
                reasoning: 30
            }
        );
        assert_eq!(reply.raw.len(), 3);
    }

    #[test]
    fn rejects_failed_interactions() {
        assert!(parse_reply(&json!({"status": "failed", "errors": ["x"]})).is_err());
        assert!(parse_reply(&json!({"error": {"message": "bad key"}})).is_err());
    }
}
