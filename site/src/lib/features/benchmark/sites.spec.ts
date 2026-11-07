import { describe, expect, it } from 'vitest';
import bench from '#lib/content/bench/gpt-6-luna.json';
import { parse, type ArmSummary, type Results, type TaskInfo } from './bench.ts';
import { bySite, gain, showcase, siteKey } from './sites.ts';

const arm = (tokens: number, success_rate: number, cost_usd: number | null = 0.001): ArmSummary => ({
	runs: 3,
	success_rate,
	tokens,
	input_tokens: tokens,
	output_tokens: 0,
	steps: 2,
	tool_calls: 1,
	duration_ms: 1000,
	cost_usd
});

const results = (t: Results['summary']['tasks'], tasks: Record<string, TaskInfo> = {}): Results => ({
	schema_version: 3,
	model: 'm',
	reasoning_effort: null,
	price_per_mtok: null,
	started_at: 0,
	tasks,
	runs: [],
	summary: { arms: {}, tasks: t }
});

describe('siteKey', () => {
	it('uses the host for live pages and the directory for fixtures', () => {
		expect(siteKey({ prompt: '', url: 'https://www.allbirds.com/x' })).toBe('allbirds.com');
		expect(siteKey({ prompt: '', site: 'docs' })).toBe('docs');
	});
});

describe('bySite', () => {
	it('groups tasks by site, best case first, with names and prompts', () => {
		const sites = bySite(
			results(
				{
					a: { baseline: arm(10, 1), webmcp: arm(5, 1) },
					b: { baseline: arm(20, 0), webmcp: arm(4, 1) },
					c: { baseline: arm(30, 1), webmcp: arm(3, 1) }
				},
				{
					a: { prompt: 'qa', site: 'docs' },
					b: { prompt: 'qb', url: 'https://developers.notion.com/x' },
					c: { prompt: 'qc', site: 'docs' }
				}
			)
		);
		// docs' best question saves 10x (30 -> 3), Notion's 5x (20 -> 4): docs comes first.
		expect(sites.map((s) => [s.id, s.name, s.live, s.tasks.length])).toEqual([
			['docs', 'Orbit docs', false, 2],
			['developers.notion.com', 'Notion', true, 1]
		]);
		// Questions are ordered the same way, and keep their own numbers: no averaging.
		expect(sites[0].tasks.map((t) => [t.prompt, t.baseline?.tokens])).toEqual([
			['qc', 30],
			['qa', 10]
		]);
		expect(sites[1].logo?.wordmark).toBe(false);
	});

	it('fails loudly when the run has no metadata for a task', () => {
		expect(() => bySite(results({ x: { baseline: arm(1, 1) } }))).toThrow(/no task metadata/);
	});

	it('covers every task of the published run', () => {
		const sites = bySite(parse(bench));
		expect(sites.reduce((n, s) => n + s.tasks.length, 0)).toBe(
			Object.keys(parse(bench).summary.tasks).length
		);
		const best = sites.map((s) => Math.max(...s.tasks.map(gain)));
		expect(best).toEqual([...best].sort((a, b) => b - a));
	});
});

describe('showcase', () => {
	it('keeps only questions with at least a 2x saving and no loss in solved rate', () => {
		const sites = bySite(
			results(
				{
					big: { baseline: arm(100, 1), webmcp: arm(10, 1) },
					small: { baseline: arm(100, 1), webmcp: arm(80, 1) },
					worse: { baseline: arm(100, 1), webmcp: arm(10, 0.5) },
					lost: { baseline: arm(10, 1), webmcp: arm(30, 1) }
				},
				{
					big: { prompt: 'a', site: 'docs' },
					small: { prompt: 'b', site: 'docs' },
					worse: { prompt: 'c', site: 'docs' },
					lost: { prompt: 'd', site: 'store' }
				}
			)
		);
		const shown = showcase(sites);
		expect(shown.map((s) => [s.id, s.tasks.map((t) => t.task)])).toEqual([['docs', ['big']]]);
	});

	it('every showcased question of the published run saves at least 2x', () => {
		for (const site of showcase(bySite(parse(bench))))
			for (const t of site.tasks) expect(gain(t), t.task).toBeGreaterThanOrEqual(2);
	});
});
