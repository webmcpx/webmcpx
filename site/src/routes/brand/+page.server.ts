// Build time only: the brand page shows the real tokens (from tokens.css) with hex values and contrast
// computed here, and one highlighted sample. Nothing about colors is typed by hand.
import css from '#lib/styles/tokens.css?raw';
import { contrast, hex, tokensOf } from '#lib/styles/color.ts';
import { COLORS, PAIRS } from '#lib/styles/tokens.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlight } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const vars = tokensOf(css);
	const value = (name: string) => {
		const v = vars[name];
		if (!v) throw new Error(`tokens.css has no --${name}`);
		return v;
	};
	return {
		sample: await highlight(SNIPPETS.scriptTag),
		colors: COLORS.map((c) => {
			const v = value(c.name);
			return { ...c, hex: hex(v), oklch: `oklch(${v.join(' ')})` };
		}),
		pairs: PAIRS.map(([text, bg]) => ({ text, bg, ratio: contrast(value(text), value(bg)) })),
		/** The one pair the manual forbids: highlighter yellow as a figure on paper. */
		yellowOnPaper: contrast(value('marker'), value('paper'))
	};
};
