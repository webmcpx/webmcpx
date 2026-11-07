// Every code sample on the site. Highlighted at build time (`server/highlight.ts`), so the browser gets
// plain HTML and no highlighter.

export type Lang = 'html' | 'js' | 'sh' | 'json';

export interface CodeSample {
	lang: Lang;
	code: string;
}

export interface Highlighted extends CodeSample {
	html: string;
}

const SCRIPT_TAG =
	'<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.1/src/auto.js"></' + 'script>';

export const SNIPPETS = {
	scriptTag: { lang: 'html', code: SCRIPT_TAG },
	reproduce: {
		lang: 'sh',
		code: `git clone https://github.com/webmcpx/webmcpx
cd webmcpx && just setup
OPENAI_API_KEY=sk-... just bench`
	}
} satisfies Record<string, CodeSample>;

export type SnippetId = keyof typeof SNIPPETS;

/** Other ways in, shown as one-liners next to the script tag (who each is for: `fix.alternatives.<id>`). */
export const ALTERNATIVES = [
	{ id: 'npm', code: 'npm i webmcpx' },
	{ id: 'agent', code: 'npx skills add webmcpx/webmcpx' }
] as const;
