// End-to-end: `webmcpx mcp` and `webmcpx tools|call` against local pages in a real Chromium (no WebMCP
// flag). Needs `just wasm` and Chrome, Chromium, Edge or Brave (or WEBMCPX_CHROME).
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { after, before, test } from "node:test";
import { promisify } from "node:util";
import { Cdp, findBrowser } from "../agent/browser.js";
import { Session, normalize } from "../agent/session.js";
import { runStandard } from "../agent/standard.js";

const BIN = new URL("../bin/webmcpx.js", import.meta.url).pathname;
const skip = findBrowser() ? false : "no Chromium-based browser installed (set WEBMCPX_CHROME)";
if (skip && process.env.CI) throw new Error(skip);

// A site that registers its own tool only when document.modelContext exists, like real sites do.
const SHOP = `<!doctype html><html lang="en"><head><title>Kiln Shop</title></head><body>
<main><h1>Mugs</h1><p>Every mug is fired at 1240 degrees and ships in two days.</p></main>
<script>
  const cart = [];
  // Shopify storefronts only register when the context is the document's own property.
  if (Object.getOwnPropertyDescriptor(document, "modelContext")) {
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
  const topCheckout = new AbortController();
  mc.registerTool({ name: "checkout", description: "Top checkout.", execute: () => "top" }, { signal: topCheckout.signal });
  mc.registerTool({ name: "drop_top", description: "Unregisters the top checkout.", execute: () => (topCheckout.abort(), "dropped") });
</script></body></html>`;
const FRAME = `<!doctype html><html><body><script>
  document.modelContext.registerTool({ name: "checkout", description: "Frame checkout.", execute: () => "frame" });
</script></body></html>`;
// Declarative tools: forms with toolname, through the webmcpx script tag (served from this package).
const FORMS = `<!doctype html><html><head><title>Kiln Bookings</title>
<script type="module" src="/pkg/dist/auto.js"></script></head><body><main>
<form toolname="search_mugs" tooldescription="Search the mug catalog." action="/search" method="get">
  <label>Glaze <input name="glaze" required></label>
  <input name="limit" type="number" min="1" max="20" toolparamdescription="How many results.">
  <input name="when" type="datetime-local"><input name="from" type="date">
  <input name="cc" type="email" multiple toolparamdescription="Who else gets the results.">
</form>
<form id="note-form" toolname="save_note" tooldescription="Save a note." method="get" toolautosubmit>
  <input name="note">
</form>
<button form="note-form" formmethod="post" formaction="/save">Save</button>
<form id="old-form" toolname="reassociated" tooldescription="Gains a POST button when renamed." method="get" toolautosubmit>
  <input name="q">
</form>
<button form="new-form" formmethod="post">Go</button>
<form toolname="Book a class" tooldescription="Book a pottery class." method="post" toolautosubmit>
  <input type="hidden" name="price" value="40">
  <input name="total" value="40" readonly>
  <fieldset disabled><input name="coupon"></fieldset>
  <input name="name" required toolparamdescription="Who comes.">
  <select name="day"><option>monday</option><option>friday</option><option disabled>sunday</option>
    <optgroup label="Holidays" disabled><option>christmas</option></optgroup></select>
  <label><input type="checkbox" name="wheel"> Wheel</label>
  <label><input type="checkbox" name="glazes" value="celadon"> Celadon</label>
  <label><input type="checkbox" name="glazes" value="tenmoku"> Tenmoku</label>
  <button name="action" value="book">Book</button>
</form>
<form id="cart" toolname="update_cart" tooldescription="Set each row's quantity." method="post" toolautosubmit>
  <input name="quantity[]" type="number" value="1" max="5"><input name="quantity[]" type="number" value="3" max="10">
  <select name="variant[]"><option>red</option><option>blue</option></select><select name="variant[]"><option>large</option></select>
  <input type="range" name="tip[]" max="5" value="0"><input type="range" name="tip[]" max="10" value="0">
  <select multiple name="extras[]"><option>gift-wrap</option></select><select multiple name="extras[]"><option>engraving</option></select>
  <select name="note[]"><option>gift</option></select><input name="note[]">
  <button>Update</button>
</form>
<script>
  // Like React: the field's value is tracked by an own property, and onChange only fires when the
  // native value differs from the tracked one. A plain \`el.value = x\` would update the tracker too.
  const sku = document.querySelector('[name=name]');
  let tracked = sku.value;
  window.state = { name: "" };
  const native = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  Object.defineProperty(sku, "value", { get() { return native.get.call(this); }, set(v) { tracked = v; native.set.call(this, v); } });
  sku.addEventListener("input", () => { if (sku.value !== tracked) { tracked = sku.value; window.state.name = sku.value; } });
  // A field added later (as apps do) must reach the tool's schema, and so must one that unlocks.
  setTimeout(() => {
    document.querySelector("form[method=get]").insertAdjacentHTML("beforeend",
      '<input name="kiln" required toolparamdescription="Which kiln.">');
    document.querySelector("[name=total]").removeAttribute("readonly");
  }, 1500);
  // Alone, so nothing else triggers a refresh: a new id associates the external POST button, and the
  // tool's hints must follow.
  setTimeout(() => (document.getElementById("old-form").id = "new-form"), 1700);
  document.getElementById("cart").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    event.respondWith?.(Promise.resolve({ quantities: data.getAll("quantity[]"), variants: data.getAll("variant[]"), tips: data.getAll("tip[]"), extras: data.getAll("extras[]"), notes: data.getAll("note[]") }));
  });
  document.querySelector('form[method=post]').addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.agentInvoked) {
      const data = Object.fromEntries(new FormData(event.target));
      event.respondWith(Promise.resolve({ booked: window.state.name, day: data.day, wheel: data.wheel === "on", price: data.price,
        glazes: new FormData(event.target).getAll("glazes"), submitter: event.submitter?.value ?? null }));
    }
  });
</script></main></body></html>`;
// Tools that misbehave: one never answers (but honors cancellation), one navigates away mid-call.
const SLOW = `<!doctype html><html><head><title>Slow</title></head><body><main><p>Slow.</p></main><script>
  window.cancelled = false;
  document.modelContext.registerTool({ name: "hang", description: "Never answers.",
    execute: (_, client) => new Promise(() => {}) });
  document.modelContext.registerTool({ name: "wait_for_abort", description: "Answers only when cancelled.",
    execute: () => new Promise(() => {}) });
  document.modelContext.registerTool({ name: "freeze", description: "Blocks the page for good.",
    execute: () => { while (true) {} } });
  document.modelContext.registerTool({ name: "pay", description: "Pays, then leaves the page.",
    execute: () => { sessionStorage.paid = String(Number(sessionStorage.paid || 0) + 1); location.href = "/plain"; return new Promise(() => {}); } });
</script></body></html>`;
// An iframe that navigates on its own, the page around it staying put.
const NAVFRAME = `<!doctype html><html><head><title>Orders</title></head><body><main><p>Orders.</p></main>
<iframe src="/order1"></iframe>
<script>
  document.modelContext.registerTool({ name: "next_order", description: "Shows the next order.",
    execute: () => { document.querySelector("iframe").src = "/order2"; return "moved"; } });
</script></body></html>`;
const ORDER = (n) => `<!doctype html><html><body><script>
  document.modelContext.registerTool({ name: "checkout", description: "Pays order ${n}.", execute: () => "paid ${n}" });
</script></body></html>`;
const PAGES = { "/navframe": NAVFRAME, "/order1": ORDER(1), "/order2": ORDER(2), "/shop": SHOP, "/plain": PLAIN, "/names": NAMES, "/frame": FRAME, "/forms": FORMS, "/slow": SLOW };
const PKG = new URL("../", import.meta.url);

