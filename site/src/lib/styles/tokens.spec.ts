// Guards the design system: every documented token exists, and text colors pass WCAG 2.2 AA (4.5:1)
// against the surfaces they sit on. Edit a color in tokens.css and this tells you if
// it still reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast, hex, tokensOf } from './color.ts';
import { COLORS, PAIRS } from './tokens.ts';

// Read from disk: Vitest replaces imported CSS (even `?raw`) with an empty string.
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

describe('tokens', () => {
	const vars = tokensOf(css);

	it('defines every documented color', () => {
		for (const { name } of COLORS) expect(vars, name).toHaveProperty(name);
	});

	it.each(PAIRS)('%s on %s reaches 4.5:1', (text, bg) => {
		expect(contrast(vars[text], vars[bg])).toBeGreaterThanOrEqual(4.5);
	});
});

describe('color helpers', () => {
	it('convert to the expected hex', () => {
		expect(hex([1, 0, 0])).toBe('#ffffff');
		expect(hex([0, 0, 0])).toBe('#000000');
	});

	it('matches the WCAG reference points', () => {
		expect(contrast([1, 0, 0], [0, 0, 0])).toBeCloseTo(21, 0);
		expect(contrast([0.5, 0, 0], [0.5, 0, 0])).toBe(1);
	});
});

it('exposes every documented color as a Tailwind color', () => {
	for (const { name } of COLORS) expect(css).toContain(`--color-${name}: var(--${name});`);
});
