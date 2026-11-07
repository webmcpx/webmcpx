// The languages the site is written in: the most spoken languages that read left to right (by total
// speakers, Ethnologue), plus Japanese for its developer audience. English lives at `/`, every other
// language under its own prefix (`/pt-br/`, `/ja/`, ...). Each one is a transcreation, not a literal
// translation: see AGENTS.md (i18n).

export interface Locale {
	/** URL prefix and dictionary key ('' for English, at the root). */
	code: LocaleCode;
	/** `<html lang>` and hreflang (BCP 47). */
	tag: string;
	/** The language's own name, shown in the switcher. */
	name: string;
	/** For `Intl` (numbers, lists). */
	intl: string;
}

export const LOCALE_CODES = ['en', 'zh', 'hi', 'es', 'fr', 'bn', 'pt-br', 'ru', 'id', 'de', 'ja'] as const;
export type LocaleCode = (typeof LOCALE_CODES)[number];
export const DEFAULT_LOCALE: LocaleCode = 'en';

export const LOCALES: Locale[] = [
	{ code: 'en', tag: 'en', name: 'English', intl: 'en-US' },
	{ code: 'zh', tag: 'zh-Hans', name: '简体中文', intl: 'zh-CN' },
	{ code: 'hi', tag: 'hi', name: 'हिन्दी', intl: 'hi-IN' },
	{ code: 'es', tag: 'es', name: 'Español', intl: 'es' },
	{ code: 'fr', tag: 'fr', name: 'Français', intl: 'fr-FR' },
	{ code: 'bn', tag: 'bn', name: 'বাংলা', intl: 'bn-BD' },
	{ code: 'pt-br', tag: 'pt-BR', name: 'Português (Brasil)', intl: 'pt-BR' },
	{ code: 'ru', tag: 'ru', name: 'Русский', intl: 'ru-RU' },
	{ code: 'id', tag: 'id', name: 'Bahasa Indonesia', intl: 'id-ID' },
	{ code: 'de', tag: 'de', name: 'Deutsch', intl: 'de-DE' },
	{ code: 'ja', tag: 'ja', name: '日本語', intl: 'ja-JP' }
];

export const isLocale = (s: string | undefined): s is LocaleCode =>
	!!s && (LOCALE_CODES as readonly string[]).includes(s);

export const locale = (code: LocaleCode): Locale => LOCALES.find((l) => l.code === code) ?? LOCALES[0];

/** The page path for `code`: `path` is the English path (`/`, `/brand/`). */
export function localized(path: string, code: LocaleCode): string {
	return code === DEFAULT_LOCALE ? path : `/${code}${path}`;
}

/** The English path of a localized one (`/pt-br/brand/` → `/brand/`). */
export function unlocalized(path: string): string {
	const [, first, ...rest] = path.split('/');
	return isLocale(first) && first !== DEFAULT_LOCALE ? `/${rest.join('/')}` : path;
}

/** The site language that best matches the browser's preferences, if it is not English. */
export function preferred(languages: readonly string[]): LocaleCode | undefined {
	for (const lang of languages) {
		const l = lang.toLowerCase();
		if (l.startsWith('en')) return undefined;
		if (l.startsWith('pt')) return 'pt-br';
		if (l.startsWith('zh'))
			return l.includes('hant') || l.endsWith('-tw') || l.endsWith('-hk') ? undefined : 'zh';
		const base = l.split('-')[0];
		if (isLocale(base) && base !== 'en') return base;
	}
	return undefined;
}
