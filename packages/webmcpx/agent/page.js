// One tab in the agent's browser. Before any page script runs, it installs the W3C WebMCP polyfill
// (https://github.com/w3c-oss/webmcp-polyfill), so a site's own registerTool() calls work in any
// Chromium, with no flag. After each load it adds the webmcpx standard tools. Tools are listed and
// called through the spec's own consumer methods: document.modelContext.getTools() and executeTool().
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The reserved .invalid TLD never resolves: requests to it are answered from this package, in the
// browser's request interception, so the loader works on any site whatever its CSP or network.
const ORIGIN = "https://webmcpx.invalid";
const SERVED = {
  "/src/index.js": "text/javascript",
  "/src/generated.js": "text/javascript",
  "/wasm/webmcpx_wasm.js": "text/javascript",
  "/wasm/webmcpx_wasm_bg.wasm": "application/wasm",
};
const PKG = new URL("../", import.meta.url);
const files = new Map();
const served = (path) => {
  if (!files.has(path)) files.set(path, readFileSync(new URL(`.${path}`, PKG)).toString("base64"));
  return files.get(path);
};

const POLYFILL = readFileSync(fileURLToPath(new URL("polyfill.js", import.meta.resolve("@w3c/webmcp-polyfill"))), "utf8");
const CHANGED = "__webmcpxToolsChanged";
// Runs in every new document, before the page's scripts.
const BOOT = `${POLYFILL}
;(() => {
  const mc = document.modelContext;
  if (typeof mc?.addEventListener === "function" && typeof ${CHANGED} === "function") {
    mc.addEventListener("toolchange", () => ${CHANGED}(""));
  }
})();`;

const STANDARD = `import(${JSON.stringify(`${ORIGIN}/src/index.js`)})
  .then((m) => m.register())
  .then(({ registered, failed }) => ({ registered, failed }), (e) => ({ error: String(e?.message ?? e) }))`;

const LIST = `(async () => {
  const mc = document.modelContext;
  if (typeof mc?.getTools !== "function") return null;
  const parse = (s) => { try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return undefined; } };
  return (await mc.getTools()).map((t) => ({
    name: t.name,
    description: t.description ?? "",
    inputSchema: parse(t.inputSchema) ?? { type: "object", properties: {} },
    annotations: { ...(t.annotations ?? {}) },
    origin: t.origin,
  }));
})()`;

const CALL = (name, input) => `(async () => {
  const mc = document.modelContext;
  const tool = (await mc.getTools()).find((t) => t.name === ${JSON.stringify(name)});
  if (!tool) return { missing: true };
  // executeTool() returns the result JSON-serialized; a tool that returned a string (like the
  // webmcpx envelope) comes back as a JSON string literal, so unwrap it once.
  const out = await mc.executeTool(tool, ${JSON.stringify(input ?? {})});
  let value = out;
  try { value = typeof out === "string" ? JSON.parse(out) : out; } catch {}
  return { out: typeof value === "string" ? value : JSON.stringify(value ?? null) };
})()`;

