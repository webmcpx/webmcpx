// The color roles defined in `tokens.css`, for the /design page and its test.
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
