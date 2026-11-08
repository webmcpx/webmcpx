// Builds dist/: the drop-in <script> served from a CDN, minified, since no bundler sits between it and
// the page. Imports from npm (webmcpx, /react, /vue, /svelte) resolve to the readable src/, which the
// app's own bundler minifies; agent/ also runs readPage from src/, and the types live there.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { build, transform } from "esbuild";

const common = { outdir: "dist", bundle: true, format: "esm", minify: true, target: "es2022", legalComments: "none", logLevel: "warning" };
rmSync("dist", { recursive: true, force: true });
// One request on load; forms (tool.js) and the WebAssembly glue stay lazy.
await build({ ...common, entryPoints: ["src/auto.js"], external: ["./tool.js", "../wasm/*"] });
await build({ ...common, entryPoints: ["src/tool.js"], external: ["../wasm/*"] });
// The wasm-bindgen glue (from `just wasm`), minified in place: the drop-in script loads it as is.
const glue = "wasm/webmcpx_wasm.js";
if (existsSync(glue)) {
  const { code } = await transform(readFileSync(glue, "utf8"), { format: "esm", minify: true, target: "es2022", legalComments: "none" });
  writeFileSync(glue, code);
}
