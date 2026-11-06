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
