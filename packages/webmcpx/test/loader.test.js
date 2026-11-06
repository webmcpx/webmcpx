// End-to-end: real loader + real WebAssembly module against a simulated page and host.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseHTML } from "linkedom";

// Node 24 defines a getter-only `navigator`; tests replace it.
const setNavigator = (value) => Object.defineProperty(globalThis, "navigator", { value, configurable: true, writable: true });
const WASM = readFileSync(new URL("../wasm/webmcpx_wasm_bg.wasm", import.meta.url));

const PAGE = `<!doctype html><html lang="en"><head><title>Pizza Roma</title>
<meta name="description" content="Wood-fired pizza."></head><body>
<nav><a href="/">Home</a></nav>
<main>
  <h1 id="menu">Menu</h1><p>Neapolitan pizza baked in a wood oven.</p>
  <h2 id="delivery">Delivery</h2><p>Delivery takes 30 minutes and is free above 20 euros.</p>
  <ul><li>Margherita</li><li>Diavola</li></ul>
  <h2 id="hours">Hours</h2>
  <table><tr><th>Day</th><th>Open</th></tr><tr><td>Monday</td><td>Closed</td></tr><tr><td>Friday</td><td>12–23</td></tr></table>
  <div hidden>secret coupon</div>
</main><footer>© Pizza Roma</footer></body></html>`;

/** A host that records registrations, like a browser exposing document.modelContext. */
function host({ frozen = false, on = "document" } = {}) {
  const { document } = parseHTML(PAGE);
  const tools = new Map();
  const mc = {
    async registerTool(tool, { signal } = {}) {
      if (tools.has(tool.name)) throw new DOMException("duplicate", "InvalidStateError");
      tools.set(tool.name, tool);
      signal?.addEventListener("abort", () => tools.delete(tool.name));
    },
  };
  if (frozen) Object.freeze(mc);
  globalThis.document = document;
  globalThis.location = new URL("https://pizza.test/menu#top");
  setNavigator(on === "navigator" ? { modelContext: mc } : {});
  if (on === "document") document.modelContext = mc;
  return { tools, call: async (name, input = {}) => JSON.parse(await tools.get(name).execute(input, {})) };
}

const { register } = await import("../src/index.js");

test("reports UNAVAILABLE when WebAssembly cannot load", async () => {
  const page = host();
  await register({ wasm: new Uint8Array([0, 1, 2]) });
  const result = await page.call("search_page", { query: "pizza" });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "UNAVAILABLE");
  assert.match(result.hint, /wasm-unsafe-eval/);
});

test("registers the default tools with their contracts", async () => {
  const page = host();
  const reg = await register({ wasm: WASM });
  assert.deepEqual(reg.registered, ["fetch_as_markdown", "get_page_context", "search_page"]);
  assert.deepEqual(reg.failed, []);
  assert.equal(page.tools.get("search_page").annotations.readOnlyHint, true);
  reg.dispose();
  assert.equal(page.tools.size, 0);
});

test("get_page_context describes the page", async () => {
  const page = host();
  await register({ wasm: WASM });
  const { data } = await page.call("get_page_context");
  assert.equal(data.title, "Pizza Roma");
  assert.equal(data.lang, "en");
  assert.equal(data.description, "Wood-fired pizza.");
  assert.deepEqual(data.headings[1], { level: 2, text: "Delivery", url: "https://pizza.test/menu#delivery" });
});

test("search_page ranks main content and links to the section", async () => {
  const page = host();
  await register({ wasm: WASM });
  const result = await page.call("search_page", { query: "free delivery", limit: 1 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.results, [{
    heading: "Delivery",
    snippet: "Delivery takes 30 minutes and is free above 20 euros.",
    url: "https://pizza.test/menu#delivery",
  }]);
  assert.equal((await page.call("search_page", { query: "coupon" })).error.code, "NOT_FOUND", "hidden and nav/footer text is excluded");
  assert.equal((await page.call("search_page", {})).error.code, "INVALID_INPUT");
});

test("search_page keeps each table row together", async () => {
  const page = host();
  await register({ wasm: WASM });
  const result = await page.call("search_page", { query: "monday", limit: 1 });
  assert.deepEqual(result.data.results, [{
    heading: "Hours",
    snippet: "Monday | Closed",
    url: "https://pizza.test/menu#hours",
  }]);
});

test("fetch_as_markdown returns main content, paged", async () => {
  const page = host();
  await register({ wasm: WASM });
  const full = await page.call("fetch_as_markdown");
  assert.equal(full.data.markdown, "# Menu\n\nNeapolitan pizza baked in a wood oven.\n\n## Delivery\n\n" +
    "Delivery takes 30 minutes and is free above 20 euros.\n\n- Margherita\n- Diavola\n\n## Hours\n\n" +
    "Day | Open\n\nMonday | Closed\n\nFriday | 12–23");
  const first = await page.call("fetch_as_markdown", { max_chars: 100 });
  assert.equal(first.truncated, true);
  const rest = await page.call("fetch_as_markdown", { cursor: first.next_cursor, max_chars: 100 });
  assert.equal(rest.ok, true);
});

test("works with a frozen navigator.modelContext and string input", async () => {
  const page = host({ frozen: true, on: "navigator" });
  const reg = await register({ wasm: WASM, tools: ["search_page"] });
  assert.deepEqual(reg.registered, ["search_page"]);
  const result = JSON.parse(await page.tools.get("search_page").execute('{"query":"margherita"}', {}));
  assert.equal(result.ok, true);
});

test("search_site adapts a backend search function", async () => {
  const page = host();
  const reg = await register({
    wasm: WASM,
    tools: ["search_site"],
    searchSite: async (q, { limit }) => [{ title: "Menu", url: "https://pizza.test/menu", snippet: q, extra: 1 }].slice(0, limit),
  });
  assert.deepEqual(reg.registered, ["search_site"]);
  const { data } = await page.call("search_site", { query: "pizza" });
  assert.deepEqual(data.results, [{ title: "Menu", url: "https://pizza.test/menu", snippet: "pizza" }]);
  const missing = await register({ tools: ["search_site"] });
  assert.equal(missing.failed[0].error, "search_site needs options.searchSite");
});

test("is a no-op without WebMCP", async () => {
  globalThis.document = parseHTML(PAGE).document;
  setNavigator({});
  const reg = await register();
  assert.deepEqual(reg, { ...reg, registered: [], failed: [] });
});
