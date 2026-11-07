// tool(): your own tools get the standard contract (shorthand schema, checked input, one result shape).
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHTML } from "linkedom";

const setNavigator = (value) => Object.defineProperty(globalThis, "navigator", { value, configurable: true, writable: true });

/** A host that records registrations, like a browser exposing document.modelContext. */
function host({ webmcp = true } = {}) {
  const { document } = parseHTML("<!doctype html><html><body></body></html>");
  const tools = new Map();
  if (webmcp) {
    document.modelContext = Object.freeze({
      async registerTool(tool, { signal } = {}) {
        if (tools.has(tool.name)) throw new DOMException("duplicate tool", "InvalidStateError");
        tools.set(tool.name, tool);
        signal?.addEventListener("abort", () => tools.delete(tool.name));
      },
    });
  }
  globalThis.document = document;
  setNavigator({});
  return { tools, call: async (name, input) => JSON.parse(await tools.get(name).execute(input, {})) };
}

const { schema, tool } = await import("../src/index.js");

test("input shorthand becomes a JSON Schema; a full schema passes through", () => {
  assert.deepEqual(schema({ sku: "string", qty: "number?", "note?": { type: "string", description: "Gift note." }, size: ["S", "M"] }), {
    type: "object",
    properties: {
      sku: { type: "string" },
      qty: { type: "number" },
      note: { type: "string", description: "Gift note." },
      size: { enum: ["S", "M"] },
    },
    required: ["sku", "size"],
  });
  assert.deepEqual(schema(), { type: "object", properties: {} });
  // A field may be called "type": the shorthand is never mistaken for a schema.
  assert.deepEqual(schema({ type: "string" }), { type: "object", properties: { type: { type: "string" } }, required: ["type"] });
});