let server;
let origin;
before(async () => {
  server = createServer((req, res) => {
    if (req.url.startsWith("/pkg/")) {
      const file = new URL(`.${req.url.slice(4)}`, PKG);
      if (!file.href.startsWith(PKG.href) || !existsSync(file)) return res.writeHead(404).end();
      const type = file.pathname.endsWith(".wasm") ? "application/wasm" : "text/javascript";
      return res.writeHead(200, { "Content-Type": type }).end(readFileSync(file));
    }
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
  const client = {};
  createInterface({ input: child.stdout }).on("line", (line) => {
    const msg = JSON.parse(line);
    if (msg.id !== undefined && pending.has(msg.id)) pending.get(msg.id)(msg);
    else if (msg.method) notes.push(msg.method);
    else client.onUnmatched?.(msg);
  });
  const send = (msg) => child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...msg })}\n`);
  return Object.assign(client, {
    notes,
    raw: (line) => child.stdin.write(`${line}\n`),
    rpc: (method, params) =>
      new Promise((resolve) => {
        pending.set(++id, resolve);
        send({ id, method, params });
      }),
    notify: (method) => send({ method }),
    close: () => child.stdin.end(),
  });
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
    // Valid JSON that is not a request gets -32600, and the server keeps serving.
    const bad = new Promise((resolve) => mcp.onUnmatched = resolve);
    mcp.raw("null");
    assert.equal((await bad).error.code, -32600);
    assert.deepEqual((await mcp.rpc("ping")).result, {});
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
    // By the page's own name, an ambiguous tool is refused rather than guessed.
    const guess = await mcp.rpc("tools/call", { name: "call_page_tool", arguments: { name: "checkout" } });
    assert.ok(guess.result.isError ? true : checkouts.includes("checkout"), JSON.stringify(guess.result));

    const find = tools.find((t) => t.name === "find");
    assert.deepEqual(find.inputSchema, { type: "object", properties: { q: { type: "string" } }, required: ["q"] });
    assert.equal((await mcp.rpc("tools/call", { name: "find", arguments: { q: "mugs" } })).result.content[0].text, "found mugs");
  } finally {
    mcp.close();
  }
});

test("a tool listed earlier never runs another owner's tool", { skip, timeout: 90_000 }, async () => {
  const session = new Session();
  try {
    const { tools } = await session.goto(`${origin}/names`);
    const top = tools.find((t) => t.name === "checkout" && t.description === "Top checkout.");
    const drop = tools.find((t) => t.name === "drop_top");
    assert.equal(await session.call(drop, {}), "dropped");
    await session.tools(); // a refresh: the frame's checkout is now the only one
    await assert.rejects(session.call(top, {}), (e) => !/frame/.test(String(e?.message)));
  } finally {
    await session.close();
  }
});

test("<form toolname> becomes a tool an agent fills and submits", { skip, timeout: 90_000 }, async () => {
  const session = new Session();
  try {
    const { tools } = await session.goto(`${origin}/forms`);
    const search = tools.find((t) => t.name === "search_mugs");
    const book = tools.find((t) => t.name === "Book_a_class");
    assert.ok(search && book, tools.map((t) => t.name).join(", "));
    assert.deepEqual(search.inputSchema, {
      type: "object",
      properties: {
        glaze: { type: "string", description: "Glaze" },
        limit: { type: "number", minimum: 1, maximum: 20, description: "How many results." },
        when: { type: "string", format: "date-time" },
        from: { type: "string", format: "date" },
        cc: { type: "string", format: "email", description: "Who else gets the results." },
      },
      required: ["glaze"],
      additionalProperties: false,
    });
    // The polyfill fills in every annotation; GET forms read, others act.
    assert.equal(search.annotations.readOnlyHint, true);
    assert.equal(book.annotations.consequentialHint, true);
    // The default button's formmethod decides how the form is sent, so it decides the hint too.
    const note = tools.find((t) => t.name === "save_note");
    assert.equal(note.annotations.consequentialHint, true);
    assert.notEqual(note.annotations.readOnlyHint, true);
    // Disabled choices (and those in a disabled optgroup) are not offered.
    assert.deepEqual(book.inputSchema.properties.day, { type: "string", enum: ["monday", "friday"] });

    // Without toolautosubmit the agent fills the form and leaves the submit to the user.
    // An email input with multiple takes a comma-separated list, as text.
    // A date the field can't hold is cleared by the browser: refused, never sent empty.
    const badDate = JSON.parse(await session.call(search, { glaze: "celadon", from: "2026-02-30" }));
    assert.equal(badDate.error.code, "INVALID_INPUT");
    // A datetime with zero seconds is normalized by the browser, not refused.
    const filled = JSON.parse(await session.call(search, { glaze: "celadon", limit: 3, cc: "ana@kiln.test,bo@kiln.test", when: "2026-11-08T12:00:00" }));
    assert.deepEqual(filled, { ok: true, data: { submitted: false, next: "Ask the user to review the form and submit it." } });
    // With it, the page's submit handler sees agentInvoked and answers through respondWith().
    const booked = JSON.parse(await session.call(book, { name: "Ana", day: "friday", wheel: true }));
    assert.deepEqual(booked, { ok: true, data: { booked: "Ana", day: "friday", wheel: true, price: "40", glazes: [], submitter: "book" } });
    // Fields the user can't edit (readonly, inside a disabled fieldset) are not inputs either.
    assert.equal(book.inputSchema.properties.total, undefined);
    assert.equal(book.inputSchema.properties.coupon, undefined);
    // Several checkboxes with one name are a set of choices.
    assert.deepEqual(book.inputSchema.properties.glazes, { type: "array", items: { enum: ["celadon", "tenmoku"] } });
    const picked = JSON.parse(await session.call(book, { name: "Ana", day: "monday", glazes: ["tenmoku"] }));
    assert.deepEqual(picked.data.glazes, ["tenmoku"]);
    // A field the form does not show (hidden, password, disabled) is never set by an agent.
    const sneaky = JSON.parse(await session.call(book, { name: "Ana", day: "friday", price: "0" }));
    assert.deepEqual(sneaky.error.message, "`price` is not an input of this tool");
    const invalid = JSON.parse(await session.call(book, { day: "friday" }));
    assert.equal(invalid.error.code, "INVALID_INPUT");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const updated = (await session.tools()).find((t) => t.name === "search_mugs");
    assert.deepEqual(updated.inputSchema.required, ["glaze", "kiln"]);
    const unlocked = (await session.tools()).find((t) => t.name === "Book_a_class");
    assert.ok(unlocked.inputSchema.properties.total, "an unlocked field becomes an input");
    assert.equal(updated.inputSchema.properties.kiln.description, "Which kiln.");
    // Same-named fields that are not choices (cart rows) take one value each, in order.
    const cart = (await session.tools()).find((t) => t.name === "update_cart");
    // Rows may differ (options, bounds): the schema joins them, each field checks its own once filled.
    assert.deepEqual(cart.inputSchema.properties["quantity[]"], { type: "array", items: { type: "number", maximum: 10 }, minItems: 2, maxItems: 2 });
    assert.deepEqual(cart.inputSchema.properties["variant[]"].items.enum, ["red", "blue", "large"]);
    const updatedCart = JSON.parse(await session.call(cart, { "quantity[]": [2, 3], "variant[]": ["blue", "large"] }));
    assert.deepEqual(updatedCart.data, { quantities: ["2", "3"], variants: ["blue", "large"], tips: ["0", "0"], extras: [], notes: ["gift", ""] });
    // Fields of different kinds under one name (a select, then free text): each takes its own value.
    const noted = JSON.parse(await session.call(cart, { "quantity[]": [1, 1], "variant[]": ["red", "large"], "note[]": ["gift", "Happy birthday"] }));
    assert.deepEqual(noted.data.notes, ["gift", "Happy birthday"]);
    // A range clamps out-of-bounds values and a multiselect drops options it lacks: refused, not sent.
    const clamped = JSON.parse(await session.call(cart, { "quantity[]": [1, 1], "variant[]": ["red", "large"], "tip[]": [7, 3] }));
    assert.equal(clamped.error.code, "INVALID_INPUT");
    const extras = JSON.parse(await session.call(cart, { "quantity[]": [1, 1], "variant[]": ["red", "large"], "tip[]": [3, 7], "extras[]": [["gift-wrap"], ["engraving"]] }));
    assert.deepEqual([extras.data.tips, extras.data.extras], [["3", "7"], ["gift-wrap", "engraving"]]);
    const swappedExtras = JSON.parse(await session.call(cart, { "quantity[]": [1, 1], "variant[]": ["red", "large"], "extras[]": [["engraving"], ["gift-wrap"]] }));
    assert.equal(swappedExtras.error.code, "INVALID_INPUT");
    const overStock = JSON.parse(await session.call(cart, { "quantity[]": [7, 3], "variant[]": ["red", "large"] }));
    assert.equal(overStock.error.code, "INVALID_INPUT");
    const swapped = JSON.parse(await session.call(cart, { "quantity[]": [1, 1], "variant[]": ["large", "red"] }));
    assert.equal(swapped.error.code, "INVALID_INPUT");
    const reassociated = (await session.tools()).find((t) => t.name === "reassociated");
    assert.equal(reassociated.annotations.consequentialHint, true, "a form id change re-registers the tool");
  } finally {
    await session.close();
  }
});

test("a call past the time limit is cancelled, and a tool that navigates is never run twice", { skip, timeout: 90_000 }, async () => {
  const session = new Session({ callTimeout: 1_000 });
  try {
    const { tools } = await session.goto(`${origin}/slow`);
    const tool = (name) => tools.find((t) => t.name === name);
    await assert.rejects(session.call(tool("hang"), {}), /took longer than 1 s and was cancelled/);
    await assert.rejects(session.call(tool("pay"), {}), /navigated while "pay" ran: it may have done its work/);
    // Exactly one payment, on the page it navigated to.
    const paid = await session.call((await session.tools()).find((t) => t.name === "get_page_context"), {});
    assert.match(paid, /"title":"Plain"/);
    // A tool that freezes the page: the call ends, and the next page opens in a fresh browser.
    const again = await session.goto(`${origin}/slow`);
    await assert.rejects(session.call(again.tools.find((t) => t.name === "freeze"), {}), /froze the page/);
    assert.equal((await session.goto(`${origin}/plain`)).title, "Plain");
  } finally {
    await session.close();
  }
});

test("a tool from an iframe that has since navigated is refused, never run on the new page", { skip, timeout: 90_000 }, async () => {
  const session = new Session();
  try {
    const { tools } = await session.goto(`${origin}/navframe`);
    const checkout = tools.find((t) => t.name === "checkout");
    assert.equal(await session.call(checkout, {}), "paid 1");
    assert.equal(await session.call(tools.find((t) => t.name === "next_order"), {}), "moved");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await assert.rejects(session.call(checkout, {}), /the page changed since "checkout" was listed/);
    // The new order's checkout is a new tool, with its own owner.
    const fresh = (await session.tools()).find((t) => t.name === "checkout");
    assert.notEqual(fresh.owner, checkout.owner);
    assert.equal(await session.call(fresh, {}), "paid 2");
  } finally {
    await session.close();
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
    assert.match(stale.result.content[0].text, /the page changed since "add_to_cart" was listed/);
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

test("a refresh never hands a client's tool name to another tool", async () => {
  const { carry, named } = await import("../agent/mcp.js");
  const reserved = new Map();
  const a = { name: "cart_add", origin: "o" };
  const b = { name: "cart.add", origin: "o" };
  const first = named([a], new Map(), reserved);
  const second = named([b, a], carry(first), reserved);
  assert.deepEqual(second.map((e) => [e.tool.name, e.name]), [["cart.add", "cart_add_2"], ["cart_add", "cart_add"]]);
  // A name handed out once is never given to another tool, even after an empty refresh...
  named([], carry(second), reserved);
  assert.equal(named([{ name: "cart_add", origin: "other" }], new Map(), reserved)[0].name, "cart_add_3");
  // ...but the same tool, back on a later visit, gets its name back.
  assert.equal(named([a], new Map(), reserved)[0].name, "cart_add");
  // Same-named tools in two frames can't be told apart: when one goes, the other gets a new name.
  // Two frames (owners 1 and 2) with the same tool name are two tools.
  const two = [{ name: "checkout", origin: "s", owner: 1 }, { name: "checkout", origin: "s", owner: 2 }];
  const frames = named(two, new Map(), reserved);
  // An unchanged list keeps its names...
  assert.deepEqual(named(two, carry(frames), reserved).map((e) => e.name), frames.map((e) => e.name));
  const retired = new Set();
  // [A, B] -> [B, C]: B keeps its name, C (a third frame) never gets A's.
  const swapped = named([two[1], { name: "checkout", origin: "s", owner: 3 }], carry(frames), reserved, retired);
  assert.equal(swapped[0].name, frames[1].name);
  assert.ok(!frames.map((e) => e.name).includes(swapped[1].name), swapped[1].name);
  // After a navigation, frame ids are new: a frame of the next page never gets an old frame's name.
  const nextPage = named([{ name: "checkout", origin: "s", owner: "d2.1" }], carry(swapped), reserved, retired);
  assert.ok(![...frames, ...swapped].map((e) => e.name).includes(nextPage[0].name), nextPage[0].name);
  // [B, C] -> [] -> [B]: B gets its own name back, as the same tool.
  const empty = named([], carry(swapped), reserved, retired);
  assert.equal(named([two[1]], carry(empty), reserved, retired)[0].name, frames[1].name);
});

test("stopping the MCP server with a signal stops its browser", { skip, timeout: 60_000 }, async () => {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const dir = mkdtempSync(join(tmpdir(), "sig-"));
  const child = spawn(process.execPath, [BIN, "mcp"], { stdio: ["pipe", "pipe", "inherit"], env: { ...process.env, TMPDIR: dir } });
  const lines = createInterface({ input: child.stdout });
  const reply = new Promise((resolve) => lines.once("line", resolve));
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "open_page", arguments: { url: `${origin}/plain` } } })}\n`);
  await reply;
  const browsers = async () => (await exec("pgrep", ["-f", dir]).catch(() => ({ stdout: "" }))).stdout.trim();
  assert.notEqual(await browsers(), "", "the browser should be running");
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
  for (let i = 0; i < 50 && (await browsers()); i++) await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(await browsers(), "");
});

