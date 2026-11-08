import { describe, expect, it } from 'vitest';
import {
	leaderboard,
	compare,
	headline,
	losses,
	METRICS,
	parse,
	perRun,
	ratio,
	seconds,
	rows,
	tokens,
	savingIsRange,
	tokenSaving,
	type ArmSummary,
	type Results
} from './bench.ts';

const arm = (tokens: number, duration_ms: number, cost_usd: number | null): ArmSummary => ({
	runs: 3,
	success_rate: 1,
	tokens,
	input_tokens: tokens,
	output_tokens: 0,
	steps: 2,
	tool_calls: 1,
	duration_ms,
	cost_usd
});

const results = (arms: Results['summary']['arms']): Results => ({
	schema_version: 3,
	model: 'gpt-6-luna',
	reasoning_effort: null,
	price_per_mtok: { input: 0.1, cached_input: 0.01, output: 0.5 },
	started_at: 0,
	tasks: {},
	runs: [],
	summary: { arms, tasks: {} }
});

describe('headline', () => {
	it('pairs both arms', () => {
		const h = headline(results({ baseline: arm(12000, 8000, 0.002), webmcp: arm(1500, 2000, 0.0002) }));
		expect(h?.baseline.tokens).toBe(12000);
		expect(h?.webmcp.tokens).toBe(1500);
	});

	it('is null until both arms ran', () => {
		expect(headline(results({ webmcp: arm(1500, 2000, null) }))).toBeNull();
		expect(headline(results({}))).toBeNull();
	});
});

describe('formatting', () => {
	it('keeps numbers short', () => {
		expect(tokens(950)).toBe('950');
		expect(tokens(1540)).toBe('1.5k');
		expect(tokens(23400)).toBe('23k');
		expect(ratio(7.94)).toBe('7.9×');
		expect(ratio(12.4)).toBe('12×');
		expect(perRun(0.000154)).toBe('$0.00015');
		expect(perRun(0.05419)).toBe('$0.054');
		expect(perRun(0.0075712)).toBe('$0.0076');
		expect(perRun(null)).toBe('n/a');
	});

	it('uses the reader’s decimal separator and keeps the k, s and $ style', () => {
		expect(tokens(1540, 'pt-BR')).toBe('1,5k');
		expect(tokens(123_400, 'de-DE')).toBe('123k');
		expect(seconds(12_345)).toBe('12.3s');
		expect(seconds(12_345, 'fr-FR')).toBe('12,3s');
		expect(perRun(0.05419, 'es')).toBe('$0,054');
		expect(perRun(1.5, 'ru-RU')).toBe('$1,50');
		expect(METRICS.find((m) => m.id === 'steps')!.format(4.25, 'id-ID')).toBe('4,3');
		expect(tokens(1540, 'ja-JP')).toBe('1.5k');
	});
});

describe('parse', () => {
	it('rejects unknown schema versions', () => {
		expect(() => parse({ schema_version: 1 })).toThrow('unsupported schema_version 1');
		expect(() => parse(null)).toThrow();
		expect(parse(results({})).model).toBe('gpt-6-luna');
	});
});

describe('compare', () => {
	it('names the direction', () => {
		expect(compare(15, 1.5, 'fewer tokens', 'more tokens')).toEqual({ value: '10×', label: 'fewer tokens' });
		expect(compare(3.6, 4.9, 'faster', 'slower')).toEqual({ value: '1.4×', label: 'slower' });
	});
});

describe('rows and losses', () => {
	const r: Results = {
		...results({}),
		summary: {
			arms: {},
			tasks: {
				'live-docs': { baseline: arm(9000, 5000, 0.001), webmcp: arm(900, 2000, 0.0001) },
				tiny: { baseline: arm(800, 1000, 0.0001), webmcp: arm(1200, 900, 0.0002) },
				'baseline-only': { baseline: arm(1, 1, null) }
			}
		}
	};

	it('keeps task order and marks live tasks', () => {
		expect(rows(r).map((x) => [x.task, x.live])).toEqual([
			['live-docs', true],
			['tiny', false],
			['baseline-only', false]
		]);
	});

	it('lists the tasks where webmcpx did worse, per metric', () => {
		expect(losses(r, 'tokens')).toEqual(['tiny']);
		expect(losses(r, 'duration_ms')).toEqual([]);
		expect(losses(r, 'cost_usd')).toEqual(['tiny']);
	});
});

describe('leaderboard', () => {
	const run = (model: string, success_rate: number, cost_usd: number | null) =>
		({
			results: { model, summary: { arms: { webmcp: { success_rate, cost_usd } } } }
		}) as unknown as Parameters<typeof leaderboard>[0][number];
	it('ranks by success with WebMCP, then by lower cost, then by id', () => {
		const order = leaderboard([
			run('b', 1, 0.02),
			run('a', 1, 0.02),
			run('c', 0.9, 0.001),
			run('d', 1, 0.01),
			run('e', 1, null)
		]);
		expect(order.map((r) => r.results.model)).toEqual(['d', 'a', 'b', 'e', 'c']);
	});
});

describe('tokenSaving', () => {
	const run = (baseline: number, webmcp: number) => ({
		results: results({ baseline: arm(baseline, 1, null), webmcp: arm(webmcp, 1, null) })
	});

	it('spans the whole-run saving of every model with both arms', () => {
		const half = { results: results({ baseline: arm(100, 1, null) }) };
		expect(tokenSaving([run(300, 100), run(1000, 200), half])).toMatchObject({ low: 3, high: 5, models: 2 });
	});

	it('is null without a run, or when no model saved tokens', () => {
		expect(tokenSaving([])).toBeNull();
		expect(tokenSaving([run(100, 200)])).toBeNull();
	});

	it('keeps a model that used more tokens as the low end, and then says "up to"', () => {
		const s = tokenSaving([run(100, 200), run(400, 100)]);
		expect(s).toMatchObject({ low: 0.5, high: 4, models: 2 });
		expect(savingIsRange(s!)).toBe(false);
	});

	it('counts, per model, the questions where WebMCP used more tokens', () => {
		const q = (b: number, w: number) => ({ baseline: arm(b, 1, null), webmcp: arm(w, 1, null) });
		const withTasks = (tasks: Results['summary']['tasks']) => {
			const r = run(300, 100).results;
			return { results: { ...r, summary: { ...r.summary, tasks } } };
		};
		const s = tokenSaving([
			withTasks({ a: q(100, 10), b: q(10, 20), c: q(10, 30) }),
			withTasks({ a: q(100, 10), b: q(10, 5), c: { baseline: arm(1, 1, null) } })
		]);
		expect(s).toMatchObject({ worse: [0, 2], questions: 3 });
	});

	const none = { worse: [0, 0] as [number, number], questions: 0 };
	it('is a range only across models whose ends read differently', () => {
		expect(savingIsRange({ ...none, low: 2.4, high: 5.7, models: 6 })).toBe(true);
		expect(savingIsRange({ ...none, low: 5.7, high: 5.7, models: 1 })).toBe(false);
		expect(savingIsRange({ ...none, low: 12.2, high: 12.4, models: 2 })).toBe(false);
	});
});
