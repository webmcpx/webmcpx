// The semantic color roles defined in `tokens.css`, for the /design page and its test.
// Each one is a CSS variable (`--surface`) and a Tailwind color (`bg-surface`, `text-surface`, ...).

export interface ColorToken {
	name: string;
	use: string;
}

export const COLORS: ColorToken[] = [
	{ name: 'bg', use: 'Page background' },
	{ name: 'surface', use: 'Cards, code blocks, inputs' },
	{ name: 'surface-2', use: 'Hover and selected surfaces' },
	{ name: 'fg', use: 'Body text and headings' },
	{ name: 'muted', use: 'Secondary text' },
	{ name: 'subtle', use: 'Captions, labels, axis text' },
	{ name: 'border', use: 'Dividers and card borders' },
	{ name: 'border-strong', use: 'Input borders, hovered cards' },
	{ name: 'accent', use: 'Primary buttons, the webmcpx series in charts' },
	{ name: 'on-accent', use: 'Text on accent fills' },
	{ name: 'accent-ink', use: 'Accent-colored text and links' },
	{ name: 'accent-soft', use: 'Tinted backgrounds, glow' },
	{ name: 'baseline', use: 'The baseline series in charts' },
	{ name: 'danger', use: 'Errors' },
	{ name: 'warn', use: 'Warnings' },
	{ name: 'code', use: 'Code block background' }
];
