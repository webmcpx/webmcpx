// OKLCH tokens to sRGB hex and WCAG contrast. Used by the token test and the brand page, so the page shows
// numbers computed from tokens.css, never typed by hand.

export type Oklch = [l: number, c: number, h: number];

/** The `--name: oklch(L C H)` declarations of the first block whose selector contains `selector`. */
export function tokensOf(css: string, selector = ':root'): Record<string, Oklch> {
	const start = css.indexOf(selector);
	const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
	const vars: Record<string, Oklch> = {};
	for (const m of block.matchAll(/--([\w-]+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)/g)) {
		vars[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
	}
	return vars;
}

/** Linear sRGB channels (clamped to the gamut) via OKLab. */
function linear([l, c, h]: Oklch): [number, number, number] {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const clamp = (x: number) => Math.min(1, Math.max(0, x));
	return [
		clamp(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
		clamp(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
		clamp(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S)
	];
}

export function luminance(c: Oklch): number {
	const [r, g, b] = linear(c);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(x: Oklch, y: Oklch): number {
	const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
	return (hi + 0.05) / (lo + 0.05);
}

export function hex(c: Oklch): string {
	const gamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
	return (
		'#' +
		linear(c)
			.map((x) =>
				Math.round(gamma(x) * 255)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}
