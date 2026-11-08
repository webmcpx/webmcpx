// How the places benchmark tasks ran on are shown: name and logo (see logos.ts). Keys are live hosts
// (without `www.`) and local fixture directories (`bench/sites/<dir>`). Unknown keys show the key.

import { CLOUDFLARE, KILN, NOTION, ORBIT, SPECIFICATION_WEBSITE, WOOCOMMERCE, type Logo } from './logos.ts';

export interface BenchSiteLook {
	name: string;
	logo?: Logo;
}

export const BENCH_SITES: Record<string, BenchSiteLook> = {
	'developers.notion.com': { name: 'Notion', logo: NOTION },
	'developers.cloudflare.com': { name: 'Cloudflare', logo: CLOUDFLARE },
	'demo.openforagents.com': { name: 'WooCommerce', logo: WOOCOMMERCE },
	'specification.website': { name: 'specification.website', logo: SPECIFICATION_WEBSITE },
	docs: { name: 'Orbit docs', logo: ORBIT },
	store: { name: 'Kiln & Co', logo: KILN }
};
