// Kiln & Co: a small store whose UI and WebMCP tools call the same functions.
import { register } from "/webmcpx/src/index.js";

const PRODUCTS = [
  ["MUG-01", "Speckled Mug", "mug", "white", 24, 12, ""],
  ["MUG-02", "Cobalt Mug", "mug", "blue", 28, 8, ""],
  ["MUG-03", "Harbor Mug", "mug", "blue", 19, 5, ""],
  ["MUG-04", "Moss Mug", "mug", "green", 22, 0, "Back in stock on 12 December"],
  ["MUG-05", "Ink Mug", "mug", "black", 21, 14, ""],
  ["MUG-06", "Tide Mug", "mug", "blue", 23, 9, ""],
  ["MUG-07", "Fern Espresso Cup", "mug", "green", 15, 20, ""],
  ["BWL-01", "Speckled Bowl", "bowl", "white", 32, 6, ""],
  ["BWL-02", "Cobalt Bowl", "bowl", "blue", 36, 4, ""],
  ["BWL-03", "Terracotta Bowl", "bowl", "terracotta", 30, 7, ""],
  ["BWL-04", "Moss Serving Bowl", "bowl", "green", 58, 2, ""],
  ["PLT-01", "Speckled Plate", "plate", "white", 26, 18, ""],
  ["PLT-02", "Ink Dinner Plate", "plate", "black", 29, 10, ""],
  ["PLT-03", "Harbor Side Plate", "plate", "blue", 18, 11, ""],
  ["TPT-01", "Stoneware Teapot", "teapot", "white", 74, 3, ""],
  ["TPT-02", "Cobalt Teapot", "teapot", "blue", 82, 1, ""],
  ["VAS-01", "Ash Glaze Vase", "vase", "white", 64, 0, "Back in stock on 3 January"],
  ["VAS-02", "Terracotta Bud Vase", "vase", "terracotta", 27, 9, ""],
  ["VAS-03", "Moss Tall Vase", "vase", "green", 69, 2, ""],
  ["VAS-04", "Ink Vase", "vase", "black", 58, 5, ""],
].map(([sku, name, category, color, price, stock, note]) => ({ sku, name, category, color, price, stock, note }));

const money = (n) => `$${n.toFixed(2)}`;

// ---- Store logic (shared by the UI and the tools) ----
const store = {
  cart: [],
  find: ({ query = "", category = "", color = "", max_price, sort = "featured" } = {}) => {
    const q = query.trim().toLowerCase();
    const found = PRODUCTS.filter((p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!category || p.category === category) &&
      (!color || p.color === color) &&
      (max_price == null || p.price <= max_price));
    if (sort === "price_asc") found.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") found.sort((a, b) => b.price - a.price);
    return found;
  },
  add(sku, quantity = 1) {
    const product = PRODUCTS.find((p) => p.sku === sku);
    if (!product) return { error: "NOT_FOUND", message: `no product with sku ${sku}` };
    const line = store.cart.find((l) => l.sku === sku);
    const qty = (line?.qty ?? 0) + quantity;
    if (qty > product.stock) {
      return { error: "REFUSED", message: `only ${product.stock} of ${product.name} in stock` };
    }
    if (line) line.qty = qty;
    else store.cart.push({ sku, qty });
    render();
    return {};
  },
  remove(sku) {
    store.cart = store.cart.filter((l) => l.sku !== sku);
    render();
  },
  total: () => store.cart.reduce((sum, l) => sum + l.qty * PRODUCTS.find((p) => p.sku === l.sku).price, 0),
};
window.store = store;

// ---- UI ----
const $ = (s) => document.querySelector(s);
const filters = $("#filters");

function render() {
  const f = Object.fromEntries(new FormData(filters));
  $("#products").innerHTML = store.find({ query: f.q, category: f.category, color: f.color, sort: f.sort })
    .map((p) => `<li class="card">
      <h3>${p.name}</h3>
      <p>${p.color} ${p.category} · <strong>${money(p.price)}</strong></p>
      <p>${p.stock ? `${p.stock} in stock` : `<span class="out">Out of stock. ${p.note}</span>`}</p>
      ${p.stock ? `<label>Quantity <input type="number" min="1" max="${p.stock}" value="1" data-qty="${p.sku}"></label>
      <button type="button" data-add="${p.sku}" aria-label="Add ${p.name} to cart">Add to cart</button>` : ""}
    </li>`).join("");
  $("#cart-items").innerHTML = store.cart.map((l) => {
    const p = PRODUCTS.find((x) => x.sku === l.sku);
    return `<li>${l.qty} × ${p.name} · ${money(l.qty * p.price)}
      <button type="button" data-remove="${p.sku}" aria-label="Remove ${p.name}">Remove</button></li>`;
  }).join("") || "<li>Empty</li>";
  $("#cart-total").textContent = money(store.total());
}

