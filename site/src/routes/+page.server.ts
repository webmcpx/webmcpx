// Runs at build time only (the site is prerendered): highlight every code sample once, and keep from each
// model's results only what the page shows: the summary grouped by site, and per question the site's tools
// and the calls the agent made (the full traces stay out of the page).
import snapshot from '#lib/content/tools.json';
import { MODELS } from '#lib/content/models.ts';
import { parse } from '#lib/features/benchmark/bench.ts';
import { bestGain, bySite, showcase } from '#lib/features/benchmark/sites.ts';
import { toolsFor } from '#lib/features/benchmark/tools.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

/** One results file per model (`just bench` writes `content/bench/<model>.json`). */
const FILES = import.meta.glob<unknown>('../lib/content/bench/*.json', { eager: true, import: 'default' });

/** Known models in switcher order, then any other published run by id. */
const rank = (id: string) => {
	const i = MODELS.findIndex((m) => m.id === id);
	return i < 0 ? MODELS.length : i;
};

export const load: PageServerLoad = async () => {
	const runs = Object.values(FILES)
		.map((data) => {
			const full = parse(data);
			const results = { ...full, runs: [] };
			const sites = showcase(bySite(results));
			return {
				results,
				// The landing shows selected cases (see showcase()); the page links to the full results.
				sites,
				tools: toolsFor(full, snapshot),
				totalQuestions: Object.keys(results.summary.tasks).length
			};
		})
		.filter((r) => r.sites.length > 0)
		.sort(
			(a, b) =>
				rank(a.results.model) - rank(b.results.model) || a.results.model.localeCompare(b.results.model)
		);
	const first = runs[0]?.sites[0];
	return {
		code: await highlightAll(SNIPPETS),
		runs,
		// For "Why WebMCP?": the biggest saving in the first model's run and where (sites come best first).
		best: first ? { saving: bestGain(first), site: first.name, model: runs[0].results.model } : null
	};
};
