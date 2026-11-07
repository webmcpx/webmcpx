// "Why WebMCP?": every reason that holds up, ranked by evidence (research: reports/Por que adotar WebMCP.md,
// outside the repo, 2026-11-07). Each claim names its source; our own benchmark is labelled as ours. Left
// out on purpose, because the evidence is thin or points the other way: "safer", accessibility, analytics,
// discoverability, "faster than APIs".

export interface Source {
	label: string;
	href: string;
}

export interface Reason {
	id: 'finish' | 'tokens' | 'speed' | 'backend' | 'loop' | 'state' | 'control' | 'small';
	title: string;
	pain: string;
	/** May contain `{best}` and `{bestSite}`, filled from the published benchmark. */
	gain: string;
	sources: Source[];
}

const SPEC = { label: 'WebMCP draft', href: 'https://webmachinelearning.github.io/webmcp/' };
const EXPLAINER = { label: 'WebMCP explainer', href: 'https://github.com/webmachinelearning/webmcp' };
const MIND2WEB = { label: 'Online-Mind2Web, 2025', href: 'https://arxiv.org/abs/2504.01382' };
const WINDTUNNEL = { label: 'WindTunnel (nekuda)', href: 'https://webmcp.com/benchmark' };
const OURS = { label: 'Our benchmark', href: '#proof' };

/** Strongest evidence first: the first four carry the section, the rest support it. */
export const REASONS: Reason[] = [
	{
		id: 'finish',
		title: 'Agents that finish the job',
		pain: 'On live sites, the best agent tested failed about 4 in 10 tasks, mostly on filters, sorting and navigation.',
		gain: 'Agents call a tool with a typed input instead of guessing which button does what.',
		sources: [MIND2WEB, WINDTUNNEL, OURS]
	},
	{
		id: 'tokens',
		title: 'A fraction of the tokens',
		pain: 'One page snapshot can cost 12k to 77k tokens, and the agent sends it again at every step.',
		gain: 'A call returns just the data it asked for: up to {best} fewer tokens on {bestSite} in our benchmark (best case).',
		sources: [
			{
				label: 'Snapshot cost, measured',
				href: 'https://dev.to/nitai_aharoni_1006318cb51/what-a-browser-mcp-snapshot-actually-costs-i-measured-it-46if'
			},
			OURS
		]
	},
	{
		id: 'speed',
		title: 'Seconds, not minutes',
		pain: 'Look, think, click, repeat: on hard live tasks, agents ran for up to 44 minutes.',
		gain: 'One call replaces a chain of clicks: a 3.4× faster median in WindTunnel’s benchmark.',
		sources: [MIND2WEB, WINDTUNNEL]
	},
	{
		id: 'backend',
		title: 'No new server. No OAuth.',
		pain: 'Giving agents an API usually means a separate backend, duplicated state and an auth flow.',
		gain: 'Tools are your front-end code, running with the session the user already has. Shopify ships it this way.',
		sources: [
			EXPLAINER,
			{ label: 'Shopify', href: 'https://shopify.dev/changelog/webmcp-liquid-hydrogen' },
			{ label: 'Cloudflare', href: 'https://blog.cloudflare.com/webmcp/' }
		]
	},
	{
		id: 'loop',
		title: 'The user stays in the loop',
		pain: 'Agents act out of sight, or send the user somewhere else.',
		gain: 'The agent works on the page the user sees, and tools can flag actions that need a confirmation.',
		sources: [
			SPEC,
			{ label: 'Shopify checkout', href: 'https://shopify.dev/changelog/webmcp-support-for-checkout' }
		]
	},
	{
		id: 'state',
		title: 'Same cart, same form',
		pain: 'A backend API can’t see the cart, form or selection open in the user’s tab.',
		gain: 'Tools act on the state the user sees, so the page updates as the agent works.',
		sources: [{ label: 'Shopify', href: 'https://shopify.dev/changelog/webmcp-liquid-hydrogen' }]
	},
	{
		id: 'control',
		title: 'You decide what agents can do',
		pain: 'An agent that reads the page can click anything the user can.',
		gain: 'You publish the actions, their inputs and your own validation.',
		sources: [SPEC]
	},
	{
		id: 'small',
		title: 'Small to add, safe to ignore',
		pain: 'Agent readiness sounds like a big project.',
		gain: 'A few tool registrations. Browsers without WebMCP skip them, and one header turns them off.',
		sources: [SPEC]
	}
];

/** Said under the section, so no reason reads as more than it is. */
export const STATUS =
	'WebMCP is a W3C Community Group draft (2 November 2026), not a W3C standard, in a Chrome origin trial. Annotations are hints a site declares, not guarantees.';
