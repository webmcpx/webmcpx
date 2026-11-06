// webmcpx loader: registers the standard WebMCP tools. Owns the DOM and registerTool();
// all text processing runs in a WebAssembly module loaded on the first tool call.
import { CODES, TOOLS } from "./generated.js";

const RECORD = "\x1e";
const FIELD = "\x1f";
const KINDS = {
  H1: "h1", H2: "h2", H3: "h3", H4: "h4", H5: "h5", H6: "h6",
  P: "p", LI: "li", PRE: "pre", BLOCKQUOTE: "quote",
  DT: "p", DD: "p", FIGCAPTION: "p", SUMMARY: "p",
};
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "NAV", "FOOTER", "ASIDE"]);
const DEFAULT_TOOLS = ["get_page_context", "search_page", "fetch_as_markdown"];

const envelope = (body) => JSON.stringify(body);
const ok = (data) => envelope({ ok: true, data });
const err = (code, message, hint) =>
  envelope({ ok: false, error: { code, message, retryable: CODES[code] }, ...(hint && { hint }) });

let wasm;
const engine = (source) =>
  (wasm ??= import("../wasm/webmcpx_wasm.js")
    .then(async (m) => (await m.default(source ? { module_or_path: source } : undefined), m))
    .catch((e) => {
      wasm = undefined;
      throw e;
    }));

const pageUrl = () => location.href.split("#")[0];
const text = (s) => (s ?? "").replace(/\s+/g, " ").trim();

/** Serializes readable content of `root` as a block stream (see webmcpx-std `blocks`). */
function blocks(root) {
  let out = "";
  let anchor = "";
  const base = pageUrl();
  const visit = (el) => {
    for (const child of el.children) {
      if (SKIP.has(child.tagName) || child.hasAttribute("hidden") || child.getAttribute("aria-hidden") === "true") {
        continue;
      }
      if (child.id) anchor = `${base}#${child.id}`;
      // A table row is one block ("Monday | Closed"), so search keeps a value next to its label.
      const row = child.tagName === "TR" && [...child.children].map((c) => text(c.textContent)).join(" | ");
      const kind = row ? "p" : KINDS[child.tagName] ?? (child.children.length === 0 && "p");
      if (kind) out += kind + FIELD + (row || child.textContent) + FIELD + anchor + RECORD;
      else visit(child);
    }
  };
  visit(root);
  return out;
}

function contentRoot(root) {
  if (typeof root === "string") return document.querySelector(root) ?? document.body;
  return root ?? document.querySelector("main, [role=main], article") ?? document.body;
}

function pageContext() {
  const base = pageUrl();
  return ok({
    title: document.title,
    url: location.href,
    lang: document.documentElement.lang || undefined,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") || undefined,
    headings: [...document.querySelectorAll("h1, h2, h3")].slice(0, 30).map((h) => ({
      level: Number(h.tagName[1]),
      text: text(h.textContent).slice(0, 120),
      url: h.id ? `${base}#${h.id}` : undefined,
    })),
    selection: text(globalThis.getSelection?.()?.toString()).slice(0, 1000) || undefined,
  });
}

function executors(options) {
  const withEngine = (run) => async (input) => {
    let m;
    try {
      m = await engine(options.wasm);
    } catch (e) {
      return err("UNAVAILABLE", `WebAssembly could not load: ${e?.message ?? e}`,
        "If the page sets a Content-Security-Policy, add 'wasm-unsafe-eval' to script-src.");
    }
    return run(m, blocks(contentRoot(options.root)), input);
  };
  return {
    get_page_context: async () => pageContext(),
    search_page: withEngine((m, page, { query, limit }) =>
      typeof query === "string" ? m.search(page, query, limit ?? 0) : err("INVALID_INPUT", "`query` must be a string")),
    fetch_as_markdown: withEngine((m, page, { cursor, max_chars }) => m.markdown(page, String(cursor ?? ""), max_chars ?? 0)),
    search_site: async ({ query, limit = 5 }, { signal } = {}) => {
      if (typeof query !== "string" || !query.trim()) return err("INVALID_INPUT", "`query` must be a non-empty string");
      const found = await options.searchSite(query, { limit, signal });
      if (!found?.length) return err("NOT_FOUND", "no page matches the query", "Try fewer or different words.");
      return ok({ results: found.slice(0, limit).map(({ title, url, snippet }) => ({ title, url, snippet })) });
    },
  };
}

/** Tools resolve with an envelope and never reject: hosts drop rejection reasons (webmcp#282). */
const guard = (run) => async (input, client) => {
  try {
    return await run(typeof input === "string" ? JSON.parse(input || "{}") : input ?? {}, client);
  } catch (e) {
    return err("UNAVAILABLE", String(e?.message ?? e));
  }
};

/**
 * Registers webmcpx standard tools on the current document.
 * @param {import("./index").Options} [options]
 * @returns {Promise<import("./index").Registration>}
 */
export async function register(options = {}) {
  const mc = globalThis.document?.modelContext ?? globalThis.navigator?.modelContext;
  const controller = new AbortController();
  const result = { registered: [], failed: [], dispose: () => controller.abort() };
  if (typeof mc?.registerTool !== "function") return result;

  const run = executors(options);
  const names = options.tools ?? [...DEFAULT_TOOLS, ...(options.searchSite ? ["search_site"] : [])];
  await Promise.all(names.map(async (name) => {
    if (!TOOLS[name]) return result.failed.push({ name, error: "unknown tool" });
    if (name === "search_site" && !options.searchSite) {
      return result.failed.push({ name, error: "search_site needs options.searchSite" });
    }
    try {
      // Never assign onto `mc`: some agent browsers expose a frozen object (webmcp#293).
      await mc.registerTool({ ...TOOLS[name], execute: guard(run[name]) }, { signal: controller.signal });
      result.registered.push(name);
    } catch (e) {
      result.failed.push({ name, error: String(e?.message ?? e) });
    }
  }));
  result.registered.sort();
  return result;
}

export { TOOLS };
