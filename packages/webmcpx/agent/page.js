// One tab in the agent's browser. Before any page script runs, it installs the W3C WebMCP polyfill
// (https://github.com/w3c-oss/webmcp-polyfill), so a site's own registerTool() calls work in any
// Chromium, with no flag. Nothing else is injected, and the page's CSP stays on. Tools are listed and
// called only through the spec's consumer methods, document.modelContext.getTools() and executeTool(),
// on the very descriptors getTools() returned (they keep the owning frame).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { READ_PAGE } from "./standard.js";

const POLYFILL = readFileSync(fileURLToPath(new URL("polyfill.js", import.meta.resolve("@w3c/webmcp-polyfill"))), "utf8");
const CHANGED = "__webmcpxToolsChanged";
// Runs in every new document, before the page's scripts. An iframe's initial about:blank is special:
// when it navigates to a same-origin page, Chrome keeps its Window and does not run this again, and a
// polyfill installed in the blank document would talk to frames through state tied to that discarded
// document (no discovery across frames). So there it installs on first use, from the real document.
const BOOT = `(() => {
  const install = () => {
${POLYFILL}
  };
  if (window !== window.top && document.URL === "about:blank") {
    const proto = Document.prototype;
    Object.defineProperty(proto, "modelContext", {
      configurable: true,
      enumerable: true,
      get() {
        delete proto.modelContext;
        install();
        return this.modelContext;
      },
    });
    return;
  }
  install();
  const mc = document.modelContext;
  if (window === window.top && typeof mc?.addEventListener === "function" && typeof ${CHANGED} === "function") {
    mc.addEventListener("toolchange", () => ${CHANGED}(""));
  }
})();`;

const GET_TOOLS = `(async () => {
  const mc = document.modelContext;
  return typeof mc?.getTools === "function" ? await mc.getTools() : null;
})()`;

// Called on the array getTools() returned: plain summaries, by index.
function summarize() {
  const parse = (s) => {
    try {
      return typeof s === "string" ? JSON.parse(s) : s;
    } catch {
      return undefined;
    }
  };
  return this.map((t, index) => ({
    index,
    name: t.name,
    description: t.description ?? "",
    inputSchema: parse(t.inputSchema),
    annotations: { ...(t.annotations ?? {}) },
    origin: t.origin,
  }));
}

// Called on the same array: runs one descriptor. executeTool() returns the result JSON-serialized; a tool
// that returned a string (like the webmcpx envelope) comes back as a JSON string literal: unwrap it once.
async function execute(index, input) {
  const out = await document.modelContext.executeTool(this[index], input);
  let value = out;
  try {
    value = typeof out === "string" ? JSON.parse(out) : out;
  } catch {
    // not JSON: keep the text
  }
  return typeof value === "string" ? value : JSON.stringify(value ?? null);
}