filters.addEventListener("input", render);
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]")?.dataset.add;
  if (add) {
    const qty = Number(document.querySelector(`[data-qty="${add}"]`)?.value) || 1;
    const r = store.add(add, qty);
    if (r.error) alert(r.message);
  }
  const remove = e.target.closest("[data-remove]")?.dataset.remove;
  if (remove) store.remove(remove);
});
window.alert = (m) => console.warn(m); // keep headless runs non-blocking
render();

// ---- WebMCP: the webmcpx standard tools plus store tools, same envelope contract ----
const ok = (data) => JSON.stringify({ ok: true, data });
const fail = (code, message, hint) => JSON.stringify({ ok: false, error: { code, message, retryable: false }, ...(hint && { hint }) });
// Like the webmcpx loader's guard(): tools resolve with an envelope and never reject (webmcp#282).
const guard = (run) => async (input) => {
  try {
    const args = typeof input === "string" ? JSON.parse(input || "{}") : input ?? {};
    if (typeof args !== "object" || Array.isArray(args)) return fail("INVALID_INPUT", "input must be an object");
    return await run(args);
  } catch (e) {
    return fail("UNAVAILABLE", String(e?.message ?? e));
  }
};
// Strict like the inputSchema: an optional key is absent or has its type; null is invalid.
const optional = (args, key, type) => args[key] === undefined || typeof args[key] === type;
const view = (p) => ({ sku: p.sku, name: p.name, category: p.category, color: p.color, price: p.price, stock: p.stock, ...(p.note && { note: p.note }) });
const cartView = () => ({
  items: store.cart.map((l) => ({ ...view(PRODUCTS.find((p) => p.sku === l.sku)), quantity: l.qty })),
  total: Number(store.total().toFixed(2)),
});

const TOOLS = [
  {
    name: "search_products",
    description: "Search the catalog. Every filter is optional; with none, returns every product. Prices are USD.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words in the product name." },
        category: { type: "string", enum: ["mug", "bowl", "plate", "teapot", "vase"] },
        color: { type: "string", enum: ["blue", "white", "green", "black", "terracotta"] },
        max_price: { type: "number", description: "Highest price in USD." },
        sort: { type: "string", enum: ["featured", "price_asc", "price_desc"], default: "featured" },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: guard(async (input) => {
      const bad = [["query", "string"], ["category", "string"], ["color", "string"], ["max_price", "number"], ["sort", "string"]]
        .find(([key, type]) => !optional(input, key, type));
      if (bad) return fail("INVALID_INPUT", `\`${bad[0]}\` must be a ${bad[1]}`);
      const found = store.find(input);
      return found.length ? ok({ products: found.map(view) })
        : fail("NOT_FOUND", "no product matches", "Drop a filter or try other words.");
    }),
  },
  {
    name: "add_to_cart",
    description: "Add a product to the cart by sku. Adding a sku already in the cart increases its quantity.",
    inputSchema: {
      type: "object",
      properties: {
        sku: { type: "string", description: "Product sku from search_products." },
        quantity: { type: "integer", minimum: 1, default: 1, description: "How many to add." },
      },
      required: ["sku"],
      additionalProperties: false,
    },
    annotations: { consequentialHint: false },
    execute: guard(async ({ sku, quantity = 1 }) => {
      if (typeof sku !== "string") return fail("INVALID_INPUT", "`sku` must be a string");
      if (!Number.isInteger(quantity) || quantity < 1) return fail("INVALID_INPUT", "`quantity` must be an integer >= 1");
      const r = store.add(sku, quantity);
      return r.error ? fail(r.error, r.message) : ok(cartView());
    }),
  },
  {
    name: "get_cart",
    description: "Return the cart: items with quantity and the total in USD.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: guard(async () => ok(cartView())),
  },
];

const mc = document.modelContext ?? navigator.modelContext;
for (const tool of TOOLS) mc?.registerTool(tool);
register({ tools: ["get_page_context"] });
