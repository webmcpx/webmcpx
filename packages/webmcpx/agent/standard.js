// The webmcpx standard tools, run by the agent bridge itself: the page is only read (through the
// loader's own `readPage`, evaluated by DevTools, which the page's CSP does not apply to) and the text
// engine runs here in Node. Nothing is injected into the page besides the W3C polyfill.
import { readFileSync } from "node:fs";
import { CODES, TOOLS } from "../src/generated.js";
import { readPage } from "../src/loader.js";

export const STANDARD = ["get_page_context", "search_page", "fetch_as_markdown"];

/** Source of a page expression: `${READ_PAGE}("blocks")`. */
export const READ_PAGE = `(${readPage})`;

let engine;
const load = () =>
  (engine ??= import("../wasm/webmcpx_wasm.js")
    .then(async (m) => {
      await m.default({ module_or_path: readFileSync(new URL("../wasm/webmcpx_wasm_bg.wasm", import.meta.url)) });
      return m;
    })
    .catch((e) => {
      engine = undefined;
      throw e;
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
 * Like the in-page tools, it never rejects: any input and any failure yield an envelope.
 */
export async function runStandard(name, input, read) {
  const args = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  try {
    if (name === "get_page_context") return envelope({ ok: true, data: await read("context") });
    if (name === "search_page" && typeof args.query !== "string") return err("INVALID_INPUT", "`query` must be a string");
    const page = await read("blocks");
    let m;
    try {
      m = await load();
    } catch (e) {
      return err("UNAVAILABLE", `the text engine could not load: ${e?.message ?? e}`);
    }
    if (name === "search_page") return m.search(page, args.query, args.limit ?? 0);
    if (name === "fetch_as_markdown") return m.markdown(page, String(args.cursor ?? ""), args.max_chars ?? 0);
    return err("NOT_FOUND", `no standard tool named ${name}`);
  } catch (e) {
    return err("UNAVAILABLE", String(e?.message ?? e));
  }
}
