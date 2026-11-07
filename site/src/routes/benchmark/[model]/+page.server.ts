// One prerendered page per model: the benchmark for readers without JavaScript, where the landing's model
// switcher cannot switch (the landing links here).
import { error } from '@sveltejs/kit';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { loadRuns } from '#lib/server/bench.ts';
import { highlight } from '#lib/server/highlight.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => loadRuns().map((r) => ({ model: r.results.model }));

export const load: PageServerLoad = async ({ params }) => {
	const runs = loadRuns();
	const run = runs.find((r) => r.results.model === params.model);
	if (!run) error(404, `No published run for ${params.model}`);
	return { run, models: runs.map((r) => r.results.model), reproduce: await highlight(SNIPPETS.reproduce) };
};