const LOAD_TIMEOUT = 30_000;
const CALL_TIMEOUT = 60_000;
const SETTLE = { min: 400, max: 3_000, every: 200 };
// Unref'd: a pending timeout must never keep the CLI alive after its work is done.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms).unref());
const timeout = (ms, what) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${what} took longer than ${ms / 1000} s`)), ms).unref();
  });

export class Page {
  #cdp;
  #session;
  #onChange;
  #opening = false;
  #loads = new Set();
  #debounce;

  /** Opens a new tab. `onChange()` fires when the page's tools may have changed on their own. */
  static async create(cdp, { onChange = () => {} } = {}) {
    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
    const page = new Page(cdp, sessionId, onChange);
    await page.#init();
    return page;
  }

  constructor(cdp, session, onChange) {
    this.#cdp = cdp;
    this.#session = session;
    this.#onChange = onChange;
    cdp.on((msg) => msg.sessionId === session && this.#event(msg));
  }

  #send(method, params) {
    return this.#cdp.send(method, params, this.#session);
  }

  async #init() {
    await Promise.all([this.#send("Page.enable"), this.#send("Runtime.enable")]);
    await this.#send("Page.setBypassCSP", { enabled: true });
    await this.#send("Runtime.addBinding", { name: CHANGED });
    await this.#send("Page.addScriptToEvaluateOnNewDocument", { source: BOOT });
    await this.#send("Fetch.enable", { patterns: [{ urlPattern: `${ORIGIN}/*`, requestStage: "Request" }] });
  }

  #event({ method, params }) {
    if (method === "Fetch.requestPaused") return this.#serve(params);
    if (method === "Page.javascriptDialogOpening") {
      // An alert() would block every later call: dismiss it, like a user closing it.
      return this.#send("Page.handleJavaScriptDialog", { accept: false }).catch(() => {});
    }
    if (method === "Page.loadEventFired") {
      for (const resolve of this.#loads) resolve();
      this.#loads.clear();
      // A load the agent did not ask for (a link, a tool that navigates): the new page needs its tools.
      if (!this.#opening) this.#standard().then(() => this.#changed());
      return;
    }
    if (method === "Runtime.bindingCalled" && params.name === CHANGED) this.#changed();
  }

  #changed() {
    clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#onChange(), 150);
  }

  #serve({ requestId, request }) {
    const path = new URL(request.url).pathname;
    const type = SERVED[path];
    if (!type) return this.#send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(() => {});
    return this.#send("Fetch.fulfillRequest", {
      requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: type },
        { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Cross-Origin-Resource-Policy", value: "cross-origin" },
      ],
      body: served(path),
    }).catch(() => {});
  }

  async #evaluate(expression, ms = CALL_TIMEOUT) {
    const run = this.#send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    const { result, exceptionDetails } = await Promise.race([run, timeout(ms, "the page")]);
    if (exceptionDetails) {
      throw new Error(exceptionDetails.exception?.description?.split("\n")[0] ?? exceptionDetails.text);
    }
    return result.value;
  }

  /** Registers the standard tools (duplicates of the site's own are skipped by the host). */
  #standard() {
    return this.#evaluate(STANDARD, LOAD_TIMEOUT).catch((e) => ({ error: e.message }));
  }

  /**
   * Navigates, adds the standard tools and waits for the tool list to settle.
   * @returns {Promise<{url: string, title: string, tools: Tool[] | null}>} `tools` is null outside a secure context.
   */
  async open(url) {
    this.#opening = true;
    try {
      const loaded = new Promise((resolve) => this.#loads.add(resolve));
      const nav = await this.#send("Page.navigate", { url });
      if (nav.errorText) throw new Error(`could not open ${url}: ${nav.errorText}`);
      if (nav.loaderId) await Promise.race([loaded, wait(LOAD_TIMEOUT)]);
      await this.#standard();
      const tools = await this.#settle();
      const { url: at, title } = await this.#evaluate("({ url: location.href, title: document.title })");
      return { url: at, title, tools };
    } finally {
      this.#opening = false;
    }
  }

  /** Polls until the tool list has been stable for a moment (sites often register after load). */
  async #settle() {
    const start = Date.now();
    let last = await this.tools();
    while (Date.now() - start < SETTLE.max) {
      await wait(SETTLE.every);
      const now = await this.tools();
      const same = JSON.stringify(now?.map((t) => t.name)) === JSON.stringify(last?.map((t) => t.name));
      last = now;
      if (same && Date.now() - start >= SETTLE.min) break;
    }
    return last;
  }

  /** @returns {Promise<Tool[] | null>} The page's tools, or null without `document.modelContext`. */
  tools() {
    return this.#evaluate(LIST);
  }

  /** Calls a tool; resolves with its result text (webmcpx tools return a JSON envelope). */
  async call(name, input) {
    const value = await this.#evaluate(CALL(name, input));
    if (value?.missing) throw new Error(`this page has no tool named "${name}"`);
    return value.out;
  }
}

/** @typedef {{name: string, description: string, inputSchema: object, annotations: Record<string, boolean>, origin?: string}} Tool */
