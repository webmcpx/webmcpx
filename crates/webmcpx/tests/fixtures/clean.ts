const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "track_order",
    title: "Track order",
    description: "Return the delivery status of one of the user's orders.",
    inputSchema: {
      type: "object",
      properties: { order_id: { type: "string", description: "Order number, e.g. A-1042." } },
      required: ["order_id"],
    },
    annotations: { readOnlyHint: true },
    async execute({ order_id }: { order_id: string }) {
      return JSON.stringify(await orders.status(order_id));
    },
  },
  { signal: controller.signal },
);
