//! The model boundary: an OpenAI Responses API client, and the `Model` trait the agent loop
//! depends on (tests swap in a scripted model).
//!
//! Responses API, not Chat Completions: reasoning models such as `gpt-6-luna` only accept function
//! tools together with `reasoning.effort` there. Calls are stateless (`store: false`); reasoning items
//! come back encrypted and are sent back verbatim on the next turn.

use std::future::Future;
use std::time::Duration;

use anyhow::{Context as _, Result, bail};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

/// The conversation as the agent loop sees it.
#[derive(Debug, Clone, PartialEq)]
pub enum Message {
    System {
        content: String,
    },
    User {
        content: String,
    },
    Assistant {
        content: Option<String>,
        tool_calls: Vec<ToolCall>,
        /// The provider's output items for this turn, echoed back verbatim (they carry reasoning).
        /// Empty for scripted models; the request is then rebuilt from `content` and `tool_calls`.
        raw: Vec<Value>,
    },
    Tool {
        tool_call_id: String,
        content: String,
    },
}

#[derive(Debug, Clone, PartialEq)]
pub struct ToolCall {
    pub id: String,
    pub function: FunctionCall,
}

impl ToolCall {
    pub fn new(id: &str, name: &str, arguments: &str) -> Self {
        Self {
            id: id.into(),
            function: FunctionCall {
                name: name.into(),
                arguments: arguments.into(),
            },
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct FunctionCall {
    pub name: String,
    pub arguments: String,
}

/// A tool as offered to the model.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct ToolSpec {
    pub name: String,
    pub description: String,
    pub parameters: Value,
}

/// Token usage of one or more model calls. `input` includes `cached` (cache reads) and
/// `cache_write` tokens; `output` includes `reasoning`.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Usage {
    pub input: u64,
    pub cached: u64,
    #[serde(default)]
    pub cache_write: u64,
    pub output: u64,
    pub reasoning: u64,
}

impl std::ops::AddAssign for Usage {
    fn add_assign(&mut self, o: Self) {
        self.input += o.input;
        self.cached += o.cached;
        self.cache_write += o.cache_write;
        self.output += o.output;
        self.reasoning += o.reasoning;
    }
}

impl Usage {
    /// Input plus output tokens (reasoning tokens are part of output).
    pub const fn total(self) -> u64 {
        self.input + self.output
    }
}

/// One assistant turn: either a final answer or tool calls.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Reply {
    pub content: Option<String>,
    pub tool_calls: Vec<ToolCall>,
    pub usage: Usage,
    /// Output items to echo back (see `Message::Assistant::raw`).
    pub raw: Vec<Value>,
}

pub trait Model: Sync {
    fn complete(
        &self,
        messages: &[Message],
        tools: &[ToolSpec],
    ) -> impl Future<Output = Result<Reply>> + Send;
}

/// OpenAI Responses API (`/v1/responses`), or a compatible endpoint via `OPENAI_BASE_URL`.
pub struct OpenAi {
    http: reqwest::Client,
    base_url: String,
    api_key: String,
    pub model: String,
    pub reasoning_effort: Option<String>,
}

impl OpenAi {
    /// Reads `OPENAI_API_KEY` and, if set, `OPENAI_BASE_URL`.
    pub fn from_env(model: String, reasoning_effort: Option<String>) -> Result<Self> {
        let api_key = std::env::var("OPENAI_API_KEY")
            .context("set OPENAI_API_KEY (e.g. `export OPENAI_API_KEY=sk-...`)")?;
        let base_url =
            std::env::var("OPENAI_BASE_URL").unwrap_or_else(|_| "https://api.openai.com/v1".into());
        let http = reqwest::Client::builder()
            .timeout(Duration::from_secs(300))
            .build()?;
        Ok(Self {
            http,
            base_url: base_url.trim_end_matches('/').into(),
            api_key,
            model,
            reasoning_effort,
        })
    }
}

