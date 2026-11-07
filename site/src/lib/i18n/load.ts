// Loads one language's messages. Each dictionary is its own chunk, so a page only downloads its language.
import type { Messages } from './dict/en.ts';
import type { LocaleCode } from './locales.ts';

const DICTIONARIES = import.meta.glob<Messages>('./dict/*.ts', { import: 'default' });

export async function loadMessages(code: LocaleCode): Promise<Messages> {
	const load = DICTIONARIES[`./dict/${code}.ts`];
	if (!load) throw new Error(`no dictionary for ${code}`);
	return load();
}
