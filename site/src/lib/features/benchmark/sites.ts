// Groups benchmark tasks by the site they ran on, so each site gets its own numbers. Task metadata
// (site or URL, prompt) is read from the run itself (`results.tasks`), never from today's task files.

import { BENCH_SITE_NAMES } from '#lib/content/benchSites.ts';
import { rows, type ArmSummary, type Results, type Row, type TaskInfo } from './bench.ts';

export interface SiteTask extends Row {
	prompt: string;
}

export interface BenchSite {
	id: string;
	name: string;
	live: boolean;
	url?: string;
	tasks: SiteTask[];
	baseline: ArmSummary | null;
	webmcp: ArmSummary | null;
}

/** `allbirds.com` for `https://www.allbirds.com/x`, the fixture dir for local sites. */
export function siteKey(info: TaskInfo): string {
	if (info.url) return new URL(info.url).hostname.replace(/^www\./, '');
	return info.site ?? 'unknown';
}

/** Mean of each arm over tasks (every task has the same number of runs, so this is the run mean). */
export function aggregate(summaries: (ArmSummary | undefined)[]): ArmSummary | null {
	const s = summaries.filter((x): x is ArmSummary => !!x);
	if (!s.length) return null;
	const mean = (f: (a: ArmSummary) => number) => s.reduce((acc, a) => acc + f(a), 0) / s.length;
	return {
		runs: s.reduce((acc, a) => acc + a.runs, 0),
		success_rate: mean((a) => a.success_rate),
		tokens: mean((a) => a.tokens),
		input_tokens: mean((a) => a.input_tokens),
		output_tokens: mean((a) => a.output_tokens),
		steps: mean((a) => a.steps),
		tool_calls: mean((a) => a.tool_calls),
		duration_ms: mean((a) => a.duration_ms),
		cost_usd: s.some((a) => a.cost_usd == null) ? null : mean((a) => a.cost_usd as number)
	};
}

/**
 * One entry per site, live sites first (in task order), then fixtures. Throws when a task has no
 * metadata in the run (a results file the harness did not write).
 */
export function bySite(results: Results): BenchSite[] {
	const info: Record<string, TaskInfo> = results.tasks;
	const groups = new Map<string, BenchSite>();
	for (const row of rows(results)) {
		const meta = info[row.task];
		if (!meta) throw new Error(`bench.json: no task metadata for "${row.task}"`);
		const id = siteKey(meta);
		let site = groups.get(id);
		if (!site) {
			site = {
				id,
				name: BENCH_SITE_NAMES[id] ?? id,
				live: !!meta.url,
				url: meta.url ? new URL(meta.url).origin : undefined,
				tasks: [],
				baseline: null,
				webmcp: null
			};
			groups.set(id, site);
		}
		site.tasks.push({ ...row, prompt: meta.prompt });
	}
	const sites = [...groups.values()].map((s) => ({
		...s,
		baseline: aggregate(s.tasks.map((t) => t.baseline)),
		webmcp: aggregate(s.tasks.map((t) => t.webmcp))
	}));
	return [...sites.filter((s) => s.live), ...sites.filter((s) => !s.live)];
}