test("bare hosts get a scheme: https for the web, http for localhost", () => {
  assert.equal(normalize("example.com"), "https://example.com");
  assert.equal(normalize("localhost:3000"), "http://localhost:3000");
  assert.equal(normalize("127.0.0.1:8080/x"), "http://127.0.0.1:8080/x");
  assert.equal(normalize("http://a.test"), "http://a.test");
  assert.throws(() => normalize(" "), /give a URL/);
});

test("a browser that stops answering fails the command instead of hanging", async () => {
  const sent = [];
  const ws = { addEventListener() {}, send: (m) => sent.push(m), close() {} };
  const cdp = new Cdp(ws, { commandTimeout: 50 });
  await assert.rejects(cdp.send("Page.navigate", { url: "https://a.test/" }), /did not answer Page.navigate within 0.05 s/);
  // In-page awaits are bounded by the page (the tool call's own time limit), not here.
  let settled = false;
  cdp.send("Runtime.evaluate", { expression: "x", awaitPromise: true }).finally(() => (settled = true)).catch(() => {});
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(settled, false);
  cdp.close();
});

test("naming stays fast when a page churns names: suffixes only grow per base", async () => {
  const { carry, named } = await import("../agent/mcp.js");
  const reserved = new Map();
  const retired = new Set();
  const naming = { suffixes: new Map(), owned: new Map() };
  const base = "x".repeat(64);
  let previous = new Map();
  const start = Date.now();
  for (let round = 0; round < 200; round++) {
    const tools = Array.from({ length: 200 }, (_, i) => ({ name: `${base}${round}_${i}`, origin: "o" }));
    previous = carry(named(tools, previous, reserved, retired, naming));
  }
  assert.ok(Date.now() - start < 3_000, `${Date.now() - start} ms`);
  assert.equal(new Set([...reserved.keys()]).size, reserved.size);
});

