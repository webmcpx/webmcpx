// Reference WebMCP host, injected before page scripts. It mirrors shipping hosts on purpose:
// a frozen `document.modelContext` (webmcp#293) and rejection reasons dropped to "UnknownError" (#282).
(() => {
  const tools = new Map();
  const NAME = /^[A-Za-z0-9_.-]{1,128}$/;
  const modelContext = Object.freeze({
    registerTool(tool, { signal } = {}) {
      if (!NAME.test(tool?.name ?? "")) return Promise.reject(new TypeError("invalid tool name"));
      if (tools.has(tool.name)) return Promise.reject(new DOMException("duplicate tool", "InvalidStateError"));
      if (signal?.aborted) return Promise.resolve();
      tools.set(tool.name, tool);
      signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
      return Promise.resolve();
    },
  });
  Object.defineProperty(document, "modelContext", { value: modelContext });

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
