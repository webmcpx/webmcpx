// The Rust CLI (crates/webmcpx: lint, rules, rule, explain), compiled for WASI by `just wasm` and run here in
// Node, so `npx webmcpx lint` works anywhere Node does: no Rust toolchain, one file for every OS. Output,
// --fix and exit codes (0 clean, 1 lint errors, 2 usage or I/O) are the native CLI's own.
import { readFile } from "node:fs/promises";
import path from "node:path";

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
  const mapped = mapArgs(args, process.cwd());
  if (mapped.error) {
    console.error(`error: ${mapped.error} (INVALID_INPUT)\nhint: Run webmcpx from that drive, or pass a path on this one.`);
    return 2;
  }
  const { WASI } = await quietly(() => import("node:wasi"));
  const wasi = new WASI({ version: "preview1", args: ["webmcpx", ...mapped.args], env: { ...process.env, PWD: mapped.pwd }, preopens: { "/": mapped.root }, returnOnExit: true });
  const instance = await WebAssembly.instantiate(await WebAssembly.compile(bytes), wasi.getImportObject());
  return wasi.start(instance);
}

/**
 * The CLI's view of the host: the file system root of the working directory's drive mapped at "/", the working
 * directory as PWD, and absolute path arguments rewritten under "/". Relative, "../" and absolute paths then
 * mean what they mean natively, with the same access. A path on another root (on Windows, another drive or a
 * UNC share; also a drive-relative `D:src`) would land on the wrong file, so it is refused instead.
 * `p` is node:path (tests pass path.win32).
 */
export function mapArgs(args, cwd, p = path) {
  const root = p.parse(cwd).root;
  // Roots compare with either slash (C:/ is C:\\) and, on Windows, any case. A bare root ("\\repo") is the
  // working directory's drive, as it is natively.
  const norm = (r) => (p.sep === "\\" ? r.replaceAll("/", "\\").toLowerCase() : r);
  const same = (r) => norm(r) === norm(root) || /^[\\/]+$/.test(r);
  const posix = (abs) => "/" + abs.slice(p.parse(abs).root.length).split(/[\\/]/).filter(Boolean).join("/");
  const out = [];
  for (const arg of args) {
    const argRoot = p.parse(arg).root;
    if (argRoot && !same(argRoot)) return { error: `${arg} is not on the same drive as the working directory (${root})` };
    out.push(p.isAbsolute(arg) ? posix(arg) : arg);
  }
  return { args: out, root, pwd: posix(cwd) };
}

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
