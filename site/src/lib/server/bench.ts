// Build time only: every published run (`just bench` writes `content/bench/<model>.json`), trimmed to what
// the page shows: the summary grouped by site, and per question the site's tools and the calls the agent
// made (the full traces stay out of the page). Every published model is kept, even one with no question in
// the showcase: the selection is of questions, never of models.
import snapshot from '#lib/content/tools.json';
import { leaderboard, parse, type ModelRun } from '#lib/features/benchmark/bench.ts';
import { bySite, showcase } from '#lib/features/benchmark/sites.ts';
import { toolsFor } from '#lib/features/benchmark/tools.ts';

const FILES = import.meta.glob<unknown>('../content/bench/*.json', { eager: true, import: 'default' });

/** One model's full published results (the Markdown pages list every question, not only the showcase). */
export function fullResults(model: string) {
	for (const data of Object.values(FILES)) {
		const full = parse(data);
		if (full.model === model) return { ...full, runs: [] };
	}
	throw new Error(`no published run for ${model}`);
}

/** Every published run, in leaderboard order (best first), trimmed for the page's hydration data. */
export function loadRuns(): ModelRun[] {
	return leaderboard(
		Object.values(FILES).map((data) => {
			const full = parse(data);
			// The landing shows selected cases (see showcase()); the page links to the full results.
			const sites = showcase(bySite({ ...full, runs: [] }));
			const shown = new Set(sites.flatMap((site) => site.tasks.map((t) => t.task)));
			const tools = toolsFor(full, snapshot);
			return {
				// Only what the browser reads (model, effort, the summary): the page's hydration data is
				// inlined in its HTML, and the rest (task metadata, history, config) would only weigh it down.
				results: {
					model: full.model,
					reasoning_effort: full.reasoning_effort,
					summary: full.summary
				} as typeof full,
				sites,
				// The tools of the questions on the page only.
				tools: Object.fromEntries(Object.entries(tools).filter(([task]) => shown.has(task))),
				totalQuestions: Object.keys(full.summary.tasks).length
			};
		})
	).map((run, i) => ({ ...run, rank: i + 1 }));
}
