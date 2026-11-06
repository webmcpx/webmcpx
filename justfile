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
    cd site && npm ci

# Everything CI checks.
check: fmt-check lint wasm test js-test size site deny

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

# Review the branch against main with Codex (see AGENTS.md > Review). Verdict also in target/review.md.
review base="main":
    (printf 'Review the changes of this branch: run `git diff {{base}}...HEAD` and read any file you need.\n\n'; cat scripts/review.md) | codex exec -s read-only -m gpt-6.1-sol -c model_reasoning_effort='"high"' -o target/review.md -

# Answer the last review (a rebuttal or "fixed in <sha>") and get a new verdict.
# The reply is passed as "$1", never spliced into the shell line, so backticks and $() stay text.
[positional-arguments]
review-reply reply:
    codex exec resume --last -m gpt-6.1-sol -c model_reasoning_effort='"high"' -o target/review.md "$1 Re-review the branch (git diff main...HEAD) and end with the VERDICT line."

# Benchmark both arms (needs OPENAI_API_KEY and Chrome), e.g. `just bench --repeat 1 --task docs-exit-code`.
bench *args: wasm
    cargo run -q --release -p webmcpx-bench -- run {{args}}
    cp bench/results/latest.json site/src/lib/bench.json

# Landing: type check, unit tests, static build into site/build (needs `just wasm`).
site:
    cd site && npm run check && npm test && npm run build

# Landing dev server with hot reload on http://localhost:5173.
site-dev: wasm
    cd site && npm run dev

# Serve the benchmark sites and the built landing on http://127.0.0.1:4173.
serve: wasm
    cargo run -q -p webmcpx-bench -- serve
