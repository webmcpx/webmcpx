# 0003: `npx webmcpx lint` runs the Rust CLI as WebAssembly (WASI), not per-OS binaries

- **Status:** accepted (2026-11-08)
- **Code:** `packages/webmcpx/bin/rust.js`, `just wasm` (builds `packages/webmcpx/wasm/webmcpx_cli.wasm`),
  `crates/webmcpx/src/main.rs` (starts in `PWD` under WASI), tests in `packages/webmcpx/test/lint.test.js`

## Context

The linter was the Rust CLI only (`cargo install webmcpx`), so using it needed a Rust toolchain. The npm
package said so (`npx webmcpx lint` printed "install with cargo"), while the site's scan result and the
agent skill told people to lint. Most people who add WebMCP to a site have Node, not Rust.

Two ways to ship it through npm without Rust:

1. **Native binaries per OS** in platform packages (`optionalDependencies`, as esbuild and Biome do): 5-6
   targets to build, sign and notarize (macOS Gatekeeper, Windows SmartScreen), and installs that break when
   optional dependencies are skipped (`--no-optional`, some pnpm and proxy setups).
2. **The same CLI compiled for WASI** (`wasm32-wasip1`), run by Node's `node:wasi`: one file for every OS.

## Decision

Option 2. `just wasm` builds the unchanged `webmcpx` crate for `wasm32-wasip1` and optimizes it with
`wasm-opt -Oz` (687 KB, 293 KB gzipped, measured 2026-11-08); the npm package ships it and
`npx webmcpx lint|rules|rule|explain` hands its arguments to it untouched. Parity with the native CLI is by
construction (same code: clap, output formats, `--fix`, exit codes 0/1/2); `test/lint.test.js` checks the
user-visible parts.

How it runs: Node maps the file system root at `/` and passes the working directory as `PWD`; under WASI the
CLI starts in `PWD`, so relative, `../` and absolute paths mean what they mean natively, with the same
access a native binary has. Node marks `node:wasi` experimental (Stability 1); the warning is filtered for
this one module. The file loads only for these commands, never in the browser script, so the 10 KB on-load
budget is untouched.

On Windows the mapped root is the working directory's drive: a path on another drive is not reachable
(the CLI says it does not exist, exit 2). CI runs the lint tests on macOS and Windows with Node 22.

`cargo install webmcpx` stays for people who want the native binary.

## Consequences

- `npx webmcpx lint src/` works anywhere Node 22+ does; docs, the skill, llms.txt and the scan result say so.
- CI and `just setup` add the `wasm32-wasip1` target; `just lint` runs clippy for it.
- If `node:wasi` changes incompatibly, the fallback is option 1; a change of approach is a new record.
