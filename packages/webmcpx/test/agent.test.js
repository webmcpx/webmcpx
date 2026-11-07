// End-to-end: `webmcpx mcp` and `webmcpx tools|call` against local pages in a real Chromium (no WebMCP
// flag). Needs `just wasm` and Chrome, Chromium, Edge or Brave (or WEBMCPX_CHROME).
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { after, before, test } from "node:test";
import { promisify } from "node:util";
import { findBrowser } from "../agent/browser.js";
import { normalize } from "../agent/session.js";

const BIN = new URL("../bin/webmcpx.js", import.meta.url).pathname;
const skip = findBrowser() ? false : "no Chromium-based browser installed (set WEBMCPX_CHROME)";
if (skip && process.env.CI) throw new Error(skip);

// A site that registers its own tool only when document.modelContext exists, like real sites do.
const SHOP = `<!doctype html><html lang="en"><head><title>Kiln Shop</title></head><body>
<main><h1>Mugs</h1><p>Every mug is fired at 1240 degrees and ships in two days.</p></main>
<script>
  const cart = [];
  if (document.modelContext) {
    document.modelContext.registerTool({
      name: "add_to_cart",
      description: "Add a mug to the cart by SKU.",
      inputSchema: { type: "object", properties: { sku: { type: "string" } }, required: ["sku"] },
      annotations: { consequentialHint: true },
      execute: ({ sku }) => { cart.push(sku); return JSON.stringify({ ok: true, data: { cart } }); },
    });
  }
  // Registered later, like a single-page app does after it renders.
  setTimeout(() => document.modelContext?.registerTool({
    name: "late.tool", description: "Registered after load.", execute: () => "late",
  }), 1500);
</script></body></html>`;
// No tools of its own, behind a strict CSP that would block an injected script and WebAssembly.
const PLAIN = `<!doctype html><html><head><title>Plain</title></head><body>
<main><h1>Opening hours</h1><p>The workshop is closed on Mondays.</p></main></body></html>`;

let server;
let origin;
before(async () => {
  server = createServer((req, res) => {
    const strict = req.url === "/plain";
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      ...(strict && { "Content-Security-Policy": "default-src 'none'; script-src 'none'" }),
    });
    res.end(strict ? PLAIN : SHOP);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

/** A minimal MCP client over the server's stdio. */
function client() {
  const child = spawn(process.execPath, [BIN, "mcp"], { stdio: ["pipe", "pipe", "inherit"] });
  const pending = new Map();
  const notes = [];
  let id = 0;
  createInterface({ input: child.stdout }).on("line", (line) => {
    const msg = JSON.parse(line);
    if (msg.id !== undefined) pending.get(msg.id)?.(msg);
    else notes.push(msg.method);
  });
  const send = (msg) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...msg })}\n`);
  return {
    notes,
    rpc: (method, params) =>
      new Promise((resolve) => {
        pending.set(++id, resolve);
        send({ id, method, params });
      }),
    notify: (method) => send({ method }),
    close: () => child.stdin.end(),
  };
}

const exec = promisify(execFile);
const cli = (...args) => exec(process.execPath, [BIN, ...args]).catch((e) => e);

test("an MCP client gets the page's own tools, typed, plus the standard ones", { skip, timeout: 90_000 }, async () => {
  const mcp = client();
  try {
    const init = await mcp.rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {} });
    assert.equal(init.result.serverInfo.name, "webmcpx");
    assert.deepEqual(init.result.capabilities.tools, { listChanged: true });
    mcp.notify("notifications/initialized");

    const opened = await mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/shop` } });
    const summary = opened.result.content[0].text;
    assert.match(summary, /The site's own WebMCP tools \(1\):\n- add_to_cart: Add a mug to the cart by SKU\. \[has side effects\]/);
    assert.match(summary, /Standard tools on every page: fetch_as_markdown, get_page_context, search_page\./);
    assert.ok(mcp.notes.includes("notifications/tools/list_changed"));

    const { tools } = (await mcp.rpc("tools/list")).result;
    const add = tools.find((t) => t.name === "add_to_cart");
    assert.deepEqual(add.annotations, { readOnlyHint: false, destructiveHint: true, openWorldHint: true });
    assert.deepEqual(add.inputSchema.required, ["sku"]);
    assert.match(add.description, /\(from 127\.0\.0\.1:\d+\)$/);

    const added = await mcp.rpc("tools/call", { name: "add_to_cart", arguments: { sku: "MUG-1" } });
    assert.deepEqual(JSON.parse(added.result.content[0].text), { ok: true, data: { cart: ["MUG-1"] } });
    assert.equal(added.result.isError, undefined);

    // A tool registered after load reaches the client too; its "." becomes "_" in the MCP name.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const later = (await mcp.rpc("tools/list")).result.tools.map((t) => t.name);
    assert.ok(later.includes("late_tool"), later.join(", "));
    const late = await mcp.rpc("tools/call", { name: "call_page_tool", arguments: { name: "late.tool" } });
    assert.equal(late.result.content[0].text, "late");

    const missing = await mcp.rpc("tools/call", { name: "nope", arguments: {} });
    assert.equal(missing.result.isError, true);
  } finally {
    mcp.close();
  }
});

test("a site with no tools and a strict CSP still gets the standard tools", { skip, timeout: 90_000 }, async () => {
  const listed = await cli("tools", `${origin}/plain`);
  assert.match(listed.stdout, /The site registers no WebMCP tools of its own/);
  assert.match(listed.stdout, /search_page/);

  const found = await cli("call", `${origin}/plain`, "search_page", '{"query": "closed mondays"}');
  assert.equal(found.code, undefined, found.stderr);
  assert.match(found.stdout, /"ok": true/);
  assert.match(found.stdout, /closed on Mondays/);

  const failed = await cli("call", `${origin}/plain`, "search_page", "{}");
  assert.equal(failed.code, 1);
  assert.match(failed.stdout, /INVALID_INPUT/);
});

test("the CLI explains its usage errors and exits 2", async () => {
  const none = await cli("tools");
  assert.equal(none.code, 2);
  assert.match(none.stderr, /Give a URL/);
  const json = await cli("call", "example.com", "search_page", "{nope");
  assert.equal(json.code, 2);
  const help = await cli("--help");
  assert.match(help.stdout, /claude mcp add webmcpx -- npx -y webmcpx mcp/);
});

test("bare hosts get a scheme: https for the web, http for localhost", () => {
  assert.equal(normalize("example.com"), "https://example.com");
  assert.equal(normalize("localhost:3000"), "http://localhost:3000");
  assert.equal(normalize("127.0.0.1:8080/x"), "http://127.0.0.1:8080/x");
  assert.equal(normalize("http://a.test"), "http://a.test");
  assert.throws(() => normalize(" "), /give a URL/);
});
