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
export const LOADER_URL = 'https://cdn.jsdelivr.net/npm/webmcpx@0.2/src/auto.js';
const SCRIPT_TAG = `<script type="module" src="${LOADER_URL}"></` + 'script>';

export const SNIPPETS = {
	scriptTag: { lang: 'html', code: SCRIPT_TAG },
	// What people paste into their coding agent: plain English, which every agent reads.
	agentPrompt: {
		lang: 'text',
		code: 'Add WebMCP to this site with webmcpx: run `npx skills add webmcpx/webmcpx -y`, follow the skill, then check the tools with `npx webmcpx tools <local URL>`.'
	},
	// Gives a coding agent the WebMCP tools of every page it opens (the MCP server in the npm package).
	agentMcp: { lang: 'sh', code: 'claude mcp add webmcpx -- npx -y webmcpx mcp' },
	reproduce: {
		lang: 'sh',
		code: `git clone https://github.com/webmcpx/webmcpx
cd webmcpx && just setup
OPENAI_API_KEY=sk-... just bench`
	}
} satisfies Record<string, CodeSample>;

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
	form: {
		lang: 'html',
		code: `<form toolname="search_flights" tooldescription="Search flights by route and date." action="/search">
  <input name="from" required toolparamdescription="Departure airport, e.g. GRU">
  <input name="to" required toolparamdescription="Arrival airport, e.g. LIS">
  <input name="date" type="date" required>
  <button>Search</button>
</form>`
	},
	js: {
		lang: 'js',
		code: `import { tool } from "webmcpx";

tool(${DEFINITION});`
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
	}
} satisfies Record<string, CodeSample>;

export type OwnId = keyof typeof OWN;
/** Tab labels: product and language names, not translated. */
export const OWN_TABS: Record<OwnId, string> = {
	form: 'HTML',
	js: 'JavaScript',
	react: 'React',
	vue: 'Vue',
	svelte: 'Svelte'
};

/** The MCP server for any client, and the local check (shown inline under "See it work"). */
export const MCP_COMMAND = 'npx -y webmcpx mcp';
export const CHECK_COMMAND = 'npx webmcpx tools localhost:3000';

/** Other ways in, shown as one-liners next to the script tag (who each is for: `fix.alternatives.<id>`). */
export const ALTERNATIVES = [
	{ id: 'npm', code: 'npm i webmcpx' },
	{ id: 'agent', code: 'npx skills add webmcpx/webmcpx' }
] as const;
