//! The standard tool contracts. Changing one is a public API change: run `just gen` and
//! review the diff of `packages/webmcpx/src/generated.js`.

use webmcpx_core::{Annotation, ToolDef};

const PAGE_CONTENT: &[Annotation] = &[Annotation::ReadOnly, Annotation::UntrustedContent];

pub const GET_PAGE_CONTEXT: ToolDef = ToolDef {
    name: "get_page_context",
    title: "Get page context",
    description: "Describe the page the user is on: title, URL, language, meta description, \
        heading outline and the text the user has selected. Use it for the page's structure or \
        the user's selection; to find a fact on the page, call search_page instead.",
    input_schema: r#"{"type":"object","properties":{},"additionalProperties":false}"#,
    annotations: PAGE_CONTENT,
};

pub const SEARCH_PAGE: ToolDef = ToolDef {
    name: "search_page",
    title: "Search this page",
    description: "Find passages on the current page that match a query. Returns up to `limit` \
        passages ranked by relevance, each with its section heading and a link to it. Prefer \
        it to reading the whole page when looking for something specific.",
    input_schema: r#"{"type":"object","properties":{"query":{"type":"string","description":"Words to look for."},"limit":{"type":"integer","minimum":1,"maximum":20,"default":5,"description":"Maximum passages to return."}},"required":["query"],"additionalProperties":false}"#,
    annotations: PAGE_CONTENT,
};

pub const FETCH_AS_MARKDOWN: ToolDef = ToolDef {
    name: "fetch_as_markdown",
    title: "Read page as Markdown",
    description: "Return the main content of the current page as Markdown. Long pages come in \
        parts: when `truncated` is true, call again with `cursor` set to `next_cursor`.",
    input_schema: r#"{"type":"object","properties":{"cursor":{"type":"string","description":"The next_cursor value from a previous call."},"max_chars":{"type":"integer","minimum":100,"maximum":20000,"default":2000,"description":"Maximum characters to return."}},"additionalProperties":false}"#,
    annotations: PAGE_CONTENT,
};

/// Needs a site-provided search function; the loader registers it only when given one.
pub const SEARCH_SITE: ToolDef = ToolDef {
    name: "search_site",
    title: "Search this website",
    description: "Search the whole website and return matching pages with title, URL and a \
        short snippet. Use it to find pages other than the current one.",
    input_schema: r#"{"type":"object","properties":{"query":{"type":"string","description":"Words to look for."},"limit":{"type":"integer","minimum":1,"maximum":20,"default":5,"description":"Maximum pages to return."}},"required":["query"],"additionalProperties":false}"#,
    annotations: PAGE_CONTENT,
};

pub const ALL: [ToolDef; 4] = [
    GET_PAGE_CONTEXT,
    SEARCH_PAGE,
    FETCH_AS_MARKDOWN,
    SEARCH_SITE,
];
