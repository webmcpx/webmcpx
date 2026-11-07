// Every code sample on the site. Highlighted at build time (`server/highlight.ts`), so the browser gets
// plain HTML and no highlighter.

export type Lang = 'html' | 'js' | 'sh' | 'json' | 'text';

export interface CodeSample {
	lang: Lang;
	code: string;
}

export interface Highlighted extends CodeSample {
	html: string;
}

/** The loader every site pastes (and this site runs itself). */
export const LOADER_URL = 'https://cdn.jsdelivr.net/npm/webmcpx@0.1/src/auto.js';
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

/** The MCP server for any client, and the local check (shown inline under "See it work"). */
export const MCP_COMMAND = 'npx -y webmcpx mcp';
export const CHECK_COMMAND = 'npx webmcpx tools localhost:3000';

/** Other ways in, shown as one-liners next to the script tag (who each is for: `fix.alternatives.<id>`). */
export const ALTERNATIVES = [
	{ id: 'npm', code: 'npm i webmcpx' },
	{ id: 'agent', code: 'npx skills add webmcpx/webmcpx' }
] as const;
