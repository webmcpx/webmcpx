// `npx webmcpx lint|rules|rule|explain`: the Rust CLI as WebAssembly (wasm/webmcpx_cli.wasm, from `just wasm`),
// run by bin/rust.js. Same output, --fix and exit codes as the native CLI, with no Rust toolchain.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
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
