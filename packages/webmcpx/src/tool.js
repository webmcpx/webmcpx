// Your own tools, with the standard tools' contract, and <form toolname> (webmcp's
// declarative-api-explainer.md) where the browser lacks it.
import { CODES, LIMITS } from "./generated.js";

const context = () => globalThis.document?.modelContext ?? globalThis.navigator?.modelContext;
const envelope = (body) => JSON.stringify(body);
const fail = (code, message, hint) =>
  envelope({ ok: false, error: { code, message, retryable: CODES[code] }, ...(hint && { hint }) });
const NAME = /^[A-Za-z0-9_.-]{1,128}$/;
let count = 0;

/** Input shorthand to JSON Schema: `{ sku: "string", qty: "number?", size: ["S", "M"] }` (see index.d.ts). */
export function schema(input = {}) {
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

// Assertions not checked here (if they appear, the input is refused): see check().
const UNCHECKED = ["if", "patternProperties", "propertyNames", "dependentRequired", "dependentSchemas", "contains", "prefixItems", "unevaluatedProperties", "unevaluatedItems", "$dynamicRef"];

const TYPES = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  integer: Number.isInteger,
  boolean: (v) => typeof v === "boolean",
  array: Array.isArray,
  null: (v) => v === null,
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
};

// JSON equality, by content.
const same = (a, b) =>
  a === b ||
  (typeof a === "object" && typeof b === "object" && a !== null && b !== null && Array.isArray(a) === Array.isArray(b) &&
    Object.keys(a).length === Object.keys(b).length && Object.keys(a).every((k) => Object.hasOwn(b, k) && same(a[k], b[k])));

// Per check (synchronous): the root for local $refs, ref depth, steps, a fatal error.
let root;
let depth = 0;
let steps = 0;
let fatal = "";
// RFC 6901: "#" is the root; after "#/", every token counts, empty ones included.
const resolve = (ref) =>
  ref === "#"
    ? root
    : ref.startsWith("#/")
      ? ref.slice(2).split("/").reduce((o, k) => o?.[k.replaceAll("~1", "/").replaceAll("~0", "~")], root)
      : undefined;

