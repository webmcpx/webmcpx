// Build time only: the site as text for agents (llms.txt, llms-full.txt, /index.md) and the sitemap.
// Everything is generated from the same sources as the pages (copy, snippets, benchmark runs), so the
// Markdown never drifts from the HTML.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import en from '#lib/i18n/dict/en.ts';
import { fmt } from '#lib/i18n/format.ts';
import { LOCALES, localized } from '#lib/i18n/locales.ts';
import { ORIGIN, REPO, SPEC } from '#lib/content/site.ts';
import { LOADER_URL, SNIPPETS } from '#lib/content/snippets.ts';
import { VERSUS as VERSUS_ROWS } from '#lib/content/versus.ts';
import { REASONS } from '#lib/content/why.ts';
import type { ArmSummary } from '#lib/features/benchmark/bench.ts';
import { bySite } from '#lib/features/benchmark/sites.ts';
import { loadRuns } from './bench.ts';

// The build runs in site/; README.md and the skill live at the repository root (deploy copies them too).
const read = (path: string) => readFile(resolve(process.cwd(), '..', path), 'utf8');

/**
 * Per model, per site, per question: both arms' tokens and solve rate, from the run itself. Never averaged
 * across questions or sites (site/AGENTS.md).
 */
function benchmarkLines(): string[] {
	const pct = (x: number) => `${Math.round(x * 100)}%`;
	const tok = (x: number) => `${(x / 1000).toFixed(1)}k`;
	const arm = (a: ArmSummary | undefined) =>
		a ? `${tok(a.tokens)} tokens, ${pct(a.success_rate)} solved` : 'not run';
	return loadRuns().flatMap(({ results }) => [
		`### ${results.model} (reasoning ${results.reasoning_effort ?? 'default'})`,
		'',
		...bySite(results).flatMap((site) => [
			`- ${site.name}`,
			...site.tasks.map(
				(t) => `  - "${t.prompt}": without WebMCP ${arm(t.baseline)}; with WebMCP ${arm(t.webmcp)}`
			)
		]),
		'',
		`Details: ${ORIGIN}/benchmark/${results.model}/`,
		''
	]);
}

const SEE_IT_WORK = `- Any agent, today: \`claude mcp add webmcpx -- npx -y webmcpx mcp\` (Codex, Cursor or any MCP client: \`npx -y webmcpx mcp\`). It opens pages in a local Chromium with the W3C WebMCP polyfill injected before page scripts (no browser flag), and gives the agent each page's WebMCP tools as MCP tools: the site's own plus search_page, fetch_as_markdown and get_page_context.
- Check a site's tools, localhost included: \`npx webmcpx tools localhost:3000\`; call one: \`npx webmcpx call <url> <tool> '<json>'\`.
- Native: the ChatGPT desktop app's browser and Codex call a site's WebMCP tools (https://learn.chatgpt.com/docs/webmcp). Chrome: chrome://flags/#enable-webmcp-testing, or an origin-trial token in a <meta http-equiv="origin-trial"> tag.`;

const OWN_TOOLS = `A site's own tools (add to cart, book, filter) get the same contract with tool():
\`\`\`js
import { tool } from "webmcpx"; // or useTool from "webmcpx/react" (16.8+), "webmcpx/vue" (2.7+), "webmcpx/svelte" (3+)
tool({ name: "add_to_cart", description: "Add a product to the cart by SKU.", input: { sku: "string", "qty?": "integer" }, acts: true, run: ({ sku, qty = 1 }) => cart.add(sku, qty) });
\`\`\`
Input shorthand: "type", "type?" (optional), [choices]; or inputSchema with a full JSON Schema (checked before run()). run() returns data; a thrown error becomes {ok:false, error}. No JavaScript: <form toolname="..." tooldescription="..."> with toolparamdescription on fields (and toolautosubmit) is a tool (WebMCP declarative API), added by the script tag where the browser lacks it.`;

const SCAN_API = `GET ${ORIGIN}/api/scan?url=<site> returns JSON: { url, final_url, title, verdict: "ready" | "issues" | "missing", tools: [{ name, description, ... }], diagnostics: [{ rule, severity, message }], page_tokens, elapsed_ms }. One scan per minute per visitor; results from the last minutes are free. Share a result: ${ORIGIN}/?scan=<site>. README badge: ${ORIGIN}/badge/<host>.svg.`;

