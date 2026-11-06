// Reference WebMCP host, injected before page scripts. It mirrors shipping hosts on purpose:
// a frozen object (webmcp#293) and rejection reasons dropped to "UnknownError" (#282).
// Real sites still use origin-trial APIs, so the same object is also `navigator.modelContext` and
// accepts the removed `provideContext`/`clearContext` (they replace the provided set).
(() => {
  const tools = new Map();
  const provided = new Set();
  const NAME = /^[A-Za-z0-9_.-]{1,128}$/;
  const add = (tool) => {
    if (!NAME.test(tool?.name ?? "")) throw new TypeError("invalid tool name");
    if (tools.has(tool.name)) throw new DOMException("duplicate tool", "InvalidStateError");
    tools.set(tool.name, tool);
  };
  const clearContext = () => {
    for (const name of provided) tools.delete(name);
    provided.clear();
  };
  const modelContext = Object.freeze({
    registerTool(tool, { signal } = {}) {
      if (signal?.aborted) return Promise.resolve();
      try {
        add(tool);
      } catch (e) {
        return Promise.reject(e);
      }
      signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
      return Promise.resolve();
    },
    provideContext({ tools: list = [] } = {}) {
      clearContext();
      for (const tool of list) {
        add(tool);
        provided.add(tool.name);
      }
    },
    clearContext,
  });
  Object.defineProperty(document, "modelContext", { value: modelContext });
  try {
    Object.defineProperty(Navigator.prototype, "modelContext", { get: () => modelContext, configurable: true });
  } catch {
    // A browser with a non-configurable native navigator.modelContext keeps its own.
  }

  const schema = (s) => (typeof s === "string" ? JSON.parse(s) : s ?? { type: "object", properties: {} });
  Object.defineProperty(window, "__webmcpHost", {
    value: Object.freeze({
      list: () =>
        [...tools.values()].map((t) => ({
          name: t.name,
          description: t.description ?? "",
          inputSchema: schema(t.inputSchema),
          annotations: t.annotations ?? {},
        })),
      async call(name, input) {
        const tool = tools.get(name);
        if (!tool) return `Error: no tool named ${name}`;
        try {
          const out = await tool.execute(input, { signal: new AbortController().signal });
          return typeof out === "string" ? out : JSON.stringify(out ?? null);
        } catch {
          return "UnknownError";
        }
      },
    }),
  });
})();
