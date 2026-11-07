// Runs at build time only (the site is prerendered): highlight every code sample once, and keep only
// the benchmark summary (bench.json also holds every run's trace, which the page never shows), grouped
// by the site each task ran on.
import data from '#lib/content/bench.json';
import tasks from '#lib/content/tasks.json';
import { parse } from '#lib/features/benchmark/bench.ts';
import { bySite } from '#lib/features/benchmark/sites.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const results = { ...parse(data), runs: [] };
	return {
		code: await highlightAll(SNIPPETS),
		results,
		sites: bySite(results, tasks)
	};
};
