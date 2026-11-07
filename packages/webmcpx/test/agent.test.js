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
import { runStandard } from "../agent/standard.js";

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
// No tools of its own, behind a strict CSP. The inline script must stay blocked: the bridge never turns
// a page's CSP off.
const PLAIN = `<!doctype html><html><head><title>Plain</title></head><body>
<main><h1>Opening hours</h1><p>The workshop is closed on Mondays.</p></main>
<script>document.title = "CSP was bypassed";</script></body></html>`;
// Names that clash once made MCP-safe, a schema without a root type, and the same name in a frame.
const NAMES = `<!doctype html><html><head><title>Names</title></head><body><main><p>Names.</p></main>
<iframe src="/frame"></iframe>
<script>
  const mc = document.modelContext;
  mc.registerTool({ name: "cart.add", description: "Dotted.", execute: () => "dotted" });
  mc.registerTool({ name: "cart_add", description: "Underscored.", execute: () => "underscored" });
  mc.registerTool({
    name: "find", description: "No root type.",
    inputSchema: { properties: { q: { type: "string" } }, required: ["q"] },
    execute: ({ q }) => "found " + q,
  });
  mc.registerTool({ name: "checkout", description: "Top checkout.", execute: () => "top" });
</script></body></html>`;
const FRAME = `<!doctype html><html><body><script>
  document.modelContext.registerTool({ name: "checkout", description: "Frame checkout.", execute: () => "frame" });
</script></body></html>`;
const PAGES = { "/shop": SHOP, "/plain": PLAIN, "/names": NAMES, "/frame": FRAME };

let server;
let origin;
before(async () => {
  server = createServer((req, res) => {
    const strict = req.url === "/plain";
    if (!(req.url in PAGES)) return res.writeHead(404).end();
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      ...(strict && { "Content-Security-Policy": "default-src 'none'; script-src 'none'" }),
    });
    res.end(PAGES[req.url] ?? SHOP);
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
    assert.match(summary, /Standard tools on every page: get_page_context, search_page, fetch_as_markdown\./);
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

test("every tool stays reachable: clashing names, frames, schemas without a type", { skip, timeout: 90_000 }, async () => {
  const mcp = client();
  try {
    await mcp.rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {} });
    await mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/names` } });
    const { tools } = (await mcp.rpc("tools/list")).result;
    const by = (title) => tools.filter((t) => t.title === title).map((t) => t.name);
    assert.deepEqual([...by("cart.add"), ...by("cart_add")].sort(), ["cart_add", "cart_add_2"]);
    const results = await Promise.all(
      ["cart_add", "cart_add_2"].map((name) => mcp.rpc("tools/call", { name, arguments: {} })),
    );
    assert.deepEqual(results.map((r) => r.result.content[0].text).sort(), ["dotted", "underscored"]);

    // The same name in the page and in a same-origin frame: two tools, each running in its own frame.
    const checkouts = by("checkout");
    assert.equal(checkouts.length, 2, tools.map((t) => t.name).join(", "));
    const ran = [];
    for (const name of checkouts) ran.push((await mcp.rpc("tools/call", { name, arguments: {} })).result.content[0].text);
    assert.deepEqual(ran.sort(), ["frame", "top"]);

    const find = tools.find((t) => t.name === "find");
    assert.deepEqual(find.inputSchema, { type: "object", properties: { q: { type: "string" } }, required: ["q"] });
    assert.equal((await mcp.rpc("tools/call", { name: "find", arguments: { q: "mugs" } })).result.content[0].text, "found mugs");
  } finally {
    mcp.close();
  }
});

test("overlapping requests each get their own page", { skip, timeout: 90_000 }, async () => {
  const mcp = client();
  try {
    await mcp.rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {} });
    const [shop, plain] = await Promise.all([
      mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/shop` } }),
      mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/plain` } }),
    ]);
    assert.match(shop.result.content[0].text, /Opened "Kiln Shop"/);
    assert.match(plain.result.content[0].text, /Opened "Plain"/);
    // ping answers while a page is loading
    const [pong] = await Promise.all([
      mcp.rpc("ping"),
      mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/shop` } }),
    ]);
    assert.deepEqual(pong.result, {});

    // A call queued behind a navigation never runs on the next page's tools.
    const [, stale] = await Promise.all([
      mcp.rpc("tools/call", { name: "open_page", arguments: { url: `${origin}/names` } }),
      mcp.rpc("tools/call", { name: "add_to_cart", arguments: { sku: "MUG-1" } }),
    ]);
    assert.equal(stale.result.isError, true);
    assert.match(stale.result.content[0].text, /the page changed and no longer has the tool "add_to_cart"/);
  } finally {
    mcp.close();
  }
});

test("standard tools answer with an envelope whatever the input or failure", async () => {
  const read = async (what) => (what === "context" ? { title: "T" } : "p\x1fMugs ship in two days.\x1f\x1e");
  const bad = JSON.parse(await runStandard("search_page", null, read));
  assert.equal(bad.error.code, "INVALID_INPUT");
  const found = JSON.parse(await runStandard("search_page", { query: "ship" }, read));
  assert.equal(found.ok, true);
  const broken = JSON.parse(await runStandard("fetch_as_markdown", {}, async () => { throw new Error("tab closed"); }));
  assert.deepEqual(broken.error, { code: "UNAVAILABLE", message: "tab closed", retryable: true });
  assert.equal(JSON.parse(await runStandard("get_page_context", [], read)).data.title, "T");
});

test("a site with no tools and a strict CSP still gets the standard tools", { skip, timeout: 90_000 }, async () => {
  const listed = await cli("tools", `${origin}/plain`);
  assert.match(listed.stdout, /^Plain /, "the page's CSP must stay on");
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
  const notObject = await cli("call", "example.com", "search_page", "null");
  assert.equal(notObject.code, 2);
  assert.match(notObject.stderr, /must be a JSON object/);
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
