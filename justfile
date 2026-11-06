# Every recipe CI runs is here: `just check` locally == CI.

wasm_bindgen_version := "0.2.130"
wasm_out := "packages/webmcpx/wasm"
wasm_target := "target/wasm32-unknown-unknown/release-wasm/webmcpx_wasm.wasm"

# List recipes.
default:
    @just --list

# One-time setup of pinned tools.
setup:
    rustup target add wasm32-unknown-unknown
    cargo install --locked wasm-bindgen-cli --version {{wasm_bindgen_version}}
    cargo install --locked cargo-nextest cargo-insta cargo-deny cargo-shear
    @command -v wasm-opt >/dev/null || echo "Install binaryen (wasm-opt): brew install binaryen / apt install binaryen"
    cd packages/webmcpx && npm ci

# Everything CI checks.
check: fmt-check lint test wasm js-test size deny

fmt:
    cargo fmt --all

fmt-check:
    cargo fmt --all --check

# Clippy for native and wasm targets, warnings are errors.
lint:
    cargo clippy --workspace --all-targets -- -D warnings
    cargo clippy -p webmcpx-wasm --target wasm32-unknown-unknown -- -D warnings

# Rust tests (pass `-p <crate>` to narrow).
test *args:
    cargo nextest run --workspace --no-tests=pass {{args}}
    cargo test --workspace --doc {{args}}

# Regenerate files derived from the Rust contracts (packages/webmcpx/src/generated.js).
gen:
    UPDATE_GENERATED=1 cargo test -q -p webmcpx-std --test generated

# Build the optimized wasm module into the npm package.
wasm:
    cargo build --target wasm32-unknown-unknown --profile release-wasm -p webmcpx-wasm
    wasm-bindgen --target web --no-typescript --out-dir {{wasm_out}} {{wasm_target}}
    wasm-opt -Oz --strip-debug --strip-producers --enable-bulk-memory --enable-nontrapping-float-to-int --enable-sign-ext --enable-mutable-globals --enable-reference-types --enable-multivalue {{wasm_out}}/webmcpx_wasm_bg.wasm -o {{wasm_out}}/webmcpx_wasm_bg.wasm

# Loader end-to-end tests (needs `just wasm`).
js-test:
    cd packages/webmcpx && node --test

# Brotli size budgets (needs `just wasm`).
size:
    node scripts/size.mjs

# Supply chain: licenses, advisories, unused dependencies.
deny:
    cargo deny check
    cargo shear

# Review the branch against main with Codex (see AGENTS.md > Review).
review base="main":
    codex exec review --base {{base}} -m gpt-6.1-sol -c model_reasoning_effort='"high"' - < scripts/review.md

# Answer the last review (a rebuttal or "fixed in <sha>") and get a new verdict.
review-reply reply:
    codex exec resume --last -m gpt-6.1-sol -c model_reasoning_effort='"high"' "{{reply}} Re-review the branch against main and end with the VERDICT line."
