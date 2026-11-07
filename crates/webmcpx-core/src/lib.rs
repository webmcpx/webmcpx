//! Canonical WebMCP tool contracts.
//!
//! This crate is the single source of truth for webmcpx: the tool shape, the rules a
//! tool must follow (shared by the runtime and the linter), the result envelope every
//! standard tool returns, and the catalog of error codes.
//!
//! It tracks the WebMCP Draft Community Group Report of 2026-11-02
//! (<https://webmachinelearning.github.io/webmcp/>).

#![no_std]

extern crate alloc;
#[cfg(test)]
extern crate std;

mod codes;
mod envelope;
pub mod limits;
mod name;
mod tool;
pub mod unicode;

pub use codes::Code;
pub use envelope::{Envelope, push_json_str};
pub use name::{NameError, validate_name};
pub use tool::{Annotation, ToolDef};

/// The README examples, run as doctests so they never go stale.
#[cfg(doctest)]
#[doc = include_str!("../README.md")]
struct ReadmeDoctests;
