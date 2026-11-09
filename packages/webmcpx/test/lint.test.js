// `npx webmcpx lint|rules|rule|explain`: the Rust CLI as WebAssembly (wasm/webmcpx_cli.wasm, from `just wasm`),
// run by bin/rust.js. Same output, --fix and exit codes as the native CLI, with no Rust toolchain.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { lintOperands, listDirs } from "../bin/rust.js";
import { fileURLToPath } from "node:url";

const BIN = fileURLToPath(new URL("../bin/webmcpx.js", import.meta.url));
const run = (args, cwd) => spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8" });

function project() {
  const dir = mkdtempSync(join(tmpdir(), "webmcpx-lint-"));
  mkdirSync(join(dir, "src"));
  writeFileSync(
    join(dir, "src", "tools.js"),
    'document.modelContext.registerTool({ name: "bad name", description: "Find​ things.", annotations: { readOnlyHint: true }, execute() {} });\n'
  );
  return dir;
}

test("lint finds errors, exits 1, and prints paths as given", () => {
  const dir = project();
  const out = run(["lint", "src", "--format", "concise"], dir);
  assert.equal(out.status, 1, out.stderr);
  assert.match(out.stdout, /^src\/tools\.js:1:\d+: error \[invalid-name\]/m);
  assert.match(out.stdout, /error \[invisible-unicode\]/);
  assert.doesNotMatch(out.stderr, /WASI/, "the experimental-WASI warning is not for users");
  // From a subdirectory, a ../ path works as it does natively.
  const up = run(["lint", "../src/tools.js", "--format", "concise"], join(dir, "src"));
  assert.match(up.stdout, /^\.\.\/src\/tools\.js:1:/m);
  // An absolute path, too.
  assert.equal(run(["lint", join(dir, "src")], tmpdir()).status, 1);
});

test("lint --format json follows the versioned schema", () => {
  const out = run(["lint", "--format", "json"], project());
  const json = JSON.parse(out.stdout);
  assert.equal(out.status, 1);
  assert.equal(json.ok, false, "lint errors make the envelope not ok");
  assert.equal(typeof json.schema_version, "number");
  assert.ok(json.data.diagnostics.some((d) => d.rule === "invalid-name" && d.file === "src/tools.js"));
});

test("lint --fix rewrites the file in place", () => {
  const dir = project();
  run(["lint", "src", "--fix"], dir);
  assert.doesNotMatch(readFileSync(join(dir, "src", "tools.js"), "utf8"), /​/);
});

test("usage and I/O failures exit 2; rules, rule and explain answer", () => {
  assert.equal(run(["lint", "missing"], project()).status, 2);
  assert.equal(run(["lint", "--ignore", "no-such-rule"], project()).status, 2);
  assert.match(execFileSync(process.execPath, [BIN, "rules"], { encoding: "utf8" }), /invalid-name/);
  assert.match(execFileSync(process.execPath, [BIN, "rule", "invalid-name"], { encoding: "utf8" }), /invalid-name \(error\)/);
  assert.match(execFileSync(process.execPath, [BIN, "explain", "RATE_LIMITED"], { encoding: "utf8" }), /RATE_LIMITED/);
});

test("Windows: a path on another drive or share is refused, never mapped onto this drive", async () => {
  const { win32 } = await import("node:path");
  const { mapArgs } = await import("../bin/rust.js");
  const cwd = "C:\\repo";
  assert.deepEqual(mapArgs(["lint", "C:\\repo\\src", "src", "..\\x"], cwd, win32), {
    args: ["lint", "/repo/src", "src", "..\\x"],
    root: "C:\\",
    pwd: "/repo"
  });
  assert.equal(mapArgs(["lint", "c:\\Repo\\a.js"], cwd, win32).args[1], "/Repo/a.js", "drive letters ignore case");
  assert.equal(mapArgs(["lint", "C:/repo/src/tools.js"], cwd, win32).args[1], "/repo/src/tools.js", "forward slashes");
  assert.equal(mapArgs(["lint", "\\repo\\src"], cwd, win32).args[1], "/repo/src", "a bare root is this drive");
  for (const other of ["D:\\repo\\src\\tools.js", "D:src", "\\\\server\\share\\a.js"]) {
    assert.match(mapArgs(["lint", other, "--fix"], cwd, win32).error, /not on the same drive/, other);
  }
});

test("POSIX: a backslash is part of a file name, in arguments and in the working directory", async () => {
  const { posix } = await import("node:path");
  const { mapArgs } = await import("../bin/rust.js");
  assert.deepEqual(mapArgs(["lint", "/repo/src\\tools.js"], "/home/a\\b", posix), {
    args: ["lint", "/repo/src\\tools.js"],
    root: "/",
    pwd: "/home/a\\b"
  });
});

// Node's WASI can't list directories on Windows (fd_readdir is ENOSYS there), so bin/rust.js lists them
// for the CLI there. Forced here on every OS, so the path every Windows user takes is tested everywhere.
test("lint walks directories from the host's listing (the Windows path)", () => {
  const dir = project();
  mkdirSync(join(dir, "src", "deep"));
  writeFileSync(join(dir, "src", "deep", "more.ts"), 'navigator.modelContext.registerTool({ name: "x", description: "", execute() {} });\n');
  mkdirSync(join(dir, "node_modules"));
  writeFileSync(join(dir, "node_modules", "dep.js"), 'document.modelContext.registerTool({ name: "bad name" });\n');
  const forced = (args, cwd) =>
    spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: "utf8", env: { ...process.env, WEBMCPX_HOST_LISTING: "1" } });
  for (const args of [["lint", "--format", "concise"], ["lint", "src", "--format", "concise"], ["lint", "src/", "--format", "concise"]]) {
    const out = forced(args, dir);
    assert.equal(out.status, 1, `${args.join(" ")}: ${out.stderr}`);
    assert.match(out.stdout, /src\/tools\.js:1:\d+: error \[invalid-name\]/);
    assert.match(out.stdout, /src\/deep\/more\.ts:1:/);
    assert.doesNotMatch(out.stdout, /node_modules/);
  }
  // The same output as the CLI's own walk.
  assert.equal(forced(["lint", "src", "--format", "concise"], dir).stdout, run(["lint", "src", "--format", "concise"], dir).stdout);
  // An empty directory: nothing to lint, as natively.
  mkdirSync(join(dir, "empty"));
  assert.equal(forced(["lint", "empty"], dir).status, run(["lint", "empty"], dir).status);
});

test("the host listing covers lint's directory operands only", () => {
  assert.deepEqual(lintOperands(["lint", "src", "--format", "json", "--ignore", "x", "lib", "--fix"]), [1, 6]);
  assert.deepEqual(lintOperands(["lint", "--format", "concise"]), []);
  assert.deepEqual(lintOperands(["lint", "--", "--weird"]), [2]);
  const dir = project();
  mkdirSync(join(dir, "other"));
  // A directory operand: that tree only, not the working directory's.
  assert.deepEqual(Object.keys(listDirs(["lint", "src"], ["lint", "src"], dir)), ["src"]);
  // A file operand: nothing to list.
  assert.deepEqual(listDirs(["lint", "src/tools.js"], ["lint", "src/tools.js"], dir), {});
  // No operand: the working directory, as the CLI's default.
  assert.deepEqual(Object.keys(listDirs(["lint"], ["lint"], dir)).sort(), [".", "./other", "./src"]);
});
