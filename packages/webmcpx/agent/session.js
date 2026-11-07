// What the CLI and the MCP server share: one browser (started on first use) and one tab.
import { attach, launch } from "./browser.js";
import { Page } from "./page.js";

export const STANDARD_TOOLS = new Set(["get_page_context", "search_page", "fetch_as_markdown", "search_site"]);

export class Session {
  #options;
  #browser;
  #page;
  #ready;

  /** @param {{headed?: boolean, browser?: string, cdp?: string, onChange?: () => void}} options */
  constructor(options = {}) {
    this.#options = options;
  }

  #start() {
    this.#ready ??= (async () => {
      const { cdp, headed, browser, onChange } = this.#options;
      this.#browser = cdp ? await attach(cdp) : await launch({ headed, executable: browser });
      return Page.create(this.#browser.cdp, { onChange });
    })().catch((e) => {
      this.#ready = undefined;
      throw e;
    });
    return this.#ready;
  }

  async goto(url) {
    this.#page = await this.#start();
    return this.#page.open(normalize(url));
  }

  async tools() {
    return this.#page ? ((await this.#page.tools()) ?? []) : [];
  }

  async call(name, input) {
    if (!this.#page) throw new Error("no page is open yet: call open_page first");
    return this.#page.call(name, input);
  }

  close() {
    this.#browser?.close();
  }
}

/** `example.com` → `https://example.com/`; `localhost:3000` → `http://localhost:3000/`. */
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
