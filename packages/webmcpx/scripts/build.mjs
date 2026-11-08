// Builds dist/, what browsers and bundlers load, minified. src/ stays the readable source (agent/ runs
// readPage from it and the types live there).
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { build, transform } from "esbuild";

const common = { outdir: "dist", bundle: true, format: "esm", minify: true, target: "es2022", legalComments: "none", logLevel: "warning" };
rmSync("dist", { recursive: true, force: true });
// The drop-in <script>: one request on load; forms (tool.js) and the WebAssembly glue stay lazy.
await build({ ...common, entryPoints: ["src/auto.js"], external: ["./tool.js", "../wasm/*"] });
// The imports: shared code in chunks.
await build({
  ...common,
  entryPoints: ["index", "tool", "react", "vue", "svelte"].map((e) => `src/${e}.js`),
  splitting: true,
  chunkNames: "[name]-[hash]",
  external: ["react", "vue", "svelte", "../wasm/*"],
});
// The wasm-bindgen glue (from `just wasm`), minified in place.
const glue = "wasm/webmcpx_wasm.js";
if (existsSync(glue)) {
  const { code } = await transform(readFileSync(glue, "utf8"), { format: "esm", minify: true, target: "es2022", legalComments: "none" });
  writeFileSync(glue, code);
}
