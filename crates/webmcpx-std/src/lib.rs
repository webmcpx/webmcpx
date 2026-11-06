//! Standard WebMCP tools: contracts plus pure `&str -> envelope JSON` implementations.
//!
//! The browser loader (`packages/webmcpx`) reads the DOM and passes it here as a
//! [block stream](blocks); everything else (cleanup, budgets, paging, ranking) is Rust.

#![no_std]

extern crate alloc;
#[cfg(test)]
extern crate std;

pub mod blocks;
mod markdown;
mod search;
mod text;
pub mod tools;

pub use markdown::markdown;
pub use search::search;