/** The first problem with `value` against JSON Schema `s` (the keywords tool inputs use), or "". */
function check(s, value, at = "input") {
  if (++steps > 100_000) return `${at}: too complex to check`;
  if (s === false) return `${at} is not allowed`;
  if (!s || typeof s !== "object") return "";
  if (s.$ref) {
    // Unknown or remote refs and runaway recursion refuse the input rather than skip the check.
    const target = depth < 32 ? resolve(s.$ref) : undefined;
    if (target === undefined) return (fatal = `${at}: can't check $ref ${s.$ref}`);
    depth++;
    const problem = check(target, value, at);
    depth--;
    if (problem) return problem;
  }
  const types = s.type === undefined ? [] : [].concat(s.type);
  if (types.length && !types.some((t) => TYPES[t]?.(value))) return `${at} must be of type ${types.join(" or ")}`;
  if (s.enum && !s.enum.some((e) => same(e, value))) return `${at} must be one of ${s.enum.join(", ")}`;
  if ("const" in s && !same(value, s.const)) return `${at} must be ${JSON.stringify(s.const)}`;
  for (const b of s.allOf ?? []) {
    const problem = check(b, value, at);
    if (problem) return problem;
  }
  if (s.anyOf && s.anyOf.every((b) => check(b, value, at))) return `${at} matches none of the allowed shapes`;
  if (s.oneOf && s.oneOf.filter((b) => !check(b, value, at)).length !== 1) return `${at} must match exactly one allowed shape`;
  // Fail closed: an assertion this checker doesn't run refuses the input instead of letting it through.
  const unknown = UNCHECKED.find((k) => k in s);
  if (unknown) return (fatal = `${at}: can't check ${unknown}`);
  if (s.not && !check(s.not, value, at)) return `${at} matches a shape that is not allowed`;
  if (typeof value === "number") {
    if (value < s.minimum) return `${at} must be at least ${s.minimum}`;
    if (value > s.maximum) return `${at} must be at most ${s.maximum}`;
    if (value <= s.exclusiveMinimum) return `${at} must be more than ${s.exclusiveMinimum}`;
    if (value >= s.exclusiveMaximum) return `${at} must be less than ${s.exclusiveMaximum}`;
    if (s.multipleOf && !Number.isInteger(value / s.multipleOf)) return `${at} must be a multiple of ${s.multipleOf}`;
  }
  if (typeof value === "string") {
    if (value.length < s.minLength) return `${at} must have at least ${s.minLength} chars`;
    if (value.length > s.maxLength) return `${at} must have at most ${s.maxLength} chars`;
    if (s.pattern && !new RegExp(s.pattern, "u").test(value)) return `${at} must match ${s.pattern}`;
  }
  if (Array.isArray(value)) {
    if (value.length < s.minItems) return `${at} must have at least ${s.minItems} items`;
    if (value.length > s.maxItems) return `${at} must have at most ${s.maxItems} items`;
    if (s.uniqueItems && value.some((v, i) => value.findIndex((w) => same(v, w)) !== i)) return `${at} must not repeat items`;
    for (let i = 0; i < value.length; i++) {
      const problem = check(s.items, value[i], `${at}[${i}]`);
      if (problem) return problem;
    }
  }
  if (TYPES.object(value)) {
    const n = Object.keys(value).length;
    if (n < s.minProperties || n > s.maxProperties) return `${at} has the wrong number of fields`;
    // Own properties only ("__proto__" is not a declared input).
    for (const key of s.required ?? []) if (!Object.hasOwn(value, key) || value[key] === undefined) return `\`${key}\` is required`;
    for (const [key, v] of Object.entries(value)) {
      const p = s.properties && Object.hasOwn(s.properties, key) ? s.properties[key] : s.additionalProperties;
      if (p === false) return `\`${key}\` is not an input of this tool`;
      const problem = p && v !== undefined ? check(p, v, `\`${key}\``) : "";
      if (problem) return problem;
    }
  }
  return "";
}

