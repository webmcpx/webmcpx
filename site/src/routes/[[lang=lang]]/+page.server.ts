// Runs at build time only (the site is prerendered): highlight every code sample once per language and load
// the published benchmark runs (see lib/server/bench.ts).
import { existsSync } from 'node:fs';
import { modelLook } from '#lib/content/models.ts';
import { tokenSaving } from '#lib/features/benchmark/bench.ts';
import { bestGain } from '#lib/features/benchmark/sites.ts';
import { loadRuns } from '#lib/server/bench.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import { localizedSnippets, localizeRuns } from '#lib/server/localize.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// The questions and the copy-to-agent prompts in the page's language (see server/localize.ts).
	const runs = localizeRuns(loadRuns(), params.lang);
	const { snippets, own } = localizedSnippets(params.lang);
	// The best case on the whole leaderboard: the biggest saving on one question, over every model's
	// showcased sites (each solved at least as often with WebMCP). Shown as a best case, never an average.
	const peaks = runs.flatMap((r) =>
		r.sites.map((s) => ({
			saving: bestGain(s),
			site: s.name,
			model: modelLook(r.results.model).name,
			id: r.results.model
		}))
	);
	const best = peaks.reduce<(typeof peaks)[number] | null>(
		(a, b) => (a && a.saving >= b.saving ? a : b),
		null
	);
	return {
		code: await highlightAll(snippets),
		own: await highlightAll(own),
		runs,
		// For "For agents": each model's whole-run token saving, lowest to highest (null: nothing published).
		saving: tokenSaving(runs),
		best,
		// The preview: the best case's own card (made by `just bench`), the generic one until it exists.
		og: best && existsSync(`static/og/benchmark-${best.id}.png`) ? `/og/benchmark-${best.id}.png` : undefined
	};
};
