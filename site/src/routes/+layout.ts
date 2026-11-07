// The landing is fully static: prerendered at build time, hydrated in the browser.
import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/locales.ts';
import { loadMessages } from '#lib/i18n/load.ts';
import type { LayoutLoad } from './$types';

export const prerender = true;
// Every page is written as <route>/index.html, which any static server (including `just serve`) serves.
export const trailingSlash = 'always';

/** The page's language comes from its path: `/` is English, `/ja/...` Japanese. */
export const load: LayoutLoad = async ({ params }) => {
	// Read `params.lang` even when absent: SvelteKit then reruns this load when it appears or changes.
	const lang = (params as { lang?: string }).lang;
	const code = isLocale(lang) ? lang : DEFAULT_LOCALE;
	return { code, m: await loadMessages(code) };
};
