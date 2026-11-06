//! The model boundary: an OpenAI-compatible Chat Completions client, and the `Model` trait the agent
//! loop depends on (tests swap in a scripted model).

use std::future::Future;
use std::time::Duration;

use anyhow::{Context as _, Result, bail};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "role", rename_all = "lowercase")]
pub enum Message {
    System {
        content: String,
    },
    User {
        content: String,
    },
    Assistant {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        content: Option<String>,
        #[serde(default, skip_serializing_if = "Vec::is_empty")]
        tool_calls: Vec<ToolCall>,
    },
    Tool {
        tool_call_id: String,
        content: String,
    },
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ToolCall {
    pub id: String,
    #[serde(rename = "type", default = "function_kind")]
    pub kind: String,
    pub function: FunctionCall,
}

fn function_kind() -> String {
    "function".into()
}

impl ToolCall {
    pub fn new(id: &str, name: &str, arguments: &str) -> Self {
        Self {
            id: id.into(),
            kind: function_kind(),
            function: FunctionCall {
                name: name.into(),
                arguments: arguments.into(),
            },
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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

/// Token usage of one or more model calls.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Usage {
    pub input: u64,
    pub cached: u64,
    pub output: u64,
    pub reasoning: u64,
}

impl std::ops::AddAssign for Usage {
    fn add_assign(&mut self, o: Self) {
        self.input += o.input;
        self.cached += o.cached;
        self.output += o.output;
        self.reasoning += o.reasoning;
    }
}

impl Usage {
    pub const fn total(self) -> u64 {
        self.input + self.output
    }
}

/// One assistant turn: either a final answer or tool calls.
#[derive(Debug, Clone, PartialEq)]
pub struct Reply {
    pub content: Option<String>,
    pub tool_calls: Vec<ToolCall>,
    pub usage: Usage,
}

pub trait Model: Sync {
    fn complete(
        &self,
        messages: &[Message],
        tools: &[ToolSpec],
    ) -> impl Future<Output = Result<Reply>> + Send;
}

/// OpenAI Chat Completions (`/v1/chat/completions`), or any compatible endpoint via `base_url`.
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
            .timeout(Duration::from_secs(180))
            .build()?;
        Ok(Self {
            http,
            base_url: base_url.trim_end_matches('/').into(),
            api_key,
            model,
            reasoning_effort,
        })
    }

    fn body(&self, messages: &[Message], tools: &[ToolSpec]) -> Value {
        request_body(
            &self.model,
            self.reasoning_effort.as_deref(),
            messages,
            tools,
        )
    }
}

/// The request body. Deterministic for a given input (tested by snapshot).
pub fn request_body(
    model: &str,
    reasoning_effort: Option<&str>,
    messages: &[Message],
    tools: &[ToolSpec],
) -> Value {
    let mut body = json!({ "model": model, "messages": messages });
    if !tools.is_empty() {
        body["tools"] = tools
            .iter()
            .map(|t| json!({ "type": "function", "function": t }))
            .collect();
    }
    if let Some(effort) = reasoning_effort {
        body["reasoning_effort"] = effort.into();
    }
    body
}

/// Parses a Chat Completions response.
pub fn parse_reply(response: &Value) -> Result<Reply> {
    let message = &response["choices"][0]["message"];
    if message.is_null() {
        bail!("response has no choices[0].message: {response}");
    }
    let tool_calls = match message.get("tool_calls") {
        Some(Value::Array(calls)) => calls
            .iter()
            .map(|c| serde_json::from_value(c.clone()))
            .collect::<Result<_, _>>()
            .context("malformed tool_calls")?,
        _ => Vec::new(),
    };
    let u = &response["usage"];
    Ok(Reply {
        content: message["content"]
            .as_str()
            .filter(|s| !s.is_empty())
            .map(Into::into),
        tool_calls,
        usage: Usage {
            input: u["prompt_tokens"].as_u64().unwrap_or(0),
            cached: u["prompt_tokens_details"]["cached_tokens"]
                .as_u64()
                .unwrap_or(0),
            output: u["completion_tokens"].as_u64().unwrap_or(0),
            reasoning: u["completion_tokens_details"]["reasoning_tokens"]
                .as_u64()
                .unwrap_or(0),
        },
    })
}

impl Model for OpenAi {
    async fn complete(&self, messages: &[Message], tools: &[ToolSpec]) -> Result<Reply> {
        let body = self.body(messages, tools);
        let url = format!("{}/chat/completions", self.base_url);
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

/// List prices in USD per million tokens: (input, output). Cached input is billed as input, so
/// costs are an upper bound. Unknown models have no cost; pass `--price` instead.
pub fn list_price(model: &str) -> Option<(f64, f64)> {
    match model {
        // Third-party listings as of 2026-11; verify on https://openai.com/api/pricing.
        "gpt-6-luna" => Some((0.10, 0.50)),
        "gpt-5.6-luna" => Some((0.20, 1.20)),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn body_is_chat_completions_shape() {
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
            },
            Message::Tool {
                tool_call_id: "c1".into(),
                content: "{\"ok\":true}".into(),
            },
        ];
        insta::assert_json_snapshot!(request_body("gpt-6-luna", Some("low"), &messages, &tools), @r#"
        {
          "messages": [
            {
              "content": "sys",
              "role": "system"
            },
            {
              "role": "assistant",
              "tool_calls": [
                {
                  "function": {
                    "arguments": "{}",
                    "name": "search_page"
                  },
                  "id": "c1",
                  "type": "function"
                }
              ]
            },
            {
              "content": "{\"ok\":true}",
              "role": "tool",
              "tool_call_id": "c1"
            }
          ],
          "model": "gpt-6-luna",
          "reasoning_effort": "low",
          "tools": [
            {
              "function": {
                "description": "Find passages.",
                "name": "search_page",
                "parameters": {
                  "properties": {},
                  "type": "object"
                }
              },
              "type": "function"
            }
          ]
        }
        "#);
    }

    #[test]
    fn parses_tool_calls_and_usage() {
        let response = json!({
            "choices": [{"message": {"role": "assistant", "content": null, "tool_calls": [
                {"id": "c1", "type": "function", "function": {"name": "click", "arguments": "{\"ref\":3}"}}
            ]}}],
            "usage": {"prompt_tokens": 120, "completion_tokens": 9,
                      "prompt_tokens_details": {"cached_tokens": 64},
                      "completion_tokens_details": {"reasoning_tokens": 4}}
        });
        let reply = parse_reply(&response).unwrap();
        assert_eq!(reply.content, None);
        assert_eq!(
            reply.tool_calls,
            [ToolCall::new("c1", "click", "{\"ref\":3}")]
        );
        assert_eq!(
            reply.usage,
            Usage {
                input: 120,
                cached: 64,
                output: 9,
                reasoning: 4
            }
        );
    }

    #[test]
    fn rejects_responses_without_a_message() {
        assert!(parse_reply(&json!({"error": {"message": "bad model"}})).is_err());
    }
}
