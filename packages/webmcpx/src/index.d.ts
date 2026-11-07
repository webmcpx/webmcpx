export type ToolName = "get_page_context" | "search_page" | "fetch_as_markdown" | "search_site";

export interface SiteSearchResult {
  title: string;
  url: string;
  snippet?: string;
}

export interface Options {
  /** Tools to register. Default: get_page_context, search_page, fetch_as_markdown (+ search_site when `searchSite` is set). */
  tools?: ToolName[];
  /** Element (or selector) holding the main content. Default: `main`, `[role=main]`, `article`, else `body`. */
  root?: Element | string;
  /** Backend search for `search_site`. Return results best first. */
  searchSite?: (query: string, options: { limit: number; signal?: AbortSignal }) => Promise<SiteSearchResult[]>;
  /** Where to load the WebAssembly module from (URL, Response or bytes). Default: next to the loader. */
  wasm?: string | URL | Response | BufferSource | WebAssembly.Module;
}

export interface Registration {
  registered: ToolName[];
  failed: { name: string; error: string }[];
  /** Unregisters every tool registered by this call. */
  dispose(): void;
}

/** Registers webmcpx standard tools. A no-op (empty `registered`) where WebMCP is unavailable. */
export function register(options?: Options): Promise<Registration>;

/** The tool contracts (name, title, description, inputSchema, annotations). */
export const TOOLS: Record<ToolName, {
  name: ToolName;
  title: string;
  description: string;
  inputSchema: object;
  annotations: Record<string, boolean>;
}>;

/** What every tool resolves with (as a JSON string). */
export type Envelope<T = unknown> =
  | { ok: true; data: T; truncated?: true; next_cursor?: string; hint?: string }
  | { ok: false; error: { code: string; message: string; retryable: boolean }; hint?: string };

/** An input field: a JSON type ("string", "number?" for optional), a list of choices, or a property schema. */
export type InputField = string | readonly (string | number)[] | Record<string, unknown>;

export interface ToolDefinition<I = any, O = unknown> {
  /** 1–128 of A-Z a-z 0-9 _ . - (keep it under 30). */
  name: string;
  /** What it does and when to use it (under 500 chars). */
  description: string;
  /** Shorthand (`{ sku: "string", "qty?": "number", size: ["S", "M"] }`) or a JSON Schema with `type`. */
  input?: Record<string, InputField> | { type: "object"; [key: string]: unknown };
  /** Returns the data for `{ ok: true, data }`. Throw for errors; an error with a webmcpx `code` keeps it. */
  run(input: I, client?: unknown): O | Promise<O>;
  /** Only reads (readOnlyHint). */
  readOnly?: boolean;
  /** Changes something for the user: cart, booking, message (consequentialHint). */
  acts?: boolean;
  /** Returns third-party content, like reviews or comments (untrustedContentHint). */
  untrusted?: boolean;
  /** Abort to unregister. */
  signal?: AbortSignal;
}

export interface ToolHandle {
  /** Resolves true once registered, false where WebMCP is missing or the host refused it. */
  ready: Promise<boolean>;
  /** Unregisters the tool. */
  dispose(): void;
}

/** Registers one of your own tools with the webmcpx contract. A no-op where WebMCP is missing. */
export function tool<I = any, O = unknown>(definition: ToolDefinition<I, O>): ToolHandle;

/** Exposes every `<form toolname>` as a tool (WebMCP declarative API), following DOM changes. */
export function forms(): { dispose(): void };

/** The JSON Schema an input shorthand stands for. */
export function schema(input?: ToolDefinition["input"]): object;
