// Runs at build time only (the site is prerendered): highlight every code sample once, and keep from
// bench.json only what the page shows: the summary grouped by site, and per question the site's tools and
// the calls the agent made (the full traces stay out of the page).
import data from '#lib/content/bench.json';
import snapshot from '#lib/content/tools.json';
import { parse } from '#lib/features/benchmark/bench.ts';
import { bestGain, bySite, showcase } from '#lib/features/benchmark/sites.ts';
import { toolsFor } from '#lib/features/benchmark/tools.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const full = parse(data);
	const results = { ...full, runs: [] };
	const sites = showcase(bySite(results));
	return {
		tools: toolsFor(full, snapshot),
		code: await highlightAll(SNIPPETS),
		results,
		// The landing shows selected cases (see showcase()); the page links to the full results.
		sites,
		// For "Why WebMCP?": the biggest saving in the run and where it was measured (sites come best first).
		best: sites[0] ? { saving: bestGain(sites[0]), site: sites[0].name } : null,
		totalQuestions: Object.keys(results.summary.tasks).length
	};
};