test("invalid input never reaches run(): bounds, extra fields, nested objects, non-objects", async () => {
  const page = host();
  const ran = [];
  tool({
    name: "book",
    description: "Books seats.",
    inputSchema: {
      type: "object",
      properties: {
        qty: { type: "integer", minimum: 1, maximum: 10 },
        code: { type: "string", pattern: "^[A-Z]{3}$" },
        guest: { type: "object", properties: { name: { type: "string", minLength: 1 } }, required: ["name"] },
        tags: { type: "array", items: { type: "string" }, maxItems: 2 },
      },
      required: ["qty"],
      additionalProperties: false,
    },
    run: (input) => (ran.push(input), "ok"),
  });
  const problem = async (input) => (await page.call("book", input)).error?.message;
  assert.equal(await problem({ qty: -5 }), "`qty` must be at least 1");
  assert.equal(await problem({ qty: 11 }), "`qty` must be at most 10");
  assert.equal(await problem({ qty: 1, code: "lis" }), "`code` must match ^[A-Z]{3}$");
  assert.equal(await problem({ qty: 1, guest: {} }), "`name` is required");
  assert.equal(await problem({ qty: 1, guest: { name: "" } }), "`name` must have at least 1 chars");
  assert.equal(await problem({ qty: 1, tags: ["a", 2] }), "`tags`[1] must be of type string");
  assert.equal(await problem({ qty: 1, tags: ["a", "b", "c"] }), "`tags` must have at most 2 items");
  assert.equal(await problem({ qty: 1, admin: true }), "`admin` is not an input of this tool");
  for (const input of ["null", "3", '"x"', "[]", null]) assert.equal(await problem(input), "the input must be an object");
  // A schema for unlisted fields and combinators are checked too.
  tool({
    name: "stock",
    description: "Sets stock per SKU.",
    inputSchema: {
      type: "object",
      additionalProperties: { type: "integer", minimum: 1 },
      anyOf: [{ required: ["MUG"] }, { required: ["CUP"] }],
    },
    run: () => "ok",
  });
  const stock = async (input) => (await page.call("stock", input)).error?.message;
  assert.equal(await stock({ MUG: -5 }), "`MUG` must be at least 1");
  assert.equal(await stock({ CUP: "free" }), "`CUP` must be of type integer");
  assert.equal(await stock({ PLATE: 2 }), "input matches none of the allowed shapes");
  assert.equal(await stock({ MUG: 3 }), undefined);
  // oneOf: exactly one; const: by content.
  tool({
    name: "pick",
    description: "Picks by SKU or ID.",
    inputSchema: {
      type: "object",
      properties: { filter: { const: { status: "open", tags: ["a"] } } },
      oneOf: [{ required: ["sku"] }, { required: ["id"] }],
    },
    run: () => "ok",
  });
  const pick = async (input) => (await page.call("pick", input)).error?.message;
  assert.equal(await pick({ sku: "MUG", id: "1" }), "input must match exactly one allowed shape");
  assert.equal(await pick({}), "input must match exactly one allowed shape");
  assert.equal(await pick({ sku: "MUG", filter: { tags: ["a"], status: "open" } }), undefined);
  assert.match(await pick({ sku: "MUG", filter: { status: "closed", tags: ["a"] } }), /must be/);
  // Local $refs are followed; a remote or missing one refuses rather than skipping the check.
  tool({
    name: "pay",
    description: "Pays an amount.",
    inputSchema: {
      type: "object",
      properties: { amount: { $ref: "#/$defs/amount" }, note: { $ref: "https://example.com/s.json" } },
      required: ["amount"],
      $defs: { amount: { type: "integer", minimum: 1 } },
    },
    run: () => "paid",
  });
  assert.equal((await page.call("pay", { amount: -5 })).error.message, "`amount` must be at least 1");
  assert.equal((await page.call("pay", { amount: 5 })).ok, true);
  assert.match((await page.call("pay", { amount: 5, note: "x" })).error.message, /can't check \$ref/);
  // A schema that refers to itself forever stops instead of hanging.
  tool({ name: "loop", description: "Loops.", inputSchema: { type: "object", properties: { a: { $ref: "#/properties/a" } } }, run: () => 1 });
  assert.match((await page.call("loop", { a: 1 })).error.message, /can't check \$ref/);
  // Boolean schemas: false refuses, true accepts.
  tool({ name: "bools", description: "Boolean branches.", inputSchema: { type: "object", oneOf: [false, { required: ["sku"] }] }, run: () => "ok" });
  assert.equal((await page.call("bools", { sku: "MUG" })).ok, true);
  assert.equal((await page.call("bools", {})).ok, false);
  // Inherited names are not declared inputs.
  assert.equal(await problem('{"qty":1,"__proto__":{"admin":true}}'), "`__proto__` is not an input of this tool");
  assert.equal(await problem('{"qty":1,"constructor":{"admin":true}}'), "`constructor` is not an input of this tool");
  assert.equal(ran.length, 0);
  assert.deepEqual(await page.call("book", { qty: 2, code: "LIS", guest: { name: "Ana" } }), { ok: true, data: "ok" });

  tool({ name: "coupon", description: "Applies a coupon.", input: { coupon: { type: ["string", "null"] } }, run: () => "applied" });
  assert.equal((await page.call("coupon", { coupon: null })).ok, true);
  assert.equal((await page.call("coupon", { coupon: "SAVE" })).ok, true);
  assert.equal((await page.call("coupon", { coupon: 42 })).error.message, "`coupon` must be of type string or null");
  tool({ name: "required_only", description: "Needs toString.", input: { toString: "string" }, run: () => "ran" });
  assert.equal((await page.call("required_only", {})).error.message, "`toString` is required");
});

test("a tool answers with the standard envelope and checks its input", async () => {
  const page = host();
  const cart = [];
  const { ready } = tool({
    name: "add_to_cart",
    description: "Add a product to the cart.",
    input: { sku: "string", qty: "integer?", size: ["S", "M"] },
    acts: true,
    run: ({ sku, qty = 1 }) => (cart.push([sku, qty]), { items: cart.length }),
  });
  assert.equal(await ready, true);
  const registered = page.tools.get("add_to_cart");
  assert.deepEqual(registered.annotations, { consequentialHint: true });
  assert.deepEqual(registered.inputSchema.required, ["sku", "size"]);

  assert.deepEqual(await page.call("add_to_cart", { sku: "MUG", size: "S" }), { ok: true, data: { items: 1 } });
  // Hosts may pass the input as a JSON string.
  assert.equal((await page.call("add_to_cart", '{"sku":"CUP","size":"M","qty":2}')).ok, true);
  assert.deepEqual(cart, [["MUG", 1], ["CUP", 2]]);

  const missing = await page.call("add_to_cart", { size: "S" });
  assert.deepEqual(missing.error, { code: "INVALID_INPUT", message: "`sku` is required", retryable: false });
  assert.match((await page.call("add_to_cart", { sku: "MUG", size: "XL" })).error.message, /one of S, M/);
  assert.match((await page.call("add_to_cart", { sku: "MUG", size: "S", qty: 1.5 })).error.message, /must be of type integer/);
  assert.equal((await page.call("add_to_cart", "{nope")).error.code, "INVALID_INPUT");
  assert.equal(cart.length, 2, "invalid input never reaches run()");
});

test("errors resolve as envelopes; a webmcpx code is kept", async () => {
  const page = host();
  tool({ name: "boom", description: "Fails.", run: () => { throw new Error("database down"); } });
  tool({
    name: "login_first",
    description: "Needs a signed-in user.",
    run: () => { throw Object.assign(new Error("sign in first"), { code: "REQUIRES_USER" }); },
  });
  tool({ name: "huge", description: "Too much.", run: () => "x".repeat(30_000) });
  assert.deepEqual((await page.call("boom", {})).error, { code: "UNAVAILABLE", message: "database down", retryable: true });
  assert.equal((await page.call("login_first", {})).error.code, "REQUIRES_USER");
  const huge = await page.call("huge", {});
  assert.equal(huge.error.code, "RESULT_TOO_LARGE");
  assert.match(huge.hint, /page it/);
});

test("dispose and an aborted signal unregister; no WebMCP means a quiet no-op", async () => {
  const page = host();
  const handle = tool({ name: "a", description: "A.", run: () => 1 });
  const controller = new AbortController();
  tool({ name: "b", description: "B.", run: () => 2, signal: controller.signal });
  assert.deepEqual([...page.tools.keys()], ["a", "b"]);
  handle.dispose();
  controller.abort();
  assert.equal(page.tools.size, 0);

  // Aborted before or while registering: never left registered.
  const before = new AbortController();
  before.abort();
  assert.equal(await tool({ name: "d", description: "D.", run: () => 4, signal: before.signal }).ready, false);
  const during = new AbortController();
  const pending = tool({ name: "e", description: "E.", run: () => 5, signal: during.signal });
  during.abort();
  await pending.ready;
  assert.equal(page.tools.size, 0);

  host({ webmcp: false });
  assert.equal(await tool({ name: "c", description: "C.", run: () => 3 }).ready, false);
});

test("authoring mistakes are flagged in the console, with the linter's limits", async (t) => {
  host();
  const warn = t.mock.method(console, "warn", () => {});
  tool({ name: "a_tool_name_that_goes_on_and_on_forever", description: "", run: () => 1 });
  const messages = warn.mock.calls.map((c) => c.arguments[0]).join("\n");
  assert.match(messages, /keep names under 30 chars/);
  assert.match(messages, /say what it does/);
});
