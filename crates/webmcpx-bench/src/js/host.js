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
  // On the prototype, not this document: an iframe's first about:blank document is replaced by its real
  // one in the same window (and realm), which this script does not see again.
  try {
    Object.defineProperty(Document.prototype, "modelContext", { get: () => modelContext, configurable: true });
  } catch {
    Object.defineProperty(document, "modelContext", { value: modelContext });
  }
  try {
    Object.defineProperty(Navigator.prototype, "modelContext", { get: () => modelContext, configurable: true });
  } catch {
    // A browser with a non-configurable native navigator.modelContext keeps its own.
  }

  const schema = (s) => (typeof s === "string" ? JSON.parse(s) : s ?? { type: "object", properties: {} });
  // This window's tools, then those of same-origin frames inside it, each with the document it lives in
  // (0 for this one): same names in different documents are different tools. Cross-origin frames can't
  // be read and stay out.
  const every = () => {
    const found = [...tools.values()].map((tool) => [tool, "0"]);
    for (let i = 0; i < window.length; i++) {
      try {
        for (const [tool, doc] of window[i].__webmcpHost?.every() ?? []) found.push([tool, `${i + 1}.${doc}`]);
      } catch {
        // cross-origin
      }
    }
    return found;
  };
  // By name, the page's own first (what an agent calling a name gets).
  const all = () => {
    const found = new Map();
    for (const [tool] of every()) if (!found.has(tool.name)) found.set(tool.name, tool);
    return found;
  };
  Object.defineProperty(window, "__webmcpHost", {
    value: Object.freeze({
      every,
      // Bounded before it leaves the page: a page must not be able to send the scanner megabytes. The
      // caps sit far above every lint limit, so the linter still sees what is too long or too many.
      list: () =>
        every().slice(0, 200).map(([t, doc]) => {
          const cap = (v, n) => String(v ?? "").slice(0, n);
          // A schema we can't read or that is too big to send is reported as a problem, never replaced.
          let inputSchema;
          let schemaError;
          try {
            inputSchema = schema(t.inputSchema);
            if (JSON.stringify(inputSchema).length > 50_000) [inputSchema, schemaError] = [undefined, "the input schema is over 50,000 chars"];
          } catch {
            schemaError = "the input schema is not valid JSON";
          }
          const annotations = {};
          for (const [k, v] of Object.entries(t.annotations ?? {}).slice(0, 20)) annotations[cap(k, 64)] = v === true;
          return { name: cap(t.name, 256), description: cap(t.description, 10_000), inputSchema, annotations, schemaError, document: doc };
        }),
      async call(name, input) {
        const tool = all().get(name);
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
