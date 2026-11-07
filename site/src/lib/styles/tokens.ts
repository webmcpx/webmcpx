// The color roles defined in `tokens.css`, for the /brand page and its test.
// Each one is a CSS variable (`--ink-2`) and a Tailwind color (`text-ink-2`, `bg-ink-2`, ...).

export interface ColorToken {
	name: string;
	use: string;
}

export const COLORS: ColorToken[] = [
	{ name: 'paper', use: 'Page background' },
	{ name: 'paper-2', use: 'Sunken panels, tracks' },
	{ name: 'card', use: 'Cards and inputs on paper' },
	{ name: 'ink', use: 'Text, outlines, shadows, primary buttons' },
	{ name: 'ink-2', use: 'Secondary text' },
	{ name: 'ink-3', use: 'Captions and labels' },
	{ name: 'hairline', use: 'Thin dividers' },
	{ name: 'marker', use: 'Highlighter: the one accent' },
	{ name: 'good', use: 'Ready, passed (text)' },
	{ name: 'good-soft', use: 'Ready, passed (fill)' },
	{ name: 'bad', use: 'Missing, failed (text)' },
	{ name: 'bad-soft', use: 'Missing, failed (fill)' },
	{ name: 'code', use: 'Code block background' },
	{ name: 'on-code', use: 'Text on code blocks' }
];

/** [text, background] pairs the components actually use. */
export const PAIRS: [string, string][] = [
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
