// Public sites that register WebMCP tools today. Each one was checked with the scan API
// (`/api/scan`, or `webmcpx-bench probe`) on the date below; re-check before adding or keeping one.
// Logos belong to their owners and only state a fact: the site ships WebMCP. No affiliation.

import { siCloudflare, siMintlify, siNotion, siPerplexity, siResend, type SimpleIcon } from 'simple-icons';

export interface Site {
	name: string;
	/** What the scan opens when the logo is clicked. */
	url: string;
	/** Brand mark from simple-icons; sites without one show their name as a wordmark. */
	icon?: SimpleIcon;
}

export const VERIFIED_ON = '2026-11-07';

/** Sites with WebMCP in the Known Good index (the dataset behind webmcp#319) on its last update. */
export const INDEX = { sites: 541, asOf: '2026-11-04', url: 'https://knowngood.sh' };

export const SITES: Site[] = [
	{ name: 'Cloudflare', url: 'https://developers.cloudflare.com/', icon: siCloudflare },
	{ name: 'Notion', url: 'https://developers.notion.com/', icon: siNotion },
	{ name: 'Perplexity', url: 'https://docs.perplexity.ai/', icon: siPerplexity },
	{ name: 'Mintlify', url: 'https://mintlify.com/docs', icon: siMintlify },
	{ name: 'Resend', url: 'https://resend.com/docs', icon: siResend },
	{ name: 'Allbirds', url: 'https://www.allbirds.com/' },
	{ name: 'Kith', url: 'https://kith.com/' }
];
