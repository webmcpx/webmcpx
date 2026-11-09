// The Rust CLI (crates/webmcpx: lint, rules, rule, explain), compiled for WASI by `just wasm` and run here in
// Node, so `npx webmcpx lint` works anywhere Node does: no Rust toolchain, one file for every OS. Output,
// --fix and exit codes (0 clean, 1 lint errors, 2 usage or I/O) are the native CLI's own.
import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
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
  const env = { ...process.env, PWD: mapped.pwd };
  const preopens = { "/": mapped.root };
  // Node's WASI can't list directories on Windows (fd_readdir is ENOSYS there): list them here, for the CLI's
  // own walk (crates/webmcpx/src/files.rs, host_listing). WEBMCPX_HOST_LISTING=1 forces it, for tests.
  let listingDir;
  if (args[0] === "lint" && (process.platform === "win32" || process.env.WEBMCPX_HOST_LISTING === "1")) {
    listingDir = mkdtempSync(path.join(tmpdir(), "webmcpx-tree-"));
    writeFileSync(path.join(listingDir, "tree.json"), JSON.stringify(listDirs(args, mapped.args, process.cwd())));
    preopens["/.webmcpx-host"] = listingDir;
    env.WEBMCPX_TREE = "/.webmcpx-host/tree.json";
  }
  try {
    const wasi = new WASI({ version: "preview1", args: ["webmcpx", ...mapped.args], env, preopens, returnOnExit: true });
    const instance = await WebAssembly.instantiate(await WebAssembly.compile(bytes), wasi.getImportObject());
    return wasi.start(instance);
  } finally {
    if (listingDir) rmSync(listingDir, { recursive: true, force: true });
  }
}

/** Directories the CLI's walk never enters (files.rs, SKIP_DIRS; and hidden ones): not listed, to keep it small. */
const SKIP_DIRS = new Set(["node_modules", "target", "dist", "build"]);

/** `lint` options that take a value (crates/webmcpx/src/main.rs): their value is not a path. */
const LINT_VALUES = new Set(["--format", "--ignore"]);

/** Indexes of `lint`'s path operands in `args` (`args[0]` is "lint"). */
export function lintOperands(args) {
  const out = [];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      for (let j = i + 1; j < args.length; j++) out.push(j);
      break;
    }
    if (LINT_VALUES.has(a)) i++;
    else if (!a.startsWith("-")) out.push(i);
  }
  return out;
}

/**
 * For `lint`: each path operand that is a directory (or ".", the default, when there is none) and every
 * directory below it the CLI would walk: `{ "<dir as the CLI names it>": [[name, isDir], ...] }`. `native` are
 * the arguments as given, `named` as the CLI sees them (mapArgs). Files given by name need no listing, and
 * which files count is left to the CLI.
 */
export function listDirs(native, named, cwd) {
  const tree = {};
  const list = (dir, key) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    tree[key] = entries.map((e) => {
      let isDir = e.isDirectory();
      if (e.isSymbolicLink()) {
        try {
          isDir = statSync(path.join(dir, e.name)).isDirectory();
        } catch {
          isDir = false;
        }
      }
      return [e.name, isDir];
    });
    for (const [name, isDir] of tree[key]) {
      if (isDir && !name.startsWith(".") && !SKIP_DIRS.has(name)) {
        list(path.join(dir, name), key.endsWith("/") ? key + name : `${key}/${name}`);
      }
    }
  };
  const operands = lintOperands(native);
  if (operands.length === 0) list(cwd, ".");
  for (const i of operands) {
    const full = path.resolve(cwd, native[i]);
    try {
      if (statSync(full).isDirectory()) list(full, named[i]);
    } catch {
      // Missing: the CLI says so itself.
    }
  }
  return tree;
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
  // Windows takes either slash as a separator; elsewhere a backslash is part of a file name.
  const parts = p.sep === "\\" ? /[\\/]/ : "/";
  const posix = (abs) => "/" + abs.slice(p.parse(abs).root.length).split(parts).filter(Boolean).join("/");
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
