# AGENTS.md — webmcpx-wasm

- Build only via `just wasm` (cargo `release-wasm` profile → `wasm-bindgen --target web` → `wasm-opt -Oz`).
- The `wasm-bindgen` crate is pinned with `=`; the CLI must be the same version (`just setup` installs it).
- `release-wasm` must keep `strip = false`: wasm-bindgen needs the `target_features` section; wasm-opt strips.
- On wasm32 the crate is `no_std` with its own panic handler and `dlmalloc`. This keeps std's panic and
  formatting machinery out (stable Rust has no `panic_immediate_abort`). Anything that pulls in `std`
  or `core::fmt` here breaks the 12 KB budget: run `just wasm size` after every change.
- Exports stay `&str`/`u32` in, `String` out. One boundary crossing per tool call.
- Pages with a strict CSP need `'wasm-unsafe-eval'`; the loader reports `UNAVAILABLE` with that hint.
