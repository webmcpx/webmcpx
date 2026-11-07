// Public sites that register WebMCP tools today. Each one was checked with the scan API
// (`/api/scan`, or `webmcpx-bench probe`) on the date below; re-check before adding or keeping one.
// Logos belong to their owners and only state a fact: the site ships WebMCP. No affiliation.

import { siMintlify, siPerplexity, siResend } from 'simple-icons';
import { ALLBIRDS, CLOUDFLARE, KITH, NOTION, fromSimpleIcon, type Logo } from './logos.ts';

export interface Site {
	name: string;
	/** What the scan opens when the logo is clicked. */
	url: string;
	logo: Logo;
}

export const VERIFIED_ON = '2026-11-07';

/** Sites with WebMCP in the Known Good index (the dataset behind webmcp#319) on its last update. */
export const INDEX = { sites: 541, asOf: '2026-11-04', url: 'https://knowngood.sh' };

export const SITES: Site[] = [
	{ name: 'Cloudflare', url: 'https://developers.cloudflare.com/', logo: CLOUDFLARE },
	{ name: 'Notion', url: 'https://developers.notion.com/', logo: NOTION },
	{ name: 'Perplexity', url: 'https://docs.perplexity.ai/', logo: fromSimpleIcon(siPerplexity) },
	{ name: 'Mintlify', url: 'https://mintlify.com/docs', logo: fromSimpleIcon(siMintlify) },
	{ name: 'Resend', url: 'https://resend.com/docs', logo: fromSimpleIcon(siResend) },
	{ name: 'Allbirds', url: 'https://www.allbirds.com/', logo: ALLBIRDS },
	{ name: 'Kith', url: 'https://kith.com/', logo: KITH }
];
