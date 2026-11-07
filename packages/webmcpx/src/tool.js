// Your own tools with the standard tools' contract (one result shape, validated input, never a
// rejection), and the WebMCP declarative API (<form toolname>, webmcp's declarative-api-explainer.md)
// in browsers that expose WebMCP without it.
import { CODES, LIMITS } from "./generated.js";

const context = () => globalThis.document?.modelContext ?? globalThis.navigator?.modelContext;
const envelope = (body) => JSON.stringify(body);
const fail = (code, message, hint) =>
  envelope({ ok: false, error: { code, message, retryable: CODES[code] }, ...(hint && { hint }) });
const NAME = /^[A-Za-z0-9_.-]{1,128}$/;
let count = 0;

/**
 * Input shorthand to JSON Schema: `{ sku: "string", qty: "number?", size: ["S", "M"] }`. A "?" (on
 * the type or the key) makes a field optional; an array is a choice; an object is a property schema.
 * A full schema (with `type`) passes through.
 */
export function schema(input = {}) {
  if (input.type) return input;
  const properties = {};
  const required = [];
  for (const [rawKey, spec] of Object.entries(input)) {
    const key = rawKey.replace(/\?$/, "");
    const optional = rawKey !== key || (typeof spec === "string" && spec.endsWith("?"));
    properties[key] =
      typeof spec === "string" ? { type: spec.replace(/\?$/, "") } : Array.isArray(spec) ? { enum: spec } : spec;
    if (!optional) required.push(key);
  }
  return { type: "object", properties, ...(required.length && { required }) };
}

const TYPES = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  integer: Number.isInteger,
  boolean: (v) => typeof v === "boolean",
  array: Array.isArray,
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
};

/** The first problem with `args` against the top level of `s` (required, type, enum), or "". */
function check(s, args) {
  for (const key of s.required ?? []) if (args[key] === undefined) return `\`${key}\` is required`;
  for (const [key, p] of Object.entries(s.properties ?? {})) {
    const v = args[key];
    if (v === undefined) continue;
    if (p.type && TYPES[p.type] && !TYPES[p.type](v)) return `\`${key}\` must be of type ${p.type}`;
    if (p.enum && !p.enum.includes(v)) return `\`${key}\` must be one of ${p.enum.join(", ")}`;
  }
  return "";
}

/** Wraps `run` in the standard contract: parsed and checked input, `{ok, data}` or `{ok: false, error}`. */
const contract = (inputSchema, run) => async (raw, client) => {
  let args;
  try {
    args = typeof raw === "string" ? JSON.parse(raw || "{}") : raw ?? {};
  } catch {
    return fail("INVALID_INPUT", "the input is not JSON");
  }
  const problem = check(inputSchema, args);
  if (problem) return fail("INVALID_INPUT", problem);
  try {
    const out = envelope({ ok: true, data: (await run(args, client)) ?? null });
    return out.length > LIMITS.OUTPUT_MAX
      ? fail("RESULT_TOO_LARGE", `the result has ${out.length} chars`, `Return at most ${LIMITS.OUTPUT_MAX}: page it.`)
      : out;
  } catch (e) {
    return fail(e?.code in CODES ? e.code : "UNAVAILABLE", String(e?.message ?? e));
  }
};

const warn = (name, message) => console.warn(`webmcpx: tool "${name}": ${message}`);

function register(definition, signal) {
  const mc = context();
  const { name, description } = definition;
  if (!NAME.test(name ?? "")) warn(name, "names are 1-128 of A-Z a-z 0-9 _ . -");
  else if (name.length > LIMITS.NAME_WARN) warn(name, `keep names under ${LIMITS.NAME_WARN} chars`);
  if (!description) warn(name, "say what it does and when to use it in `description`");
  else if (description.length > LIMITS.DESCRIPTION_WARN) warn(name, `keep the description under ${LIMITS.DESCRIPTION_WARN} chars`);
  if (++count === LIMITS.TOOLS_WARN + 1) console.warn(`webmcpx: more than ${LIMITS.TOOLS_WARN} tools on one page`);
  if (typeof mc?.registerTool !== "function") return Promise.resolve(false);
  signal.addEventListener("abort", () => count--, { once: true });
  // Never assign onto `mc`: some agent browsers expose a frozen object (webmcp#293).
  return mc.registerTool(definition, { signal }).then(
    () => true,
    (e) => (warn(name, e?.message ?? e), false),
  );
}

/**
 * Registers one of your own tools. `run(input)` returns the data (or throws; an error with a webmcpx
 * `code` keeps it). A no-op where WebMCP is missing.
 * @param {import("./index").ToolDefinition} definition
 * @returns {{ready: Promise<boolean>, dispose(): void}}
 */
export function tool({ name, description, input, run, readOnly, acts, untrusted, signal } = {}) {
  const controller = new AbortController();
  signal?.addEventListener("abort", () => controller.abort(), { once: true });
  const inputSchema = schema(input);
  const ready = register(
    {
      name,
      description,
      inputSchema,
      annotations: {
        ...(readOnly && { readOnlyHint: true }),
        ...(acts && { consequentialHint: true }),
        ...(untrusted && { untrustedContentHint: true }),
      },
      execute: contract(inputSchema, run),
    },
    controller.signal,
  );
  return { ready, dispose: () => controller.abort() };
}

