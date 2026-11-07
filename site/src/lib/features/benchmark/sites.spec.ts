import { describe, expect, it } from 'vitest';
import bench from '#lib/content/bench.json';
import { parse, type ArmSummary, type Results, type TaskInfo } from './bench.ts';
import { bySite, siteKey } from './sites.ts';

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
	it('groups tasks by site, live sites first, with names and prompts', () => {
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
		expect(sites.map((s) => [s.id, s.name, s.live, s.tasks.length])).toEqual([
			['developers.notion.com', 'Notion', true, 1],
			['docs', 'Orbit docs', false, 2]
		]);
		expect(sites[0].tasks[0].prompt).toBe('qb');
		expect(sites[0].logo?.wordmark).toBe(false);
		// No averaging: each question keeps its own numbers.
		expect(sites[1].tasks.map((t) => t.baseline?.tokens)).toEqual([10, 30]);
	});

	it('fails loudly when the run has no metadata for a task', () => {
		expect(() => bySite(results({ x: { baseline: arm(1, 1) } }))).toThrow(/no task metadata/);
	});

	it('covers every task of the published run', () => {
		const sites = bySite(parse(bench));
		expect(sites.reduce((n, s) => n + s.tasks.length, 0)).toBe(
			Object.keys(parse(bench).summary.tasks).length
		);
		expect(sites.find((s) => s.id === 'developers.notion.com')?.name).toBe('Notion');
	});
});