/// The request body. Deterministic for a given input (tested by snapshot).
pub fn request_body(
    model: &str,
    reasoning_effort: Option<&str>,
    messages: &[Message],
    tools: &[ToolSpec],
) -> Value {
    let mut input = Vec::new();
    for m in messages {
        match m {
            Message::System { content } => {
                input.push(json!({ "role": "system", "content": content }));
            }
            Message::User { content } => input.push(json!({ "role": "user", "content": content })),
            Message::Assistant { raw, .. } if !raw.is_empty() => input.extend(raw.iter().cloned()),
            Message::Assistant {
                content,
                tool_calls,
                ..
            } => {
                if let Some(text) = content {
                    input.push(json!({ "role": "assistant", "content": text }));
                }
                input.extend(tool_calls.iter().map(|c| {
                    json!({
                        "type": "function_call", "call_id": c.id,
                        "name": c.function.name, "arguments": c.function.arguments
                    })
                }));
            }
            Message::Tool {
                tool_call_id,
                content,
            } => input.push(json!({
                "type": "function_call_output", "call_id": tool_call_id, "output": content
            })),
        }
    }
    let mut body = json!({ "model": model, "input": input, "store": false });
    if !tools.is_empty() {
        body["tools"] = tools
            .iter()
            .map(|t| {
                json!({
                    "type": "function", "name": t.name, "description": t.description,
                    "parameters": t.parameters, "strict": false
                })
            })
            .collect();
    }
    if let Some(effort) = reasoning_effort {
        // Stateless responses carry `encrypted_content` on reasoning items by default.
        body["reasoning"] = json!({ "effort": effort });
    }
    body
}

/// Parses a Responses API response.
pub fn parse_reply(response: &Value) -> Result<Reply> {
    let Some(output) = response["output"].as_array() else {
        bail!("response has no output: {response}");
    };
    let mut text = String::new();
    let mut tool_calls = Vec::new();
    for item in output {
        match item["type"].as_str() {
            Some("function_call") => tool_calls.push(ToolCall::new(
                item["call_id"]
                    .as_str()
                    .context("function_call without call_id")?,
                item["name"]
                    .as_str()
                    .context("function_call without name")?,
                item["arguments"].as_str().unwrap_or("{}"),
            )),
            Some("message") => {
                for part in item["content"].as_array().into_iter().flatten() {
                    if let Some(t) = part["text"].as_str() {
                        text.push_str(t);
                    }
                }
            }
            _ => {}
        }
    }
    let u = &response["usage"];
    Ok(Reply {
        content: (!text.is_empty()).then_some(text),
        tool_calls,
        usage: Usage {
            input: u["input_tokens"].as_u64().unwrap_or(0),
            cached: u["input_tokens_details"]["cached_tokens"]
                .as_u64()
                .unwrap_or(0),
            cache_write: u["input_tokens_details"]["cache_write_tokens"]
                .as_u64()
                .unwrap_or(0),
            output: u["output_tokens"].as_u64().unwrap_or(0),
            reasoning: u["output_tokens_details"]["reasoning_tokens"]
                .as_u64()
                .unwrap_or(0),
        },
        raw: output.clone(),
    })
}

impl Model for OpenAi {
    async fn complete(&self, messages: &[Message], tools: &[ToolSpec]) -> Result<Reply> {
        let body = request_body(
            &self.model,
            self.reasoning_effort.as_deref(),
            messages,
            tools,
        );
        let url = format!("{}/responses", self.base_url);
        let mut delay = Duration::from_secs(2);
        for attempt in 1..=4 {
            let response = self
                .http
                .post(&url)
                .bearer_auth(&self.api_key)
                .json(&body)
                .send()
                .await;
            let retry = match response {
                Ok(r) if r.status().is_success() => return parse_reply(&r.json().await?),
                Ok(r) if r.status() == 429 || r.status().is_server_error() => {
                    format!("HTTP {}", r.status())
                }
                Ok(r) => {
                    let status = r.status();
                    bail!(
                        "{url}: HTTP {status}: {}",
                        r.text().await.unwrap_or_default()
                    );
                }
                Err(e) if e.is_timeout() || e.is_connect() => e.to_string(),
                Err(e) => return Err(e.into()),
            };
            if attempt == 4 {
                bail!("{url}: giving up after {attempt} attempts: {retry}");
            }
            tokio::time::sleep(delay).await;
            delay *= 2;
        }
        unreachable!("the loop returns or bails")
    }
}

/// USD per million tokens (Standard tier, prompts up to 272K tokens).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Price {
    pub input: f64,
    pub cached_input: f64,
    pub output: f64,
}

/// Cache writes (default 30-minute TTL) cost this multiple of the uncached input rate.
pub const CACHE_WRITE_MULTIPLIER: f64 = 1.25;

