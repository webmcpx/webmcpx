// The MCP server with a stand-in session: how page changes become tool-list refreshes.
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { mock, test } from "node:test";

let session;
mock.module("../agent/session.js", {
  namedExports: {
    Session: class {
      constructor(options) {
        session = this;
        this.options = options;
        this.calls = 0;
      }
      call() {
        return this.result;
      }
      tools() {
        this.calls++;
        return this.next ?? new Promise(() => {}); // by default, a page whose tool list never answers
      }
      close() {}
    },
    failed: (e) => String(e),
    mcpResult: (x) => x,
  },
});
const { serve } = await import("../agent/mcp.js");

test("page changes coalesce: one refresh at a time, whatever the page fires", async () => {
  const input = new PassThrough();
  serve({}, { input, output: new PassThrough() });
  for (let i = 0; i < 300; i++) session.options.onChange();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(session.calls, 1);
  input.end();
});

test("a malformed tool list from the page never ends the server", async () => {
  const input = new PassThrough();
  serve({}, { input, output: new PassThrough() });
  session.next = Promise.resolve([{ name: null }]);
  session.options.onChange();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(session.calls, 1, "the refresh ran and its failure was contained");
  input.end();
});

test("a tool result that can't be serialized becomes an error, not a crash", async () => {
  const input = new PassThrough();
  const output = new PassThrough();
  serve({}, { input, output });
  let deep = [];
  for (let i = 0; i < 20_000; i++) deep = [deep];
  session.result = { content: [{ type: "text", text: "x" }], structuredContent: { deep } };
  session.next = Promise.resolve([{ name: "deep", description: "", annotations: {}, origin: "o", owner: "0" }]);
  session.options.onChange();
  await new Promise((resolve) => setTimeout(resolve, 10));
  const lines = [];
  output.on("data", (d) => lines.push(...String(d).trim().split("\n")));
  input.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "deep", arguments: {} } })}\n`);
  input.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "ping" })}\n`);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const byId = Object.fromEntries(lines.map((l) => JSON.parse(l)).map((m) => [m.id, m]));
  assert.equal(byId[1].error.code, -32603);
  assert.deepEqual(byId[2].result, {});
  input.end();
});
