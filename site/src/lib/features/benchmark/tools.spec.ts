import { describe, expect, it } from 'vitest';
import bench from '#lib/content/bench.json';
import snapshot from '#lib/content/tools.json';
import { parse, type Results, type RunInfo } from './bench.ts';
import { siteTools, toolsFor } from './tools.ts';

const run = (over: Partial<RunInfo>): RunInfo => ({
	task: 't',
	arm: 'webmcp',
	success: true,
	tool_calls: [],
	...over
});

const results = (runs: RunInfo[]): Results => ({
	schema_version: 4,
	model: 'm',
	reasoning_effort: null,
	price_per_mtok: null,
	started_at: 1794000000,
	tasks: { t: { prompt: 'q', site: 'docs' } },
	runs,
	summary: { arms: {}, tasks: { t: {} } }
});

const SNAP = {
	captured_on: '2026-11-07',
	tasks: {
		t: [
			{ name: 'b', description: 'B' },
			{ name: 'a', description: 'A' },
			{ name: 'search', description: 'S' }
		]
	}
};

describe('toolsFor', () => {
	it('prefers the tools recorded in the run, and says so', () => {
		const r = toolsFor(results([run({ tools: [{ name: 'x', description: 'X' }] })]), SNAP);
		expect(r.t.source).toBe('run');
		expect(r.t.date).toBe('2026-11-06');
		expect(r.t.tools.map((t) => t.name)).toEqual(['x']);
	});

	it('falls back to the dated snapshot for older runs', () => {
		const r = toolsFor(results([run({})]), SNAP);
		expect(r.t.source).toBe('snapshot');
		expect(r.t.date).toBe('2026-11-07');
		expect(r.t.runDate).toBe('2026-11-06');
	});

	it('takes tools and calls from the same attempt, and keeps a called tool missing from the list', () => {
		const r = toolsFor(
			results([
				run({ success: false, tools: [{ name: 'old_search', description: 'Old' }] }),
				run({
					success: true,
					tools: [{ name: 'new_search', description: 'New' }],
					tool_calls: [{ name: 'new_search', arguments: '{}' }]
				})
			]),
			SNAP
		);
		expect(r.t.tools).toEqual([{ name: 'new_search', description: 'New', called: true }]);
		const drift = toolsFor(results([run({ tool_calls: [{ name: 'gone', arguments: '{}' }] })]), SNAP);
		expect(drift.t.tools[0]).toEqual({ name: 'gone', description: '', called: true });
	});

	it('puts called tools first and keeps the example calls of a successful attempt', () => {
		const r = toolsFor(
			results([
				run({ success: false, tool_calls: [{ name: 'b', arguments: '{}' }] }),
				run({ success: true, tool_calls: [{ name: 'search', arguments: '{"query":"x"}' }] })
			]),
			SNAP
		);
		expect(r.t.tools.map((t) => [t.name, t.called])).toEqual([
			['search', true],
			['a', false],
			['b', false]
		]);
		expect(r.t.calls).toEqual([{ name: 'search', arguments: '{"query":"x"}' }]);
	});

	it('covers every question of the published run', () => {
		const r = toolsFor(parse(bench), snapshot);
		for (const [task, q] of Object.entries(r)) expect(q.tools.length, task).toBeGreaterThan(0);
	});
});

describe('siteTools', () => {
	it("merges a site's questions: called if any question called it", () => {
		const q = (called: string) => ({
			source: 'snapshot' as const,
			date: 'd',
			runDate: 'r',
			tools: [
				{ name: 'a', description: 'A', called: called === 'a' },
				{ name: 'b', description: 'B', called: called === 'b' }
			],
			calls: [{ name: called, arguments: '{}' }]
		});
		const s = siteTools([q('b'), q('a')]);
		expect(s?.tools.map((t) => [t.name, t.called])).toEqual([
			['b', true],
			['a', true]
		]);
		expect(s?.calls).toHaveLength(2);
		expect(siteTools([])).toBeNull();
	});
});
