// useTool for React, Vue and Svelte: registered while mounted, unregistered on unmount. The frameworks
// are stood in for by module mocks that run their lifecycle hooks (`node --experimental-test-module-mocks`).
import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { parseHTML } from "linkedom";

const tools = new Map();
const { document } = parseHTML("<!doctype html><html><body></body></html>");
document.modelContext = {
  async registerTool(tool, { signal }) {
    tools.set(tool.name, tool);
    signal.addEventListener("abort", () => tools.delete(tool.name));
  },
};
globalThis.document = document;

const effects = [];
mock.module("react", {
  namedExports: {
    useRef: (value) => ({ current: value }),
    useEffect: (effect, deps) => effects.push({ effect, deps }),
  },
});
mock.module("vue", {
  namedExports: {
    unref: (v) => (v && typeof v === "object" && "value" in v ? v.value : v),
    watchEffect: (effect) => effects.push({ effect: () => { let undo; effect((fn) => (undo = fn)); return undo; } }),
  },
});
mock.module("svelte", { namedExports: { onMount: (effect) => effects.push({ effect }) } });

const call = async (name, input) => JSON.parse(await tools.get(name).execute(input, {}));
const mount = () => effects.pop().effect();

for (const framework of ["react", "vue", "svelte"]) {
  test(`${framework}: useTool registers while mounted`, async () => {
    const { useTool } = await import(`../src/${framework}.js`);
    useTool({ name: `hello_${framework}`, description: "Says hello.", input: { who: "string" }, run: ({ who }) => `hi ${who}` });
    const unmount = mount();
    await Promise.resolve();
    assert.deepEqual(await call(`hello_${framework}`, { who: "Ana" }), { ok: true, data: "hi Ana" });
    unmount();
    assert.equal(tools.has(`hello_${framework}`), false);
  });
}

test("react: the tool re-registers only when its name, description or input change", async () => {
  const { useTool } = await import("../src/react.js");
  useTool({ name: "count", description: "Counts.", run: () => 1 });
  const first = effects.at(-1);
  assert.deepEqual(first.deps, ["count", "Counts.", "{}"]);
  const unmount = mount();
  await Promise.resolve();
  assert.deepEqual(await call("count", {}), { ok: true, data: 1 });
  unmount();
});
