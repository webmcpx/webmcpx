// The agent's browser: finds and launches a Chromium-based browser (or attaches to a running one) and
// speaks the Chrome DevTools Protocol over Node's built-in WebSocket. No dependencies.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MAC = (app, bin = app) => `/Applications/${app}.app/Contents/MacOS/${bin}`;
const WIN = (dir, exe) =>
  [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]
    .filter(Boolean)
    .map((root) => join(root, dir, exe));

const CANDIDATES = {
  darwin: [
    MAC("Google Chrome"),
    MAC("Chromium"),
    MAC("Microsoft Edge"),
    MAC("Brave Browser"),
    MAC("Google Chrome Canary"),
  ],
  linux: [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
    "/usr/bin/microsoft-edge",
    "/usr/bin/brave-browser",
  ],
  win32: [
    ...WIN("Google\\Chrome\\Application", "chrome.exe"),
    ...WIN("Microsoft\\Edge\\Application", "msedge.exe"),
    ...WIN("BraveSoftware\\Brave-Browser\\Application", "brave.exe"),
  ],
};

export const NO_BROWSER =
  "No Chrome, Chromium, Edge or Brave found. Install one, or point WEBMCPX_CHROME at its executable.";

/** The browser to launch: `WEBMCPX_CHROME` (or `CHROME_PATH`), else the first installed candidate. */
export function findBrowser(env = process.env, platform = process.platform) {
  const own = env.WEBMCPX_CHROME || env.CHROME_PATH;
  if (own) return own;
  return (CANDIDATES[platform] ?? []).find((path) => existsSync(path));
}

/** One DevTools Protocol connection; `send` takes an optional flat-session id. */
export class Cdp {
  #ws;
  #id = 0;
  #pending = new Map();
  #listeners = new Set();
  #closed = false;
  #onClose = new Set();
  #timeout;

  /** Connects within `ms`: an endpoint that accepts the socket but never upgrades it must not hang us. */
  static async connect(url, ms = 10_000) {
    const ws = new WebSocket(url);
    let timer;
    try {
      await new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`the browser at ${url} did not answer within ${ms / 1000} s`)), ms);
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", () => reject(new Error(`cannot connect to the browser at ${url}`)), { once: true });
      });
    } catch (e) {
      ws.close();
      throw e;
    } finally {
      clearTimeout(timer);
    }
    return new Cdp(ws);
  }

  /** `commandTimeout` (ms) bounds every command but in-page awaits, which the page bounds itself. */
  constructor(ws, { commandTimeout = 30_000 } = {}) {
    this.#ws = ws;
    this.#timeout = commandTimeout;
    ws.addEventListener("message", ({ data }) => {
      const msg = JSON.parse(String(data));
      if (msg.id === undefined) {
        for (const listener of this.#listeners) listener(msg);
        return;
      }
      const pending = this.#pending.get(msg.id);
      this.#pending.delete(msg.id);
      clearTimeout(pending?.timer);
      if (msg.error) pending?.reject(new Error(msg.error.message));
      else pending?.resolve(msg.result);
    });
    ws.addEventListener("close", () => this.#shut());
    ws.addEventListener("error", () => this.#shut());
  }

  /** Once closed (the browser quit or crashed), every pending and later call fails at once. */
  #shut() {
    if (this.#closed) return;
    this.#closed = true;
    for (const { reject, timer } of this.#pending.values()) {
      clearTimeout(timer);
      reject(new Error("the browser connection closed"));
    }
    this.#pending.clear();
    for (const listener of this.#onClose) listener();
  }

  get closed() {
    return this.#closed;
  }

  /** Calls `listener` once the connection closes. */
  onClose(listener) {
    this.#onClose.add(listener);
  }

  send(method, params = {}, sessionId) {
    if (this.#closed) return Promise.reject(new Error("the browser connection closed"));
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      // A browser that stops answering (a wedged tab, a hung navigation) must not hang the server forever.
      const timer = params.awaitPromise
        ? undefined
        : setTimeout(() => {
            this.#pending.delete(id);
            reject(new Error(`the browser did not answer ${method} within ${this.#timeout / 1000} s`));
          }, this.#timeout);
      timer?.unref?.();
      this.#pending.set(id, { resolve, reject, timer });
      try {
        this.#ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
      } catch (e) {
        this.#pending.delete(id);
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  /** Calls `listener` with every event; returns the unsubscribe function. */
  on(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  close() {
    this.#ws.close();
    this.#shut();
  }
}

/**
 * Launches a fresh, private browser (temporary profile, headless unless `headed`).
 * Native WebMCP is switched off so every page gets the same, spec-tracking polyfill.
 */
export async function launch({ headed = false, executable = findBrowser() } = {}) {
  if (!executable) throw new Error(NO_BROWSER);
  const profile = mkdtempSync(join(tmpdir(), "webmcpx-"));
  const args = [
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-features=WebMCP",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-extensions",
    ...(headed ? [] : ["--headless=new"]),
    // CI containers often lack the user namespaces Chrome's sandbox needs, and Chrome refuses root without it.
    ...(process.env.CI || process.getuid?.() === 0 ? ["--no-sandbox"] : []),
    "about:blank",
  ];
  const child = spawn(executable, args, { stdio: ["ignore", "ignore", "pipe"] });
  const cleanup = () => rmSync(profile, { recursive: true, force: true });
  // Also runs on process exit (signals included, see bin/webmcpx.js): never leave a browser or its profile.
  const kill = () => {
    child.kill();
    try {
      cleanup();
    } catch {
      // still in use: removed when the browser exits
    }
  };
  process.once("exit", kill);
  child.once("exit", cleanup);

  // A browser that fails to start (no DevTools line, no connection) must not be left running.
  const fail = (e) => {
    process.removeListener("exit", kill);
    kill();
    throw e;
  };
  const endpoint = await new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(() => reject(new Error(`${executable} did not start within 30 s`)), 30_000);
    // Keep draining stderr for the browser's whole life: a full pipe would block it.
    child.stderr.on("data", (chunk) => {
      log = (log + chunk).slice(-4_000);
      const found = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (found) {
        clearTimeout(timer);
        resolve(found[1]);
      }
    });
    child.once("error", (e) => {
      clearTimeout(timer);
      reject(new Error(`cannot start ${executable}: ${e.message}`));
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`${executable} exited (${code}) before it was ready: ${log.trim().slice(-500)}`));
    });
  }).catch(fail);
  const cdp = await Cdp.connect(endpoint).catch(fail);
  // The connection dropped but Chrome may still run: it is ours, so it goes too.
  cdp.onClose(() => {
    process.removeListener("exit", kill);
    kill();
  });
  return {
    cdp,
    close() {
      process.removeListener("exit", kill);
      cdp.close();
      kill();
    },
  };
}

/** Attaches to a browser you started with `--remote-debugging-port` (your profile, your sessions). */
export async function attach(url) {
  let endpoint = url;
  if (/^https?:/.test(url)) {
    // Discovery, body included, within 10 s.
    const signal = AbortSignal.timeout(10_000);
    const res = await fetch(new URL("/json/version", url), { signal }).catch(() => undefined);
    if (!res?.ok) throw new Error(`no browser answers at ${url}; start it with --remote-debugging-port`);
    endpoint = (await res.json().catch(() => ({}))).webSocketDebuggerUrl;
    if (typeof endpoint !== "string") throw new Error(`the browser at ${url} did not give its DevTools URL`);
  }
  const cdp = await Cdp.connect(endpoint);
  return { cdp, close: () => cdp.close() };
}
