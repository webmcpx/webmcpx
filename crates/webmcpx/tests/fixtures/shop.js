navigator.modelContext.registerTool({
  name: "search products",
  description: "Find products​ in the catalog.",
  inputSchema: { type: "object", properties: { q: { type: "string" } } },
  annotations: { destructiveHint: false },
  execute: async ({ q }) => search(q),
});
