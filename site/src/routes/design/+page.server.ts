import { highlight } from '#lib/server/highlight.ts';
import { SNIPPETS } from '#lib/content/snippets.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ sample: await highlight(SNIPPETS.npm) });
