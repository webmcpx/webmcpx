// The webmcpx standard tools, run by the agent bridge itself: the page is only read (through the
// loader's own `readPage`, evaluated by DevTools, which the page's CSP does not apply to) and the text
// engine runs here in Node. Nothing is injected into the page besides the W3C polyfill.
import { readFileSync } from "node:fs";
import { CODES, TOOLS } from "../src/generated.js";
import { readPage } from "../src/index.js";

export const STANDARD = ["get_page_context", "search_page", "fetch_as_markdown"];

/** Source of a page expression: `${READ_PAGE}("blocks")`. */
export const READ_PAGE = `(${readPage})`;

let engine;
const load = () =>
  (engine ??= import("../wasm/webmcpx_wasm.js").then(async (m) => {
    await m.default({ module_or_path: readFileSync(new URL("../wasm/webmcpx_wasm_bg.wasm", import.meta.url)) });
    return m;
  }));

const envelope = (body) => JSON.stringify(body);
const err = (code, message) => envelope({ ok: false, error: { code, message, retryable: CODES[code] } });

/** The standard tools as page-tool descriptors (`standard: true`), for listing next to the site's. */
export const standardTools = () =>
  STANDARD.map((name) => {
    const { description, inputSchema, annotations } = TOOLS[name];
    return { name, description, inputSchema, annotations: { ...annotations }, standard: true };
  });

/**
 * Runs a standard tool. `read(what)` returns `readPage(what)` evaluated in the page.
 * Resolves with the same envelope the in-page tool would return.
 */
export async function runStandard(name, input = {}, read) {
  if (name === "get_page_context") return envelope({ ok: true, data: await read("context") });
  const page = await read("blocks");
  const m = await load();
  if (name === "search_page") {
    return typeof input.query === "string"
      ? m.search(page, input.query, input.limit ?? 0)
      : err("INVALID_INPUT", "`query` must be a string");
  }
  if (name === "fetch_as_markdown") return m.markdown(page, String(input.cursor ?? ""), input.max_chars ?? 0);
  return err("NOT_FOUND", `no standard tool named ${name}`);
}
