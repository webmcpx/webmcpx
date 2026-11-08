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
	// What people paste into their coding agent: plain English, which every agent reads.
	agentPrompt: {
		lang: 'text',
		code: 'Add WebMCP to this site with webmcpx: run `npx skills add webmcpx/webmcpx -y`, follow the skill, then check the tools with `npx webmcpx tools <local URL>`.'
	},
	npmUsage: {
		lang: 'js',
		code: `// npm i webmcpx
import { register } from "webmcpx";

register(); // the standard tools; tool() adds your own`
	},
	// Step 2 for any coding agent: it adds the MCP server to its own config.
	mcpPrompt: {
		lang: 'text',
		code: 'Add the webmcpx MCP server to your MCP config (command: `npx`, args: `["-y", "webmcpx", "mcp"]`), so you can call the WebMCP tools of any page you open.'
	},
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
