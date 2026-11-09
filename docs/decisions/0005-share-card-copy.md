# 0005: What the share card says

- **Status:** accepted (2026-11-09)
- **Code:** `crates/webmcpx-bench/src/card.rs` (`html`, `hook`, `share_text`, `best_saving`),
  `crates/webmcpx-bench/src/card/text.rs` (the words, 11 languages), `crates/webmcpx-bench/src/server.rs`
  (`share_page`)

## Context

The scan card is what people post (Save PNG, 1600×900) and what a shared scan link previews (1200×630). A
review of the card against what makes result cards spread and what X shows (research report "Card viral do
webmcpx", 2026-11-09) found three problems: the call to scan your own site was the smallest text on the card
(about 10 px on a phone), nothing told the viewer why it matters, and two lines said more than the scan
measures.

## Decision

- **Only what is measured.** "Agents read ~N tokens of this page and guess" lost "and guess": the scan
  measures the page's size, not how an agent behaves. A page under 2,000 tokens gets just the finding ("No
  WebMCP tools for agents to call."); a few hundred tokens says little. The generic image no longer says "One
  line makes it agent-ready": one script tag earns at most 65 points (decision 0002), agent-ready needs 70.
- **A second, bold line that gives a reason to care:**
  - *Not agent-ready:* "With WebMCP: up to 62× fewer tokens in our benchmark." The number is the
    leaderboard's best case, computed from the published runs (`site/src/lib/content/bench/*.json`, the same
    figure the landing quotes) and always framed as "up to": it is a real measured result, and "up to" is
    what makes it true. Never a median or an average.
  - *Almost:* "N points to agent-ready." (70 minus the score), from the score itself.
  - *Agent-ready:* nothing; the stamp and the score say it.
- **The call to action is big and on the right:** "Is your site agent-ready? webmcpx.dev" at 44 px of layout
  (59 px in the PNG), under the score; the date moves to the bottom left. X lays the link's domain over the
  bottom-left corner of a link card.
- **Preview text complements the image:** the title is host, verdict and score; the description adds the bold
  line and the call to action; `og:image:alt` and `twitter:image:alt` describe the card.

## Open

- Red vs a softer stamp, and "Not agent-ready" vs "No WebMCP tools": a guess either way until there is data.
  Count card renders and Save PNG downloads by verdict and language first.
- A percentile ("better than N% of scanned sites") needs a published method and a denominator; none exists.
