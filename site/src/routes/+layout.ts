// The landing is fully static: prerendered at build time, hydrated in the browser.
import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/locales.ts';
import { loadMessages } from '#lib/i18n/load.ts';
import type { LayoutLoad } from './$types';

export const prerender = true;
// Every page is written as <route>/index.html, which any static server (including `just serve`) serves.
export const trailingSlash = 'always';

/** The page's language comes from its path: `/` is English, `/ja/...` Japanese. */
export const load: LayoutLoad = async ({ params }) => {
	const code = 'lang' in params && isLocale(params.lang) ? params.lang : DEFAULT_LOCALE;
	return { code, m: await loadMessages(code) };
};
