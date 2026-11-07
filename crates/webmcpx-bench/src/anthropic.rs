//! Anthropic Messages API (`/v1/messages`) client.
//!
//! Thinking is adaptive (on by default on current Claude models); `effort` sets its depth, the
//! counterpart of OpenAI's `reasoning.effort`. The assistant's content blocks, thinking blocks and
//! their signatures included, are sent back verbatim on the next turn. Prompt caching is automatic
//! (one top-level `cache_control`), as it is on the other providers.

use std::time::Duration;

use anyhow::{Context as _, Result, bail};
use serde_json::{Value, json};

use crate::model::{Message, Model, Reply, ToolCall, ToolSpec, Usage, post_json};

/// The API version this client is written against.
const VERSION: &str = "2026-10-21";
/// Room for adaptive thinking plus the answer; the agent's answers are short.
const MAX_TOKENS: u32 = 16_000;

pub struct Anthropic {
    http: reqwest::Client,
    base_url: String,
    api_key: String,
    model: String,
    effort: Option<String>,
}

impl Anthropic {
    /// Reads `ANTHROPIC_API_KEY` and, if set, `ANTHROPIC_BASE_URL`.
    pub fn from_env(model: String, effort: Option<String>) -> Result<Self> {
        let api_key = std::env::var("ANTHROPIC_API_KEY")
            .context("set ANTHROPIC_API_KEY (e.g. `export ANTHROPIC_API_KEY=sk-ant-...`)")?;
        let base_url = std::env::var("ANTHROPIC_BASE_URL")
            .unwrap_or_else(|_| "https://api.anthropic.com".into());
        Ok(Self {
            http: reqwest::Client::builder()
                .timeout(Duration::from_secs(300))
                .build()?,
            base_url: base_url.trim_end_matches('/').into(),
            api_key,
            model,
            effort,
        })
    }
}

/// The request body. Deterministic for a given input (tested by snapshot).
pub fn request_body(
    model: &str,
    effort: Option<&str>,
    messages: &[Message],
    tools: &[ToolSpec],
) -> Value {
    let mut system = Vec::new();
    let mut turns: Vec<Value> = Vec::new();
    for m in messages {
        match m {
            Message::System { content } => system.push(content.as_str()),
            Message::User { content } => {
                turns.push(json!({ "role": "user", "content": content }));
            }
            Message::Assistant { raw, .. } if !raw.is_empty() => {
                turns.push(json!({ "role": "assistant", "content": raw }));
            }
            Message::Assistant {
                content,
                tool_calls,
                ..
            } => {
                let mut blocks: Vec<Value> = content
                    .iter()
                    .map(|t| json!({ "type": "text", "text": t }))
                    .collect();
                blocks.extend(tool_calls.iter().map(|c| {
                    json!({
                        "type": "tool_use", "id": c.id, "name": c.function.name,
                        "input": serde_json::from_str::<Value>(&c.function.arguments)
                            .unwrap_or_else(|_| json!({})),
                    })
                }));
                turns.push(json!({ "role": "assistant", "content": blocks }));
            }
            Message::Tool {
                tool_call_id,
                content,
            } => {
                let result = json!({ "type": "tool_result", "tool_use_id": tool_call_id, "content": content });
                // All results of one turn go in a single user message.
                match turns.last_mut() {
                    Some(last) if is_tool_results(last) => {
                        if let Some(blocks) = last["content"].as_array_mut() {
                            blocks.push(result);
                        }
                    }
                    _ => turns.push(json!({ "role": "user", "content": [result] })),
                }
            }
        }
    }
    let mut body = json!({
        "model": model,
        "max_tokens": MAX_TOKENS,
        "messages": turns,
        "cache_control": { "type": "ephemeral" },
    });
    if !system.is_empty() {
        body["system"] = json!(system.join("\n\n"));
    }
    if !tools.is_empty() {
        body["tools"] = tools
            .iter()
            .map(|t| json!({ "name": t.name, "description": t.description, "input_schema": t.parameters }))
            .collect();
    }
    if let Some(effort) = effort {
        body["output_config"] = json!({ "effort": effort });
    }
    body
}

fn is_tool_results(turn: &Value) -> bool {
    turn["role"] == "user"
        && turn["content"]
            .as_array()
            .is_some_and(|b| b.iter().all(|b| b["type"] == "tool_result"))
}