impl Price {
    #[expect(
        clippy::cast_precision_loss,
        reason = "token counts are far below 2^52"
    )]
    pub fn cost(self, u: Usage) -> f64 {
        let fresh = u.input.saturating_sub(u.cached + u.cache_write);
        (fresh as f64 * self.input
            + u.cached as f64 * self.cached_input
            + u.cache_write as f64 * self.input * CACHE_WRITE_MULTIPLIER
            + u.output as f64 * self.output)
            / 1e6
    }
}

/// Official list prices, read from <https://developers.openai.com/api/docs/pricing> on 2026-11-06.
/// Unknown models have no cost; pass `--price` instead.
pub fn list_price(model: &str) -> Option<Price> {
    let (input, cached_input, output) = match model {
        "gpt-6-luna" => (0.10, 0.01, 0.50),
        "gpt-6.1-sol" => (2.00, 0.10, 10.00),
        _ => return None,
    };
    Some(Price {
        input,
        cached_input,
        output,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn body_is_responses_shape() {
        let tools = [ToolSpec {
            name: "search_page".into(),
            description: "Find passages.".into(),
            parameters: json!({"type": "object", "properties": {}}),
        }];
        let messages = [
            Message::System {
                content: "sys".into(),
            },
            Message::Assistant {
                content: None,
                tool_calls: vec![ToolCall::new("c1", "search_page", "{}")],
                raw: Vec::new(),
            },
            Message::Tool {
                tool_call_id: "c1".into(),
                content: "{\"ok\":true}".into(),
            },
            Message::Assistant {
                content: None,
                tool_calls: Vec::new(),
                raw: vec![json!({"type": "reasoning", "encrypted_content": "x"})],
            },
        ];
        insta::assert_json_snapshot!(request_body("gpt-6-luna", Some("medium"), &messages, &tools), @r#"
        {
          "input": [
            {
              "content": "sys",
              "role": "system"
            },
            {
              "arguments": "{}",
              "call_id": "c1",
              "name": "search_page",
              "type": "function_call"
            },
            {
              "call_id": "c1",
              "output": "{\"ok\":true}",
              "type": "function_call_output"
            },
            {
              "encrypted_content": "x",
              "type": "reasoning"
            }
          ],
          "model": "gpt-6-luna",
          "reasoning": {
            "effort": "medium"
          },
          "store": false,
          "tools": [
            {
              "description": "Find passages.",
              "name": "search_page",
              "parameters": {
                "properties": {},
                "type": "object"
              },
              "strict": false,
              "type": "function"
            }
          ]
        }
        "#);
    }

    #[test]
    fn parses_tool_calls_text_and_usage() {
        let response = json!({
            "output": [
                {"type": "reasoning", "id": "rs_1", "encrypted_content": "x"},
                {"type": "function_call", "call_id": "c1", "name": "click", "arguments": "{\"ref\":3}"},
                {"type": "message", "content": [{"type": "output_text", "text": "Done."}]}
            ],
            "usage": {"input_tokens": 120, "output_tokens": 9,
                      "input_tokens_details": {"cached_tokens": 64, "cache_write_tokens": 16},
                      "output_tokens_details": {"reasoning_tokens": 4}}
        });
        let reply = parse_reply(&response).unwrap();
        assert_eq!(reply.content.as_deref(), Some("Done."));
        assert_eq!(
            reply.tool_calls,
            [ToolCall::new("c1", "click", "{\"ref\":3}")]
        );
        assert_eq!(
            reply.usage,
            Usage {
                input: 120,
                cached: 64,
                cache_write: 16,
                output: 9,
                reasoning: 4
            }
        );
        assert_eq!(reply.raw.len(), 3);
    }

    #[test]
    fn cost_bills_cache_reads_and_writes_at_their_rates() {
        let price = list_price("gpt-6-luna").unwrap();
        let usage = Usage {
            input: 1_000_000,
            cached: 600_000,
            cache_write: 100_000,
            output: 100_000,
            reasoning: 0,
        };
        // 300K fresh x $0.10 + 600K cached x $0.01 + 100K writes x $0.125 + 100K out x $0.50
        let expected = 0.03 + 0.006 + 0.0125 + 0.05;
        assert!(
            (price.cost(usage) - expected).abs() < 1e-12,
            "{}",
            price.cost(usage)
        );
    }

    #[test]
    fn rejects_responses_without_output() {
        assert!(parse_reply(&json!({"error": {"message": "bad model"}})).is_err());
    }
}
