// The color roles defined in `tokens.css`, for the /brand page and its test.
// Each one is a CSS variable (`--ink-2`) and a Tailwind color (`text-ink-2`, `bg-ink-2`, ...).

/** The color tokens, in the order the /brand page shows them; what each is for: `brand.color.uses`. */
export const COLORS = [
	{ name: 'paper' },
	{ name: 'paper-2' },
	{ name: 'card' },
	{ name: 'ink' },
	{ name: 'ink-2' },
	{ name: 'ink-3' },
	{ name: 'hairline' },
	{ name: 'marker' },
	{ name: 'good' },
	{ name: 'good-soft' },
	{ name: 'bad' },
	{ name: 'bad-soft' },
	{ name: 'code' },
	{ name: 'on-code' }
] as const;
export type ColorName = (typeof COLORS)[number]['name'];

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
