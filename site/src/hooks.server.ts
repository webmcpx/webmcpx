// Prerendered pages carry their language in <html lang>, set from the route's `lang` parameter.
import type { Handle } from '@sveltejs/kit/hooks';
import { DEFAULT_LOCALE, isLocale, locale } from '#lib/i18n/locales.ts';

export const handle: Handle = ({ event, resolve }) => {
	const code = isLocale(event.params.lang) ? event.params.lang : DEFAULT_LOCALE;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale(code).tag)
	});
};
