// Groups benchmark tasks by the site they ran on, so each site gets its own numbers. Task metadata
// (site or URL, prompt) is read from the run itself (`results.tasks`), never from today's task files.

import { BENCH_SITES } from '#lib/content/benchSites.ts';
import type { Logo } from '#lib/content/logos.ts';
import { rows, type Results, type Row, type TaskInfo } from './bench.ts';

export interface SiteTask extends Row {
	prompt: string;
}

export interface BenchSite {
	id: string;
	name: string;
	logo?: Logo;
	live: boolean;
	url?: string;
	/** Each question keeps its own numbers: sites are never averaged. */
	tasks: SiteTask[];
}

/** `allbirds.com` for `https://www.allbirds.com/x`, the fixture dir for local sites. */
export function siteKey(info: TaskInfo): string {
	if (info.url) return new URL(info.url).hostname.replace(/^www\./, '');
	return info.site ?? 'unknown';
}

/** How many times fewer tokens webmcpx used on this question (0 when an arm is missing). */
export function gain(t: Row): number {
	return t.baseline && t.webmcp ? t.baseline.tokens / Math.max(1, t.webmcp.tokens) : 0;
}

/** A site's best case: its largest saving over any of its questions. */
export const bestGain = (s: BenchSite) => Math.max(0, ...s.tasks.map(gain));

/**
 * One entry per site, best cases first: sites by their largest token saving, and each site's questions
 * the same way. Throws when a task has no metadata in the run (a results file the harness did not write).
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
				name: BENCH_SITES[id]?.name ?? id,
				logo: BENCH_SITES[id]?.logo,
				live: !!meta.url,
				url: meta.url ? new URL(meta.url).origin : undefined,
				tasks: []
			};
			groups.set(id, site);
		}
		site.tasks.push({ ...row, prompt: meta.prompt });
	}
	const sites = [...groups.values()].map((s) => ({
		...s,
		tasks: [...s.tasks].sort((a, b) => gain(b) - gain(a))
	}));
	return sites.sort((a, b) => bestGain(b) - bestGain(a));
}

/** A question the page showcases: webmcpx used at most 1/`min` of the tokens and solved at least as often. */
export const SHOWCASE_MIN_SAVING = 2;

export function impressive(t: SiteTask, min = SHOWCASE_MIN_SAVING): boolean {
	return !!t.baseline && !!t.webmcp && gain(t) >= min && t.webmcp.success_rate >= t.baseline.success_rate;
}

/**
 * The landing's selection: only impressive questions, and only sites that have one, still best case first.
 * The page says it is a selection and links to the full results; nothing here changes the published file.
 */
export function showcase(sites: BenchSite[], min = SHOWCASE_MIN_SAVING): BenchSite[] {
	return sites
		.map((s) => ({ ...s, tasks: s.tasks.filter((t) => impressive(t, min)) }))
		.filter((s) => s.tasks.length > 0);
}
