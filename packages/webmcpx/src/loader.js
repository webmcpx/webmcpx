// The standard tools: DOM and registerTool() here, text work in WebAssembly (loaded on first call).
import { CODES, TOOLS } from "./generated.js";

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

// "blocks": main content as a webmcpx-std block stream; "context": the page. Self-contained:
// agent/ runs its source in pages. Internal, not public API.
export function readPage(what, root) {
  const RECORD = "\x1e";
  const FIELD = "\x1f";
  const KINDS = {
    H1: "h1", H2: "h2", H3: "h3", H4: "h4", H5: "h5", H6: "h6",
    P: "p", LI: "li", PRE: "pre", BLOCKQUOTE: "quote",
    DT: "p", DD: "p", FIGCAPTION: "p", SUMMARY: "p",
  };
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "NAV", "FOOTER", "ASIDE"]);
  const base = location.href.split("#")[0];
  const text = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  if (what === "context") {
    return {
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
    };
  }
  const css = (el) => globalThis.getComputedStyle?.(el) ?? {};
  const hidden = (el) => el.hasAttribute("hidden") || el.getAttribute("aria-hidden") == "true" || css(el).display == "none";
  // Boilerplate (nav, footer, aside...) is skipped inside a root, but a root may sit in one.
  const skipped = (el) => SKIP.has(el.tagName) || hidden(el);
  // visibility is inherited and a child can undo it, so it is checked per text node.
  const data = (n) => (css(n.parentNode).visibility == "hidden" ? "" : n.data);
  // Visible text; an element with no block inside is one block.
  const textOf = (el) =>
    [...el.childNodes].map((n) => (n.nodeType === 3 ? data(n) : n.nodeType === 1 && !skipped(n) ? textOf(n) : "")).join("");
  const BLOCKS = Object.keys(KINDS) + ",div,section,article,main,ul,ol,dl,table,tr,form,header,figure,details";
  let out = "";
  let anchor = "";
  const add = (kind, s) => text(s) && (out += kind + FIELD + s + FIELD + anchor + RECORD);
  const visit = (el) => {
    for (const child of el.childNodes) {
      if (child.nodeType === 3) add("p", data(child));
      if (child.nodeType !== 1 || skipped(child)) continue;
      if (child.id) anchor = `${base}#${child.id}`;
      // A table row is one block ("Monday | Closed"), so search keeps a value next to its label.
      const row = child.tagName === "TR" && [...child.children].filter((c) => !skipped(c)).map((c) => text(textOf(c))).filter(Boolean).join(" | ");
      const kind = row ? "p" : KINDS[child.tagName] ?? (!child.querySelector(BLOCKS) && "p");
      if (kind) add(kind, row || textOf(child));
      else visit(child);
    }
  };
  const shown = (el) => !el || !hidden(el) && shown(el.parentElement);
  for (const el of root ? [root] : [...document.querySelectorAll("main, [role=main], article"), document.body]) {
    anchor = "";
    if (shown(el) && (visit(el), out)) break;
  }
  return out;
}

const contentRoot = (root) => (typeof root === "string" ? document.querySelector(root) ?? document.body : root);

function executors(options) {
  const withEngine = (run) => async (input) => {
    let m;
    try {
      m = await engine(options.wasm);
    } catch (e) {
      return err("UNAVAILABLE", `WebAssembly could not load: ${e?.message ?? e}`,
        "If the page sets a Content-Security-Policy, add 'wasm-unsafe-eval' to script-src.");
    }
    return run(m, readPage("blocks", contentRoot(options.root)), input);
  };
  return {
    get_page_context: async () => ok(readPage("context")),
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

/** Registers the standard tools (types: index.d.ts). */
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