/// Parses a Messages API response.
pub fn parse_reply(response: &Value) -> Result<Reply> {
    let Some(content) = response["content"].as_array() else {
        bail!("response has no content: {response}");
    };
    let mut text = String::new();
    let mut tool_calls = Vec::new();
    for block in content {
        match block["type"].as_str() {
            Some("text") => text.push_str(block["text"].as_str().unwrap_or_default()),
            Some("tool_use") => tool_calls.push(ToolCall::new(
                block["id"].as_str().context("tool_use without id")?,
                block["name"].as_str().context("tool_use without name")?,
                &block["input"].to_string(),
            )),
            _ => {}
        }
    }
    let u = &response["usage"];
    let n = |k: &str| u[k].as_u64().unwrap_or(0);
    let (read, write) = (
        n("cache_read_input_tokens"),
        n("cache_creation_input_tokens"),
    );
    Ok(Reply {
        content: (!text.is_empty()).then_some(text),
        tool_calls,
        usage: Usage {
            // `input_tokens` is only the uncached remainder; ours includes reads and writes.
            input: n("input_tokens") + read + write,
            cached: read,
            cache_write: write,
            // Output includes thinking; the API does not report thinking separately.
            output: n("output_tokens"),
            reasoning: 0,
        },
        raw: content.clone(),
    })
}

impl Model for Anthropic {
    async fn complete(&self, messages: &[Message], tools: &[ToolSpec]) -> Result<Reply> {
        let body = request_body(&self.model, self.effort.as_deref(), messages, tools);
        let url = format!("{}/v1/messages", self.base_url);
        let response = post_json(&url, &body, || {
            self.http
                .post(&url)
                .header("x-api-key", &self.api_key)
                .header("anthropic-version", VERSION)
        })
        .await?;
        parse_reply(&response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn body_is_messages_shape() {
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
                    json!({"type": "thinking", "thinking": "", "signature": "s"}),
                    json!({"type": "tool_use", "id": "t1", "name": "search_page", "input": {}}),
                    json!({"type": "tool_use", "id": "t2", "name": "search_page", "input": {}}),
                ],
            },
            Message::Tool {
                tool_call_id: "t1".into(),
                content: "a".into(),
            },
            Message::Tool {
                tool_call_id: "t2".into(),
                content: "b".into(),
            },
            Message::Assistant {
                content: Some("Checking.".into()),
                tool_calls: vec![ToolCall::new("t3", "search_page", "{\"q\":1}")],
                raw: Vec::new(),
            },
        ];
        insta::assert_json_snapshot!(request_body("claude-haiku-5-5", Some("medium"), &messages, &tools), @r#"
        {
          "cache_control": {
            "type": "ephemeral"
          },
          "max_tokens": 16000,
          "messages": [
            {
              "content": "q",
              "role": "user"
            },
            {
              "content": [
                {
                  "signature": "s",
                  "thinking": "",
                  "type": "thinking"
                },
                {
                  "id": "t1",
                  "input": {},
                  "name": "search_page",
                  "type": "tool_use"
                },
                {
                  "id": "t2",
                  "input": {},
                  "name": "search_page",
                  "type": "tool_use"
                }
              ],
              "role": "assistant"
            },
            {
              "content": [
                {
                  "content": "a",
                  "tool_use_id": "t1",
                  "type": "tool_result"
                },
                {
                  "content": "b",
                  "tool_use_id": "t2",
                  "type": "tool_result"
                }
              ],
              "role": "user"
            },
            {
              "content": [
                {
                  "text": "Checking.",
                  "type": "text"
                },
                {
                  "id": "t3",
                  "input": {
                    "q": 1
                  },
                  "name": "search_page",
                  "type": "tool_use"
                }
              ],
              "role": "assistant"
            }
          ],
          "model": "claude-haiku-5-5",
          "output_config": {
            "effort": "medium"
          },
          "system": "sys",
          "tools": [
            {
              "description": "Find passages.",
              "input_schema": {
                "properties": {},
                "type": "object"
              },
              "name": "search_page"
            }
          ]
        }
        "#);
    }

    #[test]
    fn parses_tool_use_text_and_usage() {
        let response = json!({
            "content": [
                {"type": "thinking", "thinking": "", "signature": "s"},
                {"type": "text", "text": "Let me look."},
                {"type": "tool_use", "id": "t1", "name": "click", "input": {"ref": 3}}
            ],
            "stop_reason": "tool_use",
            "usage": {"input_tokens": 20, "cache_read_input_tokens": 64,
                      "cache_creation_input_tokens": 16, "output_tokens": 9}
        });
        let reply = parse_reply(&response).unwrap();
        assert_eq!(reply.content.as_deref(), Some("Let me look."));
        assert_eq!(
            reply.tool_calls,
            [ToolCall::new("t1", "click", "{\"ref\":3}")]
        );
        assert_eq!(
            reply.usage,
            Usage {
                input: 100,
                cached: 64,
                cache_write: 16,
                output: 9,
                reasoning: 0
            }
        );
        assert_eq!(reply.raw.len(), 3);
    }

    #[test]
    fn rejects_errors() {
        assert!(parse_reply(&json!({"type": "error", "error": {"message": "x"}})).is_err());
    }
}
