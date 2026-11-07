// Build-time syntax highlighting. Runs only in `+page.server.ts` during prerender, so shiki never reaches
// the browser. One dark theme: code always sits on the ink background.

import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import type { CodeSample, Highlighted } from '#lib/content/snippets.ts';

const LANGS = { html: 'html', js: 'javascript', sh: 'shellscript', json: 'json', text: 'text' } as const;

let highlighter: Promise<HighlighterCore> | undefined;

function load() {
	highlighter ??= createHighlighterCore({
		themes: [import('shiki/themes/github-dark-default.mjs')],
		langs: [
			import('shiki/langs/html.mjs'),
			import('shiki/langs/javascript.mjs'),
			import('shiki/langs/shellscript.mjs'),
			import('shiki/langs/json.mjs')
		],
		engine: createJavaScriptRegexEngine()
	});
	return highlighter;
}

export async function highlight(sample: CodeSample): Promise<Highlighted> {
	const h = await load();
	const html = h.codeToHtml(sample.code, {
		lang: LANGS[sample.lang],
		theme: 'github-dark-default'
	});
	return { ...sample, html };
}

/** Highlights every sample of a record, keeping its keys. */
export async function highlightAll<K extends string>(
	samples: Record<K, CodeSample>
): Promise<Record<K, Highlighted>> {
	const entries = await Promise.all(
		(Object.entries(samples) as [K, CodeSample][]).map(async ([id, s]) => [id, await highlight(s)] as const)
	);
	return Object.fromEntries(entries) as Record<K, Highlighted>;
}
