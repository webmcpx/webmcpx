// Every code sample on the site. Highlighted at build time (`server/highlight.ts`), so the browser gets
// plain HTML and no highlighter.

export type Lang = 'html' | 'js' | 'jsx' | 'vue' | 'svelte' | 'sh' | 'json' | 'text';

export interface CodeSample {
	lang: Lang;
	code: string;
}

export interface Highlighted extends CodeSample {
	html: string;
}

/** The loader every site pastes (and this site runs itself). */
export const LOADER_URL = 'https://cdn.jsdelivr.net/npm/webmcpx@0.2/dist/auto.js';
const SCRIPT_TAG = `<script type="module" src="${LOADER_URL}"></` + 'script>';

export const SNIPPETS = {
	scriptTag: { lang: 'html', code: SCRIPT_TAG },
	// What people paste into their coding agent. The three prompts (this one, `mcpPrompt` and `OWN.agent`)
	// are the English source: each language shows and copies its own transcreation (`i18n/build/<code>.ts`,
	// applied by `server/localize.ts`), since agents read any language. `llms.txt` keeps this English text.
	agentPrompt: {
		lang: 'text',
		code: 'Add WebMCP to this site with webmcpx: run `npx skills add webmcpx/webmcpx -y`, follow the skill, then check the tools with `npx webmcpx tools <local URL>`.'
	},
	npmUsage: {
		lang: 'js',
		code: `// npm i webmcpx
import "webmcpx/polyfill"; // WebMCP where the browser lacks it
import { register } from "webmcpx";

register(); // the standard tools; tool() adds your own`
	},
	// Step 2 for any agent: llms.txt gives it both ways (MCP, or document.modelContext from its own
	// browser automation); it proves the setup on this site, which runs the loader itself.
	mcpPrompt: {
		lang: 'text',
		code: 'Use WebMCP first on every web page you work with, before reading or clicking anything: in your own browser and in any script you write or run (Playwright, Selenium, Puppeteer, browser-use, CDP), even if you support WebMCP natively. Set it up with webmcpx (read https://webmcpx.dev/llms.txt) and add this rule to your agent instructions (AGENTS.md, CLAUDE.md or equivalent) so it applies to every future task. Then prove it works: open https://webmcpx.dev, list its WebMCP tools and call one.'
	},
	// "What is WebMCP?": the smallest real tool, in the draft's own API (2026-11-02).
	registerTool: {
		lang: 'js',
		code: `document.modelContext.registerTool({
  name: "search_products",
  description: "Search the catalog by keyword.",
  inputSchema: { type: "object", properties: { query: { type: "string" } } },
  annotations: { readOnlyHint: true },
  async execute({ query }) {
    // Expected failures are answers, never rejections: hosts drop rejection reasons.
    try { return JSON.stringify(await searchCatalog(query)); }
    catch { return JSON.stringify({ error: "Catalog unavailable, try again shortly." }); }
  }
});`
	},
	reproduce: reproduceFor('gpt-6-luna')
} satisfies Record<string, CodeSample>;

/** How to rerun one model's benchmark: its provider's key, its id, effort medium (bench/AGENTS.md). */
export function reproduceFor(model: string): CodeSample {
	const key = model.startsWith('claude-')
		? 'ANTHROPIC_API_KEY'
		: model.startsWith('gemini-')
			? 'GEMINI_API_KEY'
			: 'OPENAI_API_KEY';
	return {
		lang: 'sh',
		code: `git clone https://github.com/webmcpx/webmcpx
cd webmcpx && just setup
${key}=... just bench --model ${model} --reasoning-effort medium`
	};
}

export type SnippetId = keyof typeof SNIPPETS;

// "Your own tools": the same tool, written each way a site can.
const DEFINITION = `{
  name: "add_to_cart",
  description: "Add a product to the cart by SKU.",
  input: { sku: "string", "qty?": "integer" },
  acts: true,
  run: ({ sku, qty = 1 }) => cart.add(sku, qty),
}`;
const indent = (s: string, by: string) => s.replaceAll('\n', `\n${by}`);

export const OWN = {
	agent: {
		lang: 'text',
		code: 'Read https://webmcpx.dev/llms.txt, then look at this project and suggest the WebMCP tools an AI agent would find useful here. Ask me which to add, then add them with webmcpx.'
	},
	react: {
		lang: 'jsx',
		code: `import { useTool } from "webmcpx/react";

function Cart({ cart }) {
  useTool(${indent(DEFINITION, '  ')});
  return <CartView cart={cart} />;
}`
	},
	vue: {
		lang: 'vue',
		code:
			`<script setup>
import { useTool } from "webmcpx/vue";

useTool(${DEFINITION});
</` + 'script>'
	},
	svelte: {
		lang: 'svelte',
		code:
			`<script>
  import { useTool } from "webmcpx/svelte";

  useTool(${indent(DEFINITION, '  ')});
</` + 'script>'
	},
	js: {
		lang: 'js',
		code: `import { tool } from "webmcpx";

tool(${DEFINITION});`
	},
	form: {
		lang: 'html',
		code: `<form toolname="add_to_cart" tooldescription="Add a product to the cart by SKU." action="/cart" method="post" toolautosubmit>
  <input name="sku" required toolparamdescription="Product SKU, e.g. MUG-01">
  <input name="qty" type="number" min="1" toolparamdescription="How many (default 1)">
  <button>Add to cart</button>
</form>`
	}
} satisfies Record<string, CodeSample>;

export type OwnId = keyof typeof OWN;
/**
 * Tab labels (product names, not translated), after "your coding agent" (its label is translated): the
 * frameworks by developer surveys, then plain JavaScript, then the form that needs none.
 */
export const OWN_TABS: Record<Exclude<OwnId, 'agent'>, string> = {
	react: 'React',
	vue: 'Vue',
	svelte: 'Svelte',
	js: 'JavaScript',
	form: 'HTML'
};
