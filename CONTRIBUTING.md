# Contributing to webmcpx

Start with [AGENTS.md](AGENTS.md): it lists the commands and the few rules no tool enforces.
It applies to people and coding agents alike.

## Principles (in this order when they conflict)

1. Contract correctness > developer experience > performance > maintainer convenience.
2. Users configure nothing to get safe behavior. Defaults are the feature; a new option must show
   why a default is not enough.
3. YAGNI: nothing lands without a real use case in an issue. Abstract on the third repetition.

## Tests

- Test observable behavior (input → envelope or diagnostic), not internals.
- Snapshots (`insta`) for generated contracts, CLI output and diagnostics.
- Mock only the browser boundary (`document.modelContext`), never our own code.
- Logic that ships as WebAssembly is tested natively with `cargo test`; the browser side is covered
  by the loader's end-to-end tests (`packages/webmcpx/test`).
- No coverage target. Every fixed bug gets a regression test.

## Stability

- Before 1.0, breaking changes may land in a minor release and are called out in the PR.
- Stable from the first release: standard tool names and schemas, rule names, error codes, the
  `--format json` shape (`schema_version`), exit codes 0/1/2.
- Preview rules are outside semver.
- We track the WebMCP draft. A spec change lands in `webmcpx-core` with a link to the spec issue or PR.

## Ideas from the WebMCP spec repo

The WebMCP Community Group keeps its tracker for the spec itself and often closes ecosystem ideas
(tooling, conventions, libraries) as out of scope. Those are welcome here: open a **Tool or rule proposal**
issue linking the original spec issue, the use case and the proposed contract.

## AI assistance

- AI assistance is welcome; autonomous agents opening PRs without human review are not.
- Whoever submits a PR has read, understood and tested the whole diff, and answers review comments.
- Disclose it with an `Assisted-by:` commit trailer or the PR template checkbox.
- Maintainers may close low-effort PRs without review.

## License

By contributing you agree your work is dual-licensed under MIT OR Apache-2.0.
