// Public sites that register WebMCP tools today. Each one was checked with the scan API
// (`/api/scan`, or `webmcpx-bench probe`) on the date below; re-check before adding or keeping one.
// Logos belong to their owners and only state a fact: the site ships WebMCP. No affiliation.

import { siMintlify, siPerplexity, siResend } from 'simple-icons';
import { CLOUDFLARE, NOTION, fromSimpleIcon, type Logo } from './logos.ts';

export interface Site {
	name: string;
	/** What the scan opens when the logo is clicked. */
	url: string;
	logo: Logo;
}

export const VERIFIED_ON = '2026-11-07';

/**
 * How many sites register WebMCP tools. The headline uses the webmcp.com directory: hosts listed as live
 * (demos excluded; /api/directory.json had 8,556 of 8,612 on its generatedAt date), rounded down to the
 * hundred. Known Good is the stricter count: sites seen registering tools when the page actually ran
 * (it ran only 648 of the 57,273 it lists, so the real number is higher).
 */
export const DIRECTORY = { sites: 8500, asOf: '2026-11-05', url: 'https://webmcp.com' };
export const VERIFIED = { sites: 541, asOf: '2026-11-04', url: 'https://knowngood.sh' };

export const SITES: Site[] = [
	{ name: 'Cloudflare', url: 'https://developers.cloudflare.com/', logo: CLOUDFLARE },
	{ name: 'Notion', url: 'https://developers.notion.com/', logo: NOTION },
	{ name: 'Perplexity', url: 'https://docs.perplexity.ai/', logo: fromSimpleIcon(siPerplexity) },
	{ name: 'Mintlify', url: 'https://mintlify.com/docs', logo: fromSimpleIcon(siMintlify) },
	{ name: 'Resend', url: 'https://resend.com/docs', logo: fromSimpleIcon(siResend) }
];
