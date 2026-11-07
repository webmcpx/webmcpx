// Pure string helpers for messages (no Svelte): placeholders, plurals, and rich-text parts.

/** Fills `{name}` placeholders: `fmt('Try again in {s} s.', { s: 52 })`. Unknown names stay as written. */
export function fmt(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (all, key: string) => (key in vars ? String(vars[key]) : all));
}

/**
 * The forms of a count-dependent message, by CLDR plural category. `other` is required; a language fills
 * the categories it has (English: one, other; Russian: one, few, many, other; Japanese: other only).
 */
export interface Plural {
	zero?: string;
	one?: string;
	two?: string;
	few?: string;
	many?: string;
	other: string;
}

/** The form of `forms` for `n` in `locale` (an `Intl` tag), falling back to `other`. */
export function plural(n: number, forms: Plural, locale = 'en-US'): string {
	const category = new Intl.PluralRules(locale).select(n) as keyof Plural;
	return forms[category] ?? forms.other;
}

/**
 * A template split at its placeholders: even indexes are text, odd ones placeholder names.
 * `parts('Make your site {mark}.')` → `['Make your site ', 'mark', '.']`.
 */
export const parts = (template: string): string[] => template.split(/\{(\w+)\}/);
