// Guards the design system: every documented token exists, and text colors pass WCAG 2.2 AA (4.5:1)
// against the surfaces they sit on. Edit a color in tokens.css and this tells you if
// it still reads.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COLORS } from './tokens.ts';

// Read from disk: Vitest replaces imported CSS (even `?raw`) with an empty string.
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

/** The `--name: oklch(...)` declarations of the first block whose selector contains `selector`. */
function theme(selector: string): Record<string, [number, number, number]> {
	const start = css.indexOf(selector);
	const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
	const vars: Record<string, [number, number, number]> = {};
	for (const m of block.matchAll(/--([\w-]+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)/g)) {
		vars[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
	}
	return vars;
}

/** Relative luminance of an OKLCH color (via OKLab and linear sRGB, clamped to the gamut). */
function luminance([l, c, h]: [number, number, number]): number {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const clamp = (x: number) => Math.min(1, Math.max(0, x));
	const r = clamp(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S);
	const g = clamp(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S);
	const bl = clamp(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S);
	return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(x: [number, number, number], y: [number, number, number]): number {
	const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
	return (hi + 0.05) / (lo + 0.05);
}

/** [text, background] pairs the components actually use. */
const PAIRS: [string, string][] = [
	['ink', 'paper'],
	['ink', 'paper-2'],
	['ink', 'card'],
	['ink', 'marker'],
	['ink', 'good-soft'],
	['ink', 'bad-soft'],
	['paper', 'ink'],
	['ink-2', 'paper'],
	['ink-2', 'card'],
	['ink-3', 'paper'],
	['ink-3', 'paper-2'],
	['ink-3', 'card'],
	['good', 'paper'],
	['good', 'card'],
	['bad', 'paper'],
	['bad', 'card'],
	['on-code', 'code']
];

describe('tokens', () => {
	const vars = theme(':root');

	it('defines every documented color', () => {
		for (const { name } of COLORS) expect(vars, name).toHaveProperty(name);
	});

	it.each(PAIRS)('%s on %s reaches 4.5:1', (text, bg) => {
		expect(contrast(vars[text], vars[bg])).toBeGreaterThanOrEqual(4.5);
	});
});

describe('contrast()', () => {
	it('matches the WCAG reference points', () => {
		expect(contrast([1, 0, 0], [0, 0, 0])).toBeCloseTo(21, 0);
		expect(contrast([0.5, 0, 0], [0.5, 0, 0])).toBe(1);
	});
});

it('exposes every documented color as a Tailwind color', () => {
	for (const { name } of COLORS) expect(css).toContain(`--color-${name}: var(--${name});`);
});
