// The webmcpx brand: marks (path data from site/static/brand-assets, the downloadable source), their files,
// and the misuse examples; their text is in the dictionary (`brand.*`). The /brand page and the site's logo
// read from here.
// Concepts and rationale: reports/Marca e logo do webmcpx.md (research), marks drawn with Codex.

import type { Messages } from '#lib/i18n/dict/en.ts';
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

/** A downloadable file of a mark; its label and use live in the dictionary under `brand.logo.assets.<id>`. */
export interface Asset {
	id: keyof Messages['brand']['logo']['assets'];
	file: string;
}

const files = (concept: string): Asset[] => [
	{ id: 'mark', file: `/brand-assets/${concept}/mark.svg` },
	{ id: 'inverse', file: `/brand-assets/${concept}/mark-inverse.svg` },
	{ id: 'favicon', file: `/brand-assets/${concept}/favicon.svg` },
	{ id: 'appIcon', file: `/brand-assets/${concept}/app-icon-512.svg` },
	{ id: 'avatar', file: `/brand-assets/${concept}/avatar.svg` }
];

/** The three marks; names and roles live in the dictionary under `brand.logo.marks.<id>`. */
export const MARKS = [
	{ id: 'junction', logo: JUNCTION, assets: files('junction') },
	{ id: 'card', logo: CARD, assets: files('card') },
	{ id: 'page-slot', logo: PAGE_SLOT, assets: files('page-slot') }
] as const satisfies readonly { id: keyof Messages['brand']['logo']['marks']; logo: Logo; assets: Asset[] }[];

// The naming rules, the voice, the approved phrasings (see TRADEMARK.md) and the trademark notices are
// text: they live in the dictionary (`brand.name.rules`, `brand.trademark`, `footer.notices`).

/** Misuses, shown on the brand page. Each one is rendered as an example; labels: `brand.misuse.items`. */
export const MISUSE = [
	'stretch',
	'rotate',
	'outline',
	'yellow',
	'shadow',
	'touch'
] as const satisfies readonly (keyof Messages['brand']['misuse']['items'])[];
