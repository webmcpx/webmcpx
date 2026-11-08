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
      tools() {
        this.calls++;
        return new Promise(() => {}); // a page whose tool list never answers
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
