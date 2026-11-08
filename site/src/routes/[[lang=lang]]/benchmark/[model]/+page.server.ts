// One prerendered page per model: the benchmark for readers without JavaScript, where the landing's model
// switcher cannot switch (the landing links here).
import { existsSync } from 'node:fs';
import { error } from '@sveltejs/kit';
import { DEFAULT_LOCALE, LOCALE_CODES } from '#lib/i18n/locales.ts';
import { reproduceFor } from '#lib/content/snippets.ts';
import { loadRuns } from '#lib/server/bench.ts';
import { highlight } from '#lib/server/highlight.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

/** Every model in every language (English at the root). */
export const entries: EntryGenerator = () =>
	LOCALE_CODES.flatMap((code) =>
		loadRuns().map((r) => ({ lang: code === DEFAULT_LOCALE ? undefined : code, model: r.results.model }))
	);

export const load: PageServerLoad = async ({ params }) => {
	const runs = loadRuns();
	const run = runs.find((r) => r.results.model === params.model);
	if (!run) error(404, `No published run for ${params.model}`);
	// The run's preview image (its best case), made by `just bench`; the generic one until then.
	const og = `/og/benchmark-${params.model}.png`;
	return {
		run,
		models: runs.map((r) => r.results.model),
		reproduce: await highlight(reproduceFor(params.model)),
		og: existsSync(`static${og}`) ? og : undefined,
		// Its Markdown twin, for agents (`benchmark/[model]/index.md`).
		markdown: `/benchmark/${params.model}/index.md`
	};
};
