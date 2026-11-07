// Runs at build time only (the site is prerendered): highlight every code sample once, and keep from
// bench.json only what the page shows: the summary grouped by site, and per question the site's tools and
// the calls the agent made (the full traces stay out of the page).
import data from '#lib/content/bench.json';
import snapshot from '#lib/content/tools.json';
import { parse } from '#lib/features/benchmark/bench.ts';
import { bySite } from '#lib/features/benchmark/sites.ts';
import { toolsFor } from '#lib/features/benchmark/tools.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const full = parse(data);
	const results = { ...full, runs: [] };
	return {
		tools: toolsFor(full, snapshot),
		code: await highlightAll(SNIPPETS),
		results,
		sites: bySite(results)
	};
};
