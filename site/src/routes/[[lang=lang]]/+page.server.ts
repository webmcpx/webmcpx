// Runs at build time only (the site is prerendered): highlight every code sample once and load the
// published benchmark runs (see lib/server/bench.ts).
import { OWN, SNIPPETS } from '#lib/content/snippets.ts';
import { bestGain } from '#lib/features/benchmark/sites.ts';
import { loadRuns } from '#lib/server/bench.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const runs = loadRuns();
	// For "Why WebMCP?": the biggest saving in the first model with a showcased case (sites come best first).
	const first = runs.find((r) => r.sites.length > 0);
	return {
		code: await highlightAll(SNIPPETS),
		own: await highlightAll(OWN),
		runs,
		best: first ? { saving: bestGain(first.sites[0]), site: first.sites[0].name } : null
	};
};