const FORMATS = { email: "email", url: "uri", date: "date", "datetime-local": "date-time", time: "time" };
const SKIPPED = /^(submit|button|reset|image|file|password|hidden)$/;

/** A form's input schema, per the declarative explainer: control `name`s, `toolparamdescription`s. */
export function formSchema(form) {
  const properties = {};
  const required = [];
  for (const el of form.elements) {
    const { name, type } = el;
    if (!name || el.disabled || SKIPPED.test(type) || !("value" in el) || el.tagName === "BUTTON") continue;
    let p;
    if (type === "checkbox") p = { type: "boolean" };
    else if (type === "radio") (p = properties[name] ?? { type: "string", enum: [] }).enum.push(el.value);
    else if (el.tagName === "SELECT") {
      p = { type: "string", enum: [...el.options].map((o) => o.value) };
      if (el.multiple) p = { type: "array", items: p };
    } else if (type === "number" || type === "range") {
      p = { type: "number", ...(el.min && { minimum: +el.min }), ...(el.max && { maximum: +el.max }) };
    } else p = { type: "string", ...(FORMATS[type] && { format: FORMATS[type] }) };
    const description =
      el.getAttribute("toolparamdescription") || el.labels?.[0]?.textContent.trim() || el.getAttribute("placeholder");
    if (description) p.description = description;
    properties[name] = p;
    if (el.required && !required.includes(name)) required.push(name);
  }
  return { type: "object", properties, ...(required.length && { required }) };
}

function fill(form, args) {
  for (const [name, value] of Object.entries(args)) {
    const field = form.elements.namedItem(name);
    for (const el of field instanceof Element ? [field] : [...(field ?? [])]) {
      if (el.type === "checkbox") el.checked = Boolean(value);
      else if (el.type === "radio") el.checked = el.value === String(value);
      else if (el.multiple) for (const o of el.options) o.selected = [].concat(value).includes(o.value);
      else el.value = String(value);
      // Frameworks listen for these, not for property writes.
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}

/** Fills the form; with `toolautosubmit`, submits it and returns what `respondWith()` gave. */
function runForm(form) {
  return async (args) => {
    fill(form, args);
    const invalid = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
    if (invalid) throw Object.assign(new Error(`\`${invalid.name}\`: ${invalid.validationMessage}`), { code: "INVALID_INPUT" });
    if (!form.hasAttribute("toolautosubmit")) {
      form.querySelector("[type=submit], button:not([type])")?.focus();
      return { submitted: false, next: "Ask the user to review the form and submit it." };
    }
    let response;
    // The explainer's SubmitEvent#agentInvoked and #respondWith(), for the page's submit handlers.
    const mark = (event) => {
      if (event.target !== form) return;
      Object.defineProperties(event, {
        agentInvoked: { value: true },
        respondWith: { value: (promise) => void (response = promise) },
      });
    };
    addEventListener("submit", mark, true);
    try {
      form.requestSubmit();
    } finally {
      removeEventListener("submit", mark, true);
    }
    return response ? await response : { submitted: true, next: "The page may navigate: read it for the result." };
  };
}

/**
 * Exposes every `<form toolname>` of the page as a tool, and follows them as the page changes. Does
 * nothing where WebMCP is missing or where the browser runs the declarative API itself.
 * @returns {{dispose(): void}}
 */
export function forms() {
  const doc = globalThis.document;
  if (!doc || typeof context()?.registerTool !== "function" || "toolName" in HTMLFormElement.prototype) {
    return { dispose() {} };
  }
  const live = new Map();
  const sync = () => {
    for (const [form, entry] of live) {
      if (!form.isConnected || entry.key !== key(form)) {
        entry.controller.abort();
        live.delete(form);
      }
    }
    for (const form of doc.querySelectorAll("form[toolname]")) {
      if (live.has(form)) continue;
      const controller = new AbortController();
      const inputSchema = formSchema(form);
      live.set(form, { key: key(form), controller });
      register(
        {
          // Names allow [A-Za-z0-9_.-]: "Search flights" becomes "Search_flights".
          name: form.getAttribute("toolname").trim().replace(/[^A-Za-z0-9_.-]+/g, "_"),
          description: form.getAttribute("tooldescription") ?? "",
          inputSchema,
          annotations: form.method === "get" ? { readOnlyHint: true } : { consequentialHint: true },
          execute: contract(inputSchema, runForm(form)),
        },
        controller.signal,
      );
    }
  };
  const key = (form) => [form.getAttribute("toolname"), form.getAttribute("tooldescription")].join("\n");
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["toolname", "tooldescription"],
  });
  return {
    dispose() {
      observer.disconnect();
      for (const { controller } of live.values()) controller.abort();
      live.clear();
    },
  };
}
