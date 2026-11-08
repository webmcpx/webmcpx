// Build time only: every published run (`just bench` writes `content/bench/<model>.json`), trimmed to what
// the page shows: the summary grouped by site, and per question the site's tools and the calls the agent
// made (the full traces stay out of the page). Every published model is kept, even one with no question in
// the showcase: the selection is of questions, never of models.
import snapshot from '#lib/content/tools.json';
import { leaderboard, parse, type ModelRun } from '#lib/features/benchmark/bench.ts';
import { bySite, showcase } from '#lib/features/benchmark/sites.ts';
import { toolsFor } from '#lib/features/benchmark/tools.ts';

const FILES = import.meta.glob<unknown>('../content/bench/*.json', { eager: true, import: 'default' });

/** Every published run, in leaderboard order (best first). */
export function loadRuns(): ModelRun[] {
	return leaderboard(
		Object.values(FILES).map((data) => {
			const full = parse(data);
			const results = { ...full, runs: [] };
			return {
				results,
				// The landing shows selected cases (see showcase()); the page links to the full results.
				sites: showcase(bySite(results)),
				tools: toolsFor(full, snapshot),
				totalQuestions: Object.keys(results.summary.tasks).length
			};
		})
	);
}
