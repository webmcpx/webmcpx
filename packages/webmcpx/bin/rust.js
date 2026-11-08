// The Rust CLI (crates/webmcpx: lint, rules, rule, explain), compiled for WASI by `just wasm` and run here in
// Node, so `npx webmcpx lint` works anywhere Node does: no Rust toolchain, one file for every OS. Output,
// --fix and exit codes (0 clean, 1 lint errors, 2 usage or I/O) are the native CLI's own.
import { readFile } from "node:fs/promises";
import { isAbsolute, parse, sep } from "node:path";

/** Commands the Rust CLI answers. */
export const RUST_COMMANDS = new Set(["lint", "rules", "rule", "explain"]);

const WASM = new URL("../wasm/webmcpx_cli.wasm", import.meta.url);

/** Runs the Rust CLI with `args` (e.g. ["lint", "src", "--fix"]) and resolves with its exit code. */
export async function runRust(args) {
  let bytes;
  try {
    bytes = await readFile(WASM);
  } catch {
    console.error("This copy of webmcpx has no linter build (wasm/webmcpx_cli.wasm). In the repository, run `just wasm`.");
    return 2;
  }
  // The CLI gets the file system at "/" and starts in the working directory (PWD), so relative, "../" and
  // absolute paths mean what they mean to the native CLI, with the same access.
  const root = parse(process.cwd()).root;
  const env = { ...process.env, PWD: toPosix(process.cwd()) };
  const { WASI } = await quietly(() => import("node:wasi"));
  const wasi = new WASI({ version: "preview1", args: ["webmcpx", ...args.map((a) => (isAbsolute(a) ? toPosix(a) : a))], env, preopens: { "/": root }, returnOnExit: true });
  const instance = await WebAssembly.instantiate(await WebAssembly.compile(bytes), wasi.getImportObject());
  return wasi.start(instance);
}

/** A host path as the CLI sees it under "/" (on Windows, `C:\\a\\b` is `/a/b` on that drive). */
const toPosix = (path) => "/" + path.slice(parse(path).root.length).split(sep).filter(Boolean).join("/");

/** Node flags node:wasi as experimental on every run; users of the linter don't need that line. */
async function quietly(load) {
  const emit = process.emitWarning;
  process.emitWarning = (warning, ...rest) => {
    const text = typeof warning === "string" ? warning : warning?.message;
    if (!String(text).includes("WASI")) emit.call(process, warning, ...rest);
  };
  try {
    return await load();
  } finally {
    process.emitWarning = emit;
  }
}
