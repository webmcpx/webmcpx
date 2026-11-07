// What the CLI and the MCP server share: one browser (started on first use), one tab, and the tool list
// the agent sees: the page's own tools plus the standard ones the page does not already have.
import { attach, launch } from "./browser.js";
import { Page, stale } from "./page.js";
import { runStandard, standardTools } from "./standard.js";

export class Session {
  #options;
  #browser;
  #page;
  #ready;
  #closed = false;
  #queue = Promise.resolve();

  /** @param {{headed?: boolean, browser?: string, cdp?: string, onChange?: () => void, callTimeout?: number}} options */
  constructor(options = {}) {
    this.#options = options;
  }

  #start() {
    if (this.#closed) return Promise.reject(new Error("the session is closed"));
    this.#ready ??= (async () => {
      const { cdp, headed, browser, onChange, callTimeout } = this.#options;
      const opened = cdp ? await attach(cdp) : await launch({ headed, executable: browser });
      // Closed while the browser was starting: shut it instead of leaving it running.
      if (this.#closed) {
        opened.close();
        throw new Error("the session is closed");
      }
      this.#browser = opened;
      // A browser that quits or crashes is started again on the next page.
      opened.cdp.onClose(() => {
        if (this.#browser === opened) [this.#browser, this.#ready, this.#page] = [];
      });
      return Page.create(opened.cdp, { onChange, callTimeout });
    })().catch((e) => {
      this.#ready = undefined;
      throw e;
    });
    return this.#ready;
  }

  /** Runs page work one at a time: there is one tab, so a navigation must not interleave with a call. */
  #serial(work) {
    const run = this.#queue.then(work);
    this.#queue = run.catch(() => {});
    return run;
  }

  /** @returns {Promise<{url: string, title: string, tools: Tool[] | null}>} */
  goto(url) {
    return this.#serial(async () => {
      this.#page = await this.#start();
      const page = await this.#page.open(normalize(url));
      return { ...page, tools: page.tools && withStandard(page.tools) };
    });
  }

  /** The current tool list (empty before a page is open, or without WebMCP). */
  tools() {
    return this.#serial(async () => (this.#page ? withStandard((await this.#page.tools()) ?? []) : []));
  }

  /** Calls a tool from the latest list; a page tool whose list went stale is found again by name and origin. */
  call(tool, input) {
    return this.#serial(async () => {
      if (!this.#page) throw new Error("no page is open yet: call open_page first");
      const page = this.#page;
      if (tool.standard) return runStandard(tool.name, input, (what) => page.read(what));
      try {
        return await page.call(tool, input);
      } catch (e) {
        if (!stale(e)) throw e;
        // The document the tool was listed in is gone: run the same tool in the new one only when no
        // other tool shares its name and origin there or then; otherwise refuse rather than guess.
        const now = ((await page.tools()) ?? []).filter((t) => t.name === tool.name && t.origin === tool.origin);
        const again = tool.unique && now.length === 1 ? now[0] : undefined;
        if (!again) throw new Error(`the page changed and no longer has the tool "${tool.name}": call open_page again`);
        return page.call(again, input);
      }
    });
  }

  /** Closes our tab and the browser (or only our tab's connection, in a browser we attached to). */
  async close() {
    this.#closed = true;
    const page = await this.#ready?.catch(() => undefined);
    await page?.close();
    this.#browser?.close();
  }
}

/** The page's tools, then each standard tool the page does not already register. */
function withStandard(tools) {
  const names = new Set(tools.map((t) => t.name));
  return [...tools, ...standardTools().filter((t) => !names.has(t.name))];
}

/** `example.com` → `https://example.com`; `localhost:3000` → `http://localhost:3000`. */
export function normalize(url) {
  const raw = String(url ?? "").trim();
  if (!raw) throw new Error("give a URL, e.g. https://example.com or http://localhost:3000");
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || raw.startsWith("about:") || raw.startsWith("file:")) return raw;
  const local = /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(raw);
  return `${local ? "http" : "https"}://${raw}`;
}

/** Whether a tool result reports failure: a webmcpx envelope (`"ok": false`) or an MCP result (`"isError": true`). */
export function failed(text) {
  try {
    const value = JSON.parse(text);
    return value?.ok === false || value?.isError === true;
  } catch {
    return false;
  }
}

/** A result some sites already shape like MCP (`{content: [...]}`, e.g. Shopify), or undefined. */
export function mcpResult(text) {
  try {
    const value = JSON.parse(text);
    if (!Array.isArray(value?.content)) return undefined;
    const { content, structuredContent, isError } = value;
    return { content, ...(structuredContent && { structuredContent }), ...(isError === true && { isError }) };
  } catch {
    return undefined;
  }
}

/** @typedef {import("./page.js").PageTool & {standard?: boolean}} Tool */
