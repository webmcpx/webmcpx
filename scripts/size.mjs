// Size gate: fails when a shipped file exceeds its brotli budget. Run via `just size`.
import { readdirSync, readFileSync } from "node:fs";
import { brotliCompressSync, constants } from "node:zlib";

const PKG = new URL("../packages/webmcpx/", import.meta.url);
const BUDGETS = [
  // Loaded on every page: loader + tool contracts. 10 KB is still small for a page; correctness first.
  { name: "on load (dist/auto.js)", files: ["dist/auto.js"], max: 10_240 },
  // Loaded only by pages with a <form toolname> and by sites that import tool(); most of it is the
  // input checker that keeps invalid input away from the site's own code (JSON Schema keywords and
  // combinators tool inputs use), so it is budgeted for correctness, not squeezed.
  { name: "own tools and forms (dist/tool.js + its chunk)", files: ["dist/tool.js", ...readdirSync(new URL("dist/", PKG)).filter((f) => f.startsWith("chunk-")).map((f) => `dist/${f}`)], max: 5_700 },
  // Loaded on the first tool call only (13 KB: output budgets in search_page cost ~30 B; correctness first).
  { name: "wasm module", files: ["wasm/webmcpx_wasm_bg.wasm"], max: 13_312 },
  { name: "wasm glue", files: ["wasm/webmcpx_wasm.js"], max: 2_200 },
];

let failed = false;
for (const { name, files, max } of BUDGETS) {
  const bytes = Buffer.concat(files.map((f) => readFileSync(new URL(f, PKG))));
  const size = brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
  const ok = size <= max;
  failed ||= !ok;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${size} B brotli (budget ${max} B)`);
}
process.exit(failed ? 1 : 0);
