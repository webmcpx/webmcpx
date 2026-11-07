// The current language's messages, for components: `const i18n = useI18n()`, then `i18n.m.hero.lead`,
// `i18n.href('/brand/')`, `i18n.number(8500)`. The root layout provides it from its load data, so a
// language switch (a navigation) updates every component.

import { getContext, setContext } from 'svelte';
import type { Messages } from './dict/en.ts';
import { fmt, plural, type Plural } from './format.ts';
import { localized, locale as localeOf, type LocaleCode } from './locales.ts';

export type { Messages, Plural };
export { fmt, plural };

export interface I18n {
	readonly code: LocaleCode;
	readonly m: Messages;
	/** The path of an English page (`/`, `/brand/`) in the current language. */
	href(path: string): string;
	/** A number formatted for the current language (8,500 / 8.500 / 8 500). */
	number(n: number): string;
	/** The form of `forms` for `n`, filled: `{n}` is the formatted number, plus any `vars`. */
	plural(n: number, forms: Plural, vars?: Record<string, string | number>): string;
}

const KEY = Symbol('i18n');

export function provideI18n(get: () => { code: LocaleCode; m: Messages }): I18n {
	const i18n: I18n = {
		get code() {
			return get().code;
		},
		get m() {
			return get().m;
		},
		href: (path) => localized(path, get().code),
		number: (n) => n.toLocaleString(localeOf(get().code).intl),
		plural: (n, forms, vars = {}) =>
			fmt(plural(n, forms, localeOf(get().code).intl), { n: i18n.number(n), ...vars })
	};
	setContext(KEY, i18n);
	return i18n;
}

export function useI18n(): I18n {
	const i18n = getContext<I18n | undefined>(KEY);
	if (!i18n) throw new Error('useI18n() outside the root layout');
	return i18n;
}
