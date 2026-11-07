import { describe, expect, it } from 'vitest';
import {
	compare,
	headline,
	losses,
	parse,
	perThousand,
	ratio,
	rows,
	tokens,
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
	schema_version: 2,
	model: 'gpt-6-luna',
	reasoning_effort: null,
	price_per_mtok: { input: 0.1, cached_input: 0.01, output: 0.5 },
	started_at: 0,
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
		expect(perThousand(0.000154)).toBe('$0.15');
		expect(perThousand(null)).toBe('n/a');
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
