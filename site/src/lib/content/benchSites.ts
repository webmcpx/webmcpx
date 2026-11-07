// How the places benchmark tasks ran on are shown: name and logo. Keys are live hosts (without
// `www.`) and local fixture directories (`bench/sites/<dir>`). Unknown keys fall back to the key.

import { siCloudflare, siNotion, type SimpleIcon } from 'simple-icons';

export interface BenchSiteLook {
	name: string;
	/** Brand mark from simple-icons; without one, the name's initial is shown. */
	icon?: SimpleIcon;
}

export const BENCH_SITES: Record<string, BenchSiteLook> = {
	'developers.notion.com': { name: 'Notion', icon: siNotion },
	'developers.cloudflare.com': { name: 'Cloudflare', icon: siCloudflare },
	'allbirds.com': { name: 'Allbirds' },
	// simple-icons' WooCommerce mark is a wide wordmark, unreadable at icon size: initial instead.
	'demo.openforagents.com': { name: 'WooCommerce' },
	'specification.website': { name: 'specification.website' },
	docs: { name: 'Orbit docs' },
	store: { name: 'Kiln & Co' }
};
