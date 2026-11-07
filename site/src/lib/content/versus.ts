// "WebMCP vs MCP": what each one is, from the WebMCP draft (2 November 2026) and the MCP specification
// (revision 2026-07-28: stateless, sampling and roots deprecated, tasks an extension). MCP's annotation names
// were checked against its schema.ts. WebMCP is not MCP on the wire: no JSON-RPC, tools only.

import type { Source } from './why.ts';

export interface VersusRow {
	label: string;
	webmcp: string;
	mcp: string;
}

export const VERSUS: VersusRow[] = [
	{
		label: 'Where tools run',
		webmcp: 'In your page’s JavaScript, in the user’s tab.',
		mcp: 'In a server process, local (stdio) or remote.'
	},
	{
		label: 'How agents call them',
		webmcp: 'A browser API, document.modelContext; the browser mediates each call. No JSON-RPC.',
		mcp: 'JSON-RPC 2.0 over stdio or Streamable HTTP.'
	},
	{
		label: 'What you run',
		webmcp: 'Your existing front end. No new server.',
		mcp: 'An MCP server you host and operate.'
	},
	{
		label: 'Auth',
		webmcp: 'The session the user is already signed in with. No tokens to issue.',
		mcp: 'OAuth-based authorization for remote servers.'
	},
	{
		label: 'Discovery',
		webmcp: 'Once the page is open. Nothing to find before a visit.',
		mcp: 'tools/list on a known endpoint, and public registries.'
	},
	{
		label: 'Lifetime',
		webmcp: 'As long as the page is open.',
		mcp: 'Always on, with no browser needed.'
	},
	{
		label: 'The user',
		webmcp: 'Present, on the same page as the agent.',
		mcp: 'Optional: works headless.'
	},
	{
		label: 'Covers',
		webmcp: 'Tools only, with input and output schemas.',
		mcp: 'Tools, resources and prompts, plus elicitation and extensions.'
	},
	{
		label: 'Hints on tools',
		webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Same-origin by default.',
		mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
	},
	{
		label: 'Status',
		webmcp: 'W3C Community Group draft; a Chrome origin trial.',
		mcp: 'A Linux Foundation project, 10,000+ public servers.'
	}
];

export const VERDICT =
	'MCP serves agents that never open your site. WebMCP serves agents working in your tab, beside your user. Run both on one backend: Shopify already does.';

export const VERSUS_SOURCES: Source[] = [
	{ label: 'WebMCP draft', href: 'https://webmachinelearning.github.io/webmcp/' },
	{ label: 'WebMCP explainer', href: 'https://github.com/webmachinelearning/webmcp' },
	{ label: 'MCP specification', href: 'https://modelcontextprotocol.io/specification/2026-07-28' },
	{ label: 'Shopify on both', href: 'https://shopify.dev/docs/api/web-mcp' }
];
