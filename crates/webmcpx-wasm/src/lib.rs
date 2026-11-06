//! WebAssembly exports for the `webmcpx` npm loader. Pure string -> string: the loader
//! owns the DOM and `registerTool()`, so each tool call crosses the boundary once.
//!
//! `no_std` on wasm32 keeps std's panic and formatting machinery out of the module
//! (stable Rust has no `panic_immediate_abort`).

#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

use alloc::string::String;
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOCATOR: dlmalloc::GlobalDlmalloc = dlmalloc::GlobalDlmalloc;

#[cfg(target_arch = "wasm32")]
#[panic_handler]
fn panic(_: &core::panic::PanicInfo<'_>) -> ! {
    core::arch::wasm32::unreachable()
}

/// `fetch_as_markdown` over a block stream.
#[wasm_bindgen]
pub fn markdown(blocks: &str, cursor: &str, max_chars: u32) -> String {
    webmcpx_std::markdown(blocks, cursor, max_chars as usize)
}

/// `search_page` over a block stream.
#[wasm_bindgen]
pub fn search(blocks: &str, query: &str, limit: u32) -> String {
    webmcpx_std::search(blocks, query, limit as usize)
}
