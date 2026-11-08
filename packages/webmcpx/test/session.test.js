// Session and Page against a stand-in browser: setup failures and oversized tool lists.
import assert from "node:assert/strict";
import { mock, test } from "node:test";

/** A fake DevTools connection: `reply(method, params)` answers each command. */
const fakeCdp = (reply) => ({
  send: async (method, params) => reply(method, params),
  on: () => () => {},
  onClose: () => {},
});
let launches = 0;
let closes = 0;
let reply = () => ({});
mock.module("../agent/browser.js", {
  namedExports: {
    launch: async () => (launches++, { cdp: fakeCdp((m, p) => reply(m, p)), close: () => closes++ }),
    attach: async () => {
      throw new Error("unused");
    },
  },
});
const { Session } = await import("../agent/session.js");
const { Page } = await import("../agent/page.js");

test("a tab that can't be set up closes its browser", async () => {
  reply = (method) => {
    if (method === "Target.createTarget") return { targetId: "t" };
    if (method === "Target.attachToTarget") throw new Error("attach failed");
    return {};
  };
  const session = new Session();
  for (let i = 0; i < 3; i++) await assert.rejects(session.goto("https://a.test/"), /attach failed/);
  assert.equal(launches, 3);
  assert.equal(closes, 3, "every failed start closed its browser");
  await session.close();
});

test("a page listing thousands of tools gives at most 200", async () => {
  const many = Array.from({ length: 30_000 }, (_, index) => ({ index, name: "same", description: "", annotations: {} }));
  const page = await Page.create(
    fakeCdp((method) => {
      if (method === "Target.createTarget") return { targetId: "t" };
      if (method === "Target.attachToTarget") return { sessionId: "s" };
      if (method === "Runtime.evaluate") return { result: { objectId: "list" } };
      if (method === "Runtime.callFunctionOn") return { result: { value: many } };
      return {};
    }),
  );
  assert.equal((await page.tools()).length, 200);
});
