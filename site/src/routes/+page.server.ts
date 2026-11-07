// Runs at build time only (the site is prerendered): highlight every code sample once, and keep only
// the benchmark summary (bench.json also holds every run's trace, which the page never shows).
import data from '#lib/content/bench.json';
import { parse } from '#lib/features/benchmark/bench.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	code: await highlightAll(SNIPPETS),
	results: { ...parse(data), runs: [] }
});