test("a DevTools endpoint that accepts but never answers fails within the limit", async () => {
  const { createServer: tcp } = await import("node:net");
  const sockets = [];
  const silent = tcp((s) => sockets.push(s)).listen(0);
  await new Promise((resolve) => silent.once("listening", resolve));
  const { port } = silent.address();
  try {
    const start = Date.now();
    await assert.rejects(Cdp.connect(`ws://127.0.0.1:${port}/devtools/browser/x`, 200), /did not answer within 0.2 s/);
    assert.ok(Date.now() - start < 2_000);
  } finally {
    for (const s of sockets) s.destroy();
    silent.close();
  }
});

test("a tool keeps its name across an empty refresh, with the session's naming state", async () => {
  const { carry, named } = await import("../agent/mcp.js");
  const [reserved, retired, naming] = [new Map(), new Set(), { suffixes: new Map(), owned: new Map() }];
  const tools = [{ name: "search.page", origin: "o" }, { name: "search_page", origin: "o" }];
  const first = named(tools, new Map(), reserved, retired, naming).map((e) => e.name);
  const empty = named([], new Map(), reserved, retired, naming);
  const again = named(tools, carry(empty), reserved, retired, naming).map((e) => e.name);
  assert.deepEqual(again, first);
});

test("same-named tools whose count keeps changing don't grow the naming history", async () => {
  const { carry, named } = await import("../agent/mcp.js");
  const [reserved, retired, naming] = [new Map(), new Set(), { suffixes: new Map(), owned: new Map() }];
  let previous = new Map();
  for (let round = 0; round < 100; round++) {
    const tools = Array.from({ length: round % 2 ? 199 : 200 }, () => ({ name: "dup", origin: "o" }));
    previous = carry(named(tools, previous, reserved, retired, naming));
  }
  for (const names of naming.owned.values()) assert.ok(names.size <= 200, `${names.size} names kept`);
});
