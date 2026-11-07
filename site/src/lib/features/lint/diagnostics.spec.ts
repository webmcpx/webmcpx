import { describe, expect, it } from 'vitest';
import { LINT_OUTPUT } from '#lib/content/snippets.ts';
import { lines, toneOf } from './diagnostics.ts';

describe('toneOf', () => {
	it('classifies each kind of line', () => {
		expect(toneOf("tools.js:2:9: error[invalid-name] tool name contains ' '")).toBe('error');
		expect(toneOf('tools.js:2:9: warning[missing-annotations] x')).toBe('warning');
		expect(toneOf('  |   name: "Search Products",')).toBe('snippet');
		expect(toneOf('2 error(s), 2 warning(s) in 1 tool(s).')).toBe('summary');
		expect(toneOf('')).toBe('plain');
	});

	it('finds the two errors and two warnings in the published sample', () => {
		const tones = lines(LINT_OUTPUT).map((l) => l.tone);
		expect(tones.filter((t) => t === 'error')).toHaveLength(2);
		expect(tones.filter((t) => t === 'warning')).toHaveLength(2);
		expect(tones.at(-1)).toBe('summary');
	});
});
