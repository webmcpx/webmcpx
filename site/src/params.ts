// Route parameter matchers. `/[[lang=lang]]/...`: a site language other than English (which lives at the
// root); anything else leaves the optional segment unmatched.
import { defineParams } from '@sveltejs/kit/params';
import { DEFAULT_LOCALE, isLocale } from '#lib/i18n/locales.ts';

export const params = defineParams({
	lang: (param: string) => (isLocale(param) && param !== DEFAULT_LOCALE ? param : undefined)
});