export function llmsTxt(): string {
	return `# webmcpx

> Make your site agent-ready: one script tag registers standard WebMCP tools (search_page, fetch_as_markdown, get_page_context), a linter checks your own tools, and a public benchmark measures the difference. MIT, open source.

WebMCP (${SPEC}) is a W3C Community Group draft, not a W3C standard: a page registers tools with document.modelContext.registerTool() and agents in the browser call them instead of reading the page.

## Install

- Script tag: \`<script type="module" src="${LOADER_URL}"></script>\` before </body>. A no-op where WebMCP is missing.
- npm: \`npm i webmcpx\`, then \`import { register } from "webmcpx"; await register();\`
- MCP server for your agent: \`npx -y webmcpx mcp\` (Claude Code: \`claude mcp add webmcpx -- npx -y webmcpx mcp\`).
- Coding agent: \`npx skills add webmcpx/webmcpx -y\` installs the webmcpx skill.
- Linter: \`cargo install webmcpx\` (needs Rust), then \`webmcpx lint src/\` (\`--format json\` for machines).

## See it work

${SEE_IT_WORK}

## Your own tools

${OWN_TOOLS}

## Docs

- [This page as Markdown](${ORIGIN}/index.md): what webmcpx is, why, the benchmark, WebMCP vs MCP.
- [README](${REPO}#readme): tools, result shape, linter rules.
- [Agent skill](${REPO}/blob/main/skills/webmcpx/SKILL.md): step-by-step for coding agents.
- [Scan API](${ORIGIN}/api/scan?url=https://webmcpx.dev): ${SCAN_API}
- [Benchmark results](${REPO}/tree/main/site/src/lib/content/bench): every question, both arms, every model.

## Optional

- [Full text for agents](${ORIGIN}/llms-full.txt): this file, the README and the skill in one.
- [Brand](${ORIGIN}/brand/): name, marks and usage rules.
`;
}

export async function llmsFullTxt(): Promise<string> {
	const [readme, skill] = await Promise.all([read('README.md'), read('skills/webmcpx/SKILL.md')]);
	return `${llmsTxt()}\n---\n\n# README\n\n${readme}\n---\n\n# Agent skill (skills/webmcpx/SKILL.md)\n\n${skill}`;
}

/** The home page as Markdown (English). */
export function homeMarkdown(): string {
	const m = en;
	const reasons = REASONS.map((r) => {
		const t = m.why.reasons[r.id];
		return `- **${t.title}.** Today: ${t.pain} With WebMCP: ${fmt(t.gain, { best: 'many times', bestSite: 'a docs site' })}`;
	}).join('\n');
	const versus = VERSUS_ROWS.map((id) => {
		const row = m.versus.rows[id];
		return `| ${row.label} | ${row.webmcp} | ${row.mcp} |`;
	}).join('\n');
	return `# webmcpx: make your site agent-ready

${m.hero.lead}

## Install

\`\`\`html
${SNIPPETS.scriptTag.code}
\`\`\`

Or \`npm i webmcpx\`. Or ask your coding agent: "${SNIPPETS.agentPrompt.code}"

### See it work

${SEE_IT_WORK}

### Your own tools

${OWN_TOOLS}

## Scan any site

${SCAN_API}

## Why WebMCP

${reasons}

${m.why.status}

## Benchmark (same agent, same question, with and without WebMCP)

${benchmarkLines().join('\n')}

Grading is deterministic (facts in the answer and page state), never an LLM judge. Selected cases on the page; every result is public: ${REPO}/tree/main/site/src/lib/content/bench

## WebMCP vs MCP

| | WebMCP | MCP |
|---|---|---|
${versus}

${m.versus.verdict}

## Links

- Source: ${REPO}
- Spec: ${SPEC}
- Languages: ${LOCALES.map((l) => `[${l.name}](${ORIGIN}${localized('/', l.code)})`).join(', ')}
`;
}

/** Every prerendered page, in every language. */
export function sitemapXml(): string {
	const pages = ['/', '/brand/', ...loadRuns().map((r) => `/benchmark/${r.results.model}/`)];
	const urls = pages.flatMap((path) => LOCALES.map((l) => `${ORIGIN}${localized(path, l.code)}`));
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
}
