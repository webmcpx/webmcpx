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

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", () => reject(new Error(`cannot connect to the browser at ${url}`)), { once: true });
    });
    return new Cdp(ws);
  }

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener("message", ({ data }) => {
      const msg = JSON.parse(String(data));
      if (msg.id === undefined) {
        for (const listener of this.#listeners) listener(msg);
        return;
      }
      const pending = this.#pending.get(msg.id);
      this.#pending.delete(msg.id);
      if (msg.error) pending?.reject(new Error(msg.error.message));
      else pending?.resolve(msg.result);
    });
    ws.addEventListener("close", () => {
      for (const { reject } of this.#pending.values()) reject(new Error("the browser connection closed"));
      this.#pending.clear();
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.#id;
    return new Promise((resolve, reject) => {
      this.#pending.set(id, { resolve, reject });
      this.#ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
    });
  }

  /** Calls `listener` with every event; returns the unsubscribe function. */
  on(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  close() {
    this.#ws.close();
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
  const kill = () => child.kill();
  process.once("exit", kill);
  child.once("exit", cleanup);

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
  });
  const cdp = await Cdp.connect(endpoint);
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
    const res = await fetch(new URL("/json/version", url)).catch(() => undefined);
    if (!res?.ok) throw new Error(`no browser answers at ${url}; start it with --remote-debugging-port`);
    endpoint = (await res.json()).webSocketDebuggerUrl;
  }
  const cdp = await Cdp.connect(endpoint);
  return { cdp, close: () => cdp.close() };
}
