// `import "webmcpx/polyfill"`: when it installs the W3C polyfill. The polyfill itself is a stand-in here;
// real installs in Chromium, Firefox and WebKit are covered by site/tests/engines.spec.ts.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let installs = 0;
mock.module("@w3c/webmcp-polyfill", { namedExports: { installWebMCP: () => installs++ } });

let n = 0;
/** Imports src/polyfill.js afresh on such a page; returns how often it installed the polyfill. */
async function load({ secure = true, onDocument = false, onNavigator = false } = {}) {
  installs = 0;
  globalThis.document = onDocument ? { modelContext: {} } : {};
  Object.defineProperty(globalThis, "navigator", { value: onNavigator ? { modelContext: {} } : {}, configurable: true });
  globalThis.isSecureContext = secure;
  await import(`../src/polyfill.js?${n++}`);
  return installs;
}

test("installs where the page has no WebMCP", async () => {
  assert.equal(await load(), 1);
});

test("never over a native document.modelContext or a legacy navigator.modelContext", async () => {
  assert.equal(await load({ onDocument: true }), 0);
  assert.equal(await load({ onNavigator: true }), 0);
});

test("nothing outside a secure context (WebMCP needs one)", async () => {
  assert.equal(await load({ secure: false }), 0);
});
