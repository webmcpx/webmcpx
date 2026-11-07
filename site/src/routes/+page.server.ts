// Runs at build time only (the site is prerendered): highlight every code sample once.
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlightAll } from '#lib/server/highlight.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ code: await highlightAll(SNIPPETS) });
