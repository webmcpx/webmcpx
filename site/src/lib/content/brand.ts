// The webmcpx brand: marks (path data from site/static/brand-assets, the downloadable source), the naming
// and wording rules, and the trademark notices. The /brand page and the site's logo read from here.
// Concepts and rationale: reports/Marca e logo do webmcpx.md (research), marks drawn with Codex.

import type { Logo } from './logos.ts';

/** Primary mark, "Junction": two chevrons facing each other with a gap, page and agent meeting at the
 * browser without merging; together they read as markup brackets and as the x of the name. */
export const JUNCTION: Logo = {
	viewBox: '0 0 24 24',
	paths: [{ d: 'M2 4H6.5L11 11V13L6.5 20H2L7 12Z' }, { d: 'M22 4H17.5L13 11V13L17.5 20H22L17 12Z' }],
	wordmark: false
};

/** Badge and app icon, "Card": the design system's card with its hard shadow, the Junction inside.
 * 32px and up only; below that, the Junction favicon. */
export const CARD: Logo = {
	viewBox: '0 0 24 24',
	paths: [
		{ d: 'M1 1H20V4H23V23H4V20H1Z M3 3V18H18V3Z', evenodd: true },
		{ d: 'M5 6.5H8L9.5 9.5V11.5L8 14.5H5L7 10.5Z' },
		{ d: 'M16 6.5H13L11.5 9.5V11.5L13 14.5H16L14 10.5Z' }
	],
	wordmark: false
};

/** Alternate, "Page with slot": a page frame with the tool it registers in its corner. */
export const PAGE_SLOT: Logo = {
	viewBox: '0 0 24 24',
	paths: [{ d: 'M3 3H13V5.5H5.5V18.5H18.5V11H21V21H3Z' }, { d: 'M15 3H21V9H15Z' }],
	wordmark: false
};

/** Junction knocked out of a rounded ink square: the favicon (16px) and every small square use. */
export const JUNCTION_FAVICON: Logo = {
	viewBox: '0 0 24 24',
	paths: [
		{
			d: 'M0 5a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5Z M5 6H8.5L11 11V13L8.5 18H5L8 12Z M19 6H15.5L13 11V13L15.5 18H19L16 12Z',
			evenodd: true
		}
	],
	wordmark: false
};

export interface Asset {
	label: string;
	file: string;
	use: string;
}

const files = (concept: string): Asset[] => [
	{
		label: 'Mark',
		file: `/brand-assets/${concept}/mark.svg`,
		use: 'One color (currentColor). Docs, READMEs, slides.'
	},
	{ label: 'Inverse', file: `/brand-assets/${concept}/mark-inverse.svg`, use: 'Paper on an ink square.' },
	{
		label: 'Favicon',
		file: `/brand-assets/${concept}/favicon.svg`,
		use: '16–32px. Follows light and dark mode.'
	},
	{ label: 'App icon', file: `/brand-assets/${concept}/app-icon-512.svg`, use: 'Color, for 512px exports.' },
	{ label: 'Avatar', file: `/brand-assets/${concept}/avatar.svg`, use: '20% padding: safe in a circle crop.' }
];

export const MARKS = [
	{ id: 'junction', name: 'Junction', role: 'Primary mark', logo: JUNCTION, assets: files('junction') },
	{ id: 'card', name: 'Card', role: 'Badge and app icon, 32px and up', logo: CARD, assets: files('card') },
	{ id: 'page-slot', name: 'Page with slot', role: 'Alternate', logo: PAGE_SLOT, assets: files('page-slot') }
];

/** How to write the name, and the words we use and avoid. */
export const NAMING = [
	'Always lowercase: webmcpx, also at the start of a sentence (rewrite the sentence instead).',
	'In code and commands, set it in Geist Mono.',
	'WebMCP is the browser API, spelled as the draft spells it. webmcp.zone is the community site.',
	'webmcpx is not WebMCP itself and never claims the name WebMCP.'
];

export const VOICE = {
	use: ['declares', 'exposes', 'calls', 'measured', 'tracks the Community Group draft', 'works with webmcpx'],
	avoid: ['official', 'W3C standard', 'W3C-compliant', 'MCP certified', 'revolutionary', 'magic']
};

/** Approved and forbidden phrasings about third-party marks (see TRADEMARK.md). */
export const PHRASES = {
	ok: [
		'Implements the WebMCP Draft Community Group Report of the W3C Web Machine Learning Community Group (not a W3C Standard).',
		'Built with webmcpx. Compatible with webmcpx.',
		'Works in Chrome with the WebMCP flag enabled.'
	],
	no: ['The official WebMCP library', 'W3C WebMCP standard', 'MCP certified', 'webmcpx for Chrome']
};

export const NOTICES = [
	'webmcpx is an independent project, not affiliated with or endorsed by LF Projects, the Agentic AI Foundation, Anthropic, W3C, Google or Microsoft.',
	'Model Context Protocol and the MCP logo are trademarks of LF Projects, LLC.',
	'W3C® is a trademark of the World Wide Web Consortium.'
];

/** Misuses, shown on the brand page. Each one is rendered as an example. */
export const MISUSE = [
	{ id: 'stretch', label: 'Don’t stretch or squash it' },
	{ id: 'rotate', label: 'Don’t rotate it' },
	{ id: 'outline', label: 'Don’t add outlines or strokes' },
	{ id: 'yellow', label: 'Don’t draw it in yellow' },
	{ id: 'shadow', label: 'Don’t add shadows or effects to the mark' },
	{ id: 'touch', label: 'Don’t close the gap between the chevrons' }
] as const;
