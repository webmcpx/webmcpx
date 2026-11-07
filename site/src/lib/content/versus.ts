// "WebMCP vs MCP": what each one is, from the WebMCP draft (2 November 2026) and the MCP specification
// (revision 2026-07-28: stateless, sampling and roots deprecated, tasks an extension). MCP's annotation names
// were checked against its schema.ts. WebMCP is not MCP on the wire: no JSON-RPC, tools only.

import type { Messages } from '#lib/i18n/dict/en.ts';
import type { Source } from './why.ts';

/** The rows, in order; each one's label and both values live in the dictionary under `versus.rows.<id>`. */
export const VERSUS = [
	'where',
	'call',
	'run',
	'auth',
	'discovery',
	'lifetime',
	'user',
	'covers',
	'hints',
	'status'
] as const satisfies readonly (keyof Messages['versus']['rows'])[];

export const VERSUS_SOURCES: Source[] = [
	{ key: 'draft', href: 'https://webmachinelearning.github.io/webmcp/' },
	{ key: 'explainer', href: 'https://github.com/webmachinelearning/webmcp' },
	{ key: 'mcpSpec', href: 'https://modelcontextprotocol.io/specification/2026-07-28' },
	{ key: 'shopifyBoth', href: 'https://shopify.dev/docs/api/web-mcp' }
];