const GROUP = "webmcpx-tools";
const LOAD_TIMEOUT = 30_000;
const CALL_TIMEOUT = 60_000;
const SETTLE = { min: 400, max: 3_000, every: 200 };
// Unref'd: a pending timeout must never keep the CLI alive after its work is done.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms).unref());
const timeout = (ms, what) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${what} took longer than ${ms / 1000} s`)), ms).unref();
  });

/** Whether an error means the page navigated or the tool list was replaced since it was read. */
export const stale = (e) =>
  /Could not find object|Cannot find context|context was destroyed|Inspected target navigated/i.test(e?.message);

export class Page {
  #cdp;
  #session;
  #onChange;
  #loads = new Set();
  #handles = [];
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
    await this.#send("Runtime.addBinding", { name: CHANGED });
    await this.#send("Page.addScriptToEvaluateOnNewDocument", { source: BOOT });
  }

  #event({ method, params }) {
    if (method === "Page.javascriptDialogOpening") {
      // An alert() would block every later call: dismiss it, like a user closing it.
      this.#send("Page.handleJavaScriptDialog", { accept: false }).catch(() => {});
    } else if (method === "Page.loadEventFired") {
      for (const resolve of this.#loads) resolve();
      this.#loads.clear();
      this.#changed(); // a new document: a new tool list
    } else if (method === "Runtime.bindingCalled" && params.name === CHANGED) {
      this.#changed();
    }
  }

  #changed() {
    clearTimeout(this.#debounce);
    this.#debounce = setTimeout(() => this.#onChange(), 150);
  }

  async #evaluate(expression, ms = CALL_TIMEOUT) {
    const run = this.#send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    const { result, exceptionDetails } = await Promise.race([run, timeout(ms, "the page")]);
    if (exceptionDetails) throw new Error(describeException(exceptionDetails));
    return result.value;
  }

  /**
   * Navigates and waits for the tool list to settle.
   * @returns {Promise<{url: string, title: string, tools: PageTool[] | null}>} `tools` is null without WebMCP
   * (outside a secure context).
   */
  async open(url) {
    // The old document's tool lists die with it.
    await this.#send("Runtime.releaseObjectGroup", { objectGroup: GROUP }).catch(() => {});
    this.#handles = [];
    const loaded = new Promise((resolve) => this.#loads.add(resolve));
    const nav = await this.#send("Page.navigate", { url });
    if (nav.errorText) throw new Error(`could not open ${url}: ${nav.errorText}`);
    if (nav.loaderId) await Promise.race([loaded, wait(LOAD_TIMEOUT)]);
    const tools = await this.#settle();
    const { url: at, title } = await this.#evaluate("({ url: location.href, title: document.title })");
    return { url: at, title, tools };
  }

  /** Polls until the tool list has been stable for a moment (sites often register after load). */
  async #settle() {
    const start = Date.now();
    const names = (list) => JSON.stringify(list?.map((t) => t.name));
    let last = await this.tools();
    while (Date.now() - start < SETTLE.max) {
      await wait(SETTLE.every);
      const now = await this.tools();
      const same = names(now) === names(last);
      last = now;
      if (same && Date.now() - start >= SETTLE.min) break;
    }
    return last;
  }

  /**
   * Reads the page's tools. Each keeps the `index` of its descriptor in this list, which `call` runs:
   * same-named tools in different frames stay distinct. Null without `document.modelContext`.
   * @returns {Promise<PageTool[] | null>}
   */
  async tools() {
    const run = this.#send("Runtime.evaluate", { expression: GET_TOOLS, awaitPromise: true, objectGroup: GROUP });
    const { result, exceptionDetails } = await Promise.race([run, timeout(CALL_TIMEOUT, "the page")]);
    if (exceptionDetails) throw new Error(describeException(exceptionDetails));
    if (!result.objectId) return null;
    const { result: list } = await this.#send("Runtime.callFunctionOn", {
      objectId: result.objectId,
      functionDeclaration: summarize.toString(),
      returnByValue: true,
    });
    // Each tool keeps the very list it came from: a call runs on that descriptor, so it reaches the
    // owning frame or fails if that owner unregistered it; it never shifts to another tool.
    this.#handles.push(result.objectId);
    if (this.#handles.length > 50) {
      this.#send("Runtime.releaseObject", { objectId: this.#handles.shift() }).catch(() => {});
    }
    const count = new Map();
    for (const t of list.value) count.set(`${t.origin} ${t.name}`, (count.get(`${t.origin} ${t.name}`) ?? 0) + 1);
    return list.value.map((tool) => ({
      ...tool,
      list: result.objectId,
      unique: count.get(`${tool.origin} ${tool.name}`) === 1,
    }));
  }

  /** Runs a tool on the list it came from; resolves with its result text. */
  async call(tool, input) {
    const run = this.#send("Runtime.callFunctionOn", {
      objectId: tool.list,
      functionDeclaration: execute.toString(),
      arguments: [{ value: tool.index }, { value: input ?? {} }],
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    const { result, exceptionDetails } = await Promise.race([run, timeout(CALL_TIMEOUT, "the tool")]);
    if (exceptionDetails) throw new Error(describeException(exceptionDetails));
    return result.value;
  }

  /** The loader's `readPage(what)`, evaluated in the page (for the standard tools). */
  read(what) {
    return this.#evaluate(`${READ_PAGE}(${JSON.stringify(what)})`);
  }
}

const describeException = (d) => d.exception?.description?.split("\n")[0] ?? d.text;

/** @typedef {{index: number, list: string, unique: boolean, name: string, description: string, inputSchema?: object, annotations: Record<string, boolean>, origin?: string}} PageTool */
