//! The agent loop, identical for both arms: ask the model, run its tool calls, repeat until it
//! answers or runs out of steps.

use std::time::Instant;

use serde::{Deserialize, Serialize};

use crate::arm::Session;
use crate::model::{Message, Model, Usage};

pub const SYSTEM_PROMPT: &str = "You are a browser agent working on the web page the user has open. \
Use the tools to complete the user's request on this page; the page is the source of truth, not your \
own knowledge. When you are done, reply with a short final answer and no further tool calls.";

/// What happened in one run.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Outcome {
    pub answer: Option<String>,
    pub stop: Stop,
    /// Model calls.
    pub steps: u32,
    pub tool_calls: Vec<TraceCall>,
    pub usage: Usage,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Stop {
    #[default]
    Answered,
    MaxSteps,
    ModelError,
}

/// One tool call, for the trace in the results file.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TraceCall {
    pub name: String,
    pub arguments: String,
    pub result_chars: usize,
    /// What the agent got back. Kept out of the published results file (it goes to the run's
    /// observations file, see main.rs), so it is empty in files read back from disk.
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub result: String,
}

pub async fn run(
    model: &impl Model,
    session: &Session<'_>,
    prompt: &str,
    max_steps: u32,
) -> Outcome {
    let started = Instant::now();
    let mut out = Outcome::default();
    let mut messages = vec![
        Message::System {
            content: SYSTEM_PROMPT.into(),
        },
        Message::User {
            content: prompt.into(),
        },
    ];
    out.stop = loop {
        if out.steps == max_steps {
            break Stop::MaxSteps;
        }
        out.steps += 1;
        let reply = match model.complete(&messages, &session.tools).await {
            Ok(r) => r,
            Err(e) => {
                out.answer = Some(format!("model error: {e:#}"));
                break Stop::ModelError;
            }
        };
        out.usage += reply.usage;
        if reply.tool_calls.is_empty() {
            out.answer = reply.content;
            break Stop::Answered;
        }
        messages.push(Message::Assistant {
            content: reply.content,
            tool_calls: reply.tool_calls.clone(),
            raw: reply.raw,
        });
        for call in reply.tool_calls {
            let result = session
                .call(&call.function.name, &call.function.arguments)
                .await;
            out.tool_calls.push(TraceCall {
                name: call.function.name,
                arguments: call.function.arguments,
                result_chars: result.chars().count(),
                result: result.clone(),
            });
            messages.push(Message::Tool {
                tool_call_id: call.id,
                content: result,
            });
        }
    };
    out.duration_ms = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
    out
}
