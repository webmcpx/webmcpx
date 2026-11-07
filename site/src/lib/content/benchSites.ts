// Display names for the places benchmark tasks run: live hosts and local fixture sites
// (`bench/sites/<dir>`). Unknown hosts fall back to the host name.

export const BENCH_SITE_NAMES: Record<string, string> = {
	'developers.notion.com': 'Notion docs',
	'developers.cloudflare.com': 'Cloudflare docs',
	'allbirds.com': 'Allbirds store',
	'demo.openforagents.com': 'WooCommerce demo',
	'specification.website': 'specification.website',
	docs: 'Orbit docs',
	store: 'Kiln & Co store'
};
