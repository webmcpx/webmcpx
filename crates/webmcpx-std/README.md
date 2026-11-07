# webmcpx-std

The standard WebMCP tools of [webmcpx](https://github.com/webmcpx/webmcpx) as pure Rust: `search_page`
(BM25-ranked passages), `fetch_as_markdown` (paged Markdown), `get_page_context` and `search_site`, each a
`&str -> envelope JSON` function with output budgets and paging. `no_std`.

The [npm loader](https://www.npmjs.com/package/webmcpx) reads the page and runs these functions as
WebAssembly in the browser; this crate is the tested core behind it.

License: MIT.