/** `run` in the standard contract: checked input, `{ok, data}` or `{ok: false, error}`. */
const contract = (inputSchema, run) => async (raw, client) => {
  let args;
  try {
    // Omitted input is {} (as in the spec); anything that is not an object is refused below.
    args = typeof raw === "string" ? JSON.parse(raw || "{}") : raw === undefined ? {} : raw;
  } catch {
    return fail("INVALID_INPUT", "the input is not JSON");
  }
  try {
    root = inputSchema;
    depth = 0;
    steps = 0;
    fatal = "";
    let problem = TYPES.object(args) ? check(inputSchema, args) : "the input must be an object";
    // Out of steps or an uncheckable $ref anywhere (even in a oneOf branch): refuse.
    if (steps > 100_000) problem = "the input is too complex to check";
    if (fatal) problem = fatal;
    if (problem) return fail("INVALID_INPUT", problem);
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

/** Registers one of your own tools (types and docs: index.d.ts). */
export function tool({ name, description, input, inputSchema = schema(input), run, readOnly, acts, untrusted, signal } = {}) {
  const controller = new AbortController();
  if (signal?.aborted) return { ready: Promise.resolve(false), dispose() {} };
  signal?.addEventListener("abort", () => controller.abort(), { once: true });
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

const TOOL_ATTRIBUTES = ["toolname", "tooldescription", "toolautosubmit"];
// What a control contributes to the schema (option values included).
const CONTROL_ATTRIBUTES = ["name", "type", "required", "disabled", "readonly", "min", "max", "multiple", "value", "toolparamdescription", "method"];
const FORMATS = { email: "email", url: "uri", date: "date", "datetime-local": "date-time", time: "time" };
const SKIPPED = /^(submit|button|reset|image|file|password|hidden)$/;

/** A form's input schema, per the declarative explainer: control `name`s, `toolparamdescription`s. */
export function formSchema(form) {
  const properties = {};
  const required = [];
  for (const el of form.elements) {
    const { name, type } = el;
    if (!fillable(el)) continue;
    let p;
    // Several checkboxes with one name: a set of choices.
    if (type === "checkbox" && [...form.elements].filter((e) => e.name === name && fillable(e)).length > 1) {
      (p = properties[name] ?? { type: "array", items: { enum: [] } }).items.enum.push(el.value);
    } else if (type === "checkbox") p = { type: "boolean" };
    else if (type === "radio") (p = properties[name] ?? { type: "string", enum: [] }).enum.push(el.value);
    else if (el.tagName === "SELECT") {
      // Disabled choices (or in a disabled optgroup) are not offered: a form would not send them.
      p = { type: "string", enum: [...el.options].filter((o) => !o.matches(":disabled")).map((o) => o.value) };
      if (el.multiple) p = { type: "array", items: p };
    } else if (type === "number" || type === "range") {
      p = { type: "number", ...(el.min && { minimum: +el.min }), ...(el.max && { maximum: +el.max }) };
    } else p = { type: "string", ...(FORMATS[type] && { format: FORMATS[type] }) };
    const description =
      el.getAttribute("toolparamdescription") || (!p.items && (el.labels?.[0]?.textContent.trim() || el.getAttribute("placeholder")));
    if (description) p.description = description;
    properties[name] = p;
    if (el.required && !required.includes(name)) required.push(name);
  }
  // Only fields it shows: never hidden, password or disabled ones.
  return { type: "object", properties, ...(required.length && { required }), additionalProperties: false };
}

/** A control a user could edit: named, enabled (fieldsets too), not readonly, hidden, password or a file. */
const fillable = (el) =>
  el.name && !el.matches(":disabled, [readonly]") && !SKIPPED.test(el.type) && "value" in el && el.tagName !== "BUTTON";

function fill(form, args) {
  for (const [name, value] of Object.entries(args)) {
    const field = form.elements.namedItem(name);
    for (const el of (field instanceof Element ? [field] : [...(field ?? [])]).filter(fillable)) {
      // Click / native setter: frameworks (React) ignore plain property writes.
      const on = el.type === "checkbox" ? ([].concat(value).includes(el.value) || value === true) : el.value === String(value);
      if (el.type === "checkbox" || el.type === "radio") {
        if (el.checked !== on) el.click();
        continue;
      }
      if (el.multiple) for (const o of el.options) o.selected = !o.matches(":disabled") && [].concat(value).includes(o.value);
      else Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set.call(el, String(value));
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
      // With its default submit button, as a user's click: its name and value go along, and
      // event.submitter is set (HTML: requestSubmit(submitter)).
      form.requestSubmit(form.querySelector(":is(button:not([type]), [type=submit]):not(:disabled)") ?? undefined);
    } finally {
      removeEventListener("submit", mark, true);
    }
    return response ? await response : { submitted: true, next: "The page may navigate: read it for the result." };
  };
}

/** Every `<form toolname>` as a tool, following DOM changes; not where the browser does it itself. */
export function forms() {
  const doc = globalThis.document;
  if (!doc || typeof context()?.registerTool !== "function" || "toolName" in HTMLFormElement.prototype) {
    return { dispose() {} };
  }
  const live = new Map();
  // A form's tool is its attributes plus the schema of its controls: re-registered when either changes.
  const key = (form) =>
    JSON.stringify([...TOOL_ATTRIBUTES.map((a) => form.getAttribute(a)), form.method, formSchema(form)]);
  const sync = () => {
    for (const [form, entry] of live) {
      if (!form.isConnected || !form.hasAttribute("toolname") || entry.key !== key(form)) {
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
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(doc.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [...TOOL_ATTRIBUTES, ...CONTROL_ATTRIBUTES],
  });
  return {
    dispose() {
      observer.disconnect();
      for (const { controller } of live.values()) controller.abort();
      live.clear();
    },
  };
}
