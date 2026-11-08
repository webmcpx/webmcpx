// Code built in the browser (a scanned site's badge embed, the lint command) colored like the build-time
// Shiki blocks (github-dark-default), without shipping Shiki to the page: a small tokenizer per language.
import type { Highlighted } from '#lib/content/snippets.ts';

const C = {
	text: '#E6EDF3',
	tag: '#7EE787',
	attr: '#79C0FF',
	string: '#A5D6FF',
	comment: '#8B949E',
	command: '#FFA657'
};

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (color: string, s: string) => (s ? `<span style="color:${color}">${escape(s)}</span>` : '');

/** HTML: tag names, attribute names, quoted values; text between tags plain. */
function html(code: string): string {
	let out = '';
	let i = 0;
	while (i < code.length) {
		const open = code.indexOf('<', i);
		if (open < 0) return out + span(C.text, code.slice(i));
		out += span(C.text, code.slice(i, open));
		const close = code.indexOf('>', open);
		if (close < 0) return out + span(C.text, code.slice(open));
		const tag = code.slice(open, close + 1);
		const m = /^(<\/?)([\w:-]*)/.exec(tag)!;
		out += span(C.text, m[1]) + span(C.tag, m[2]);
		const rest = tag.slice(m[0].length);
		for (const t of rest.match(/"[^"]*"|'[^']*'|[\w:-]+|\s+|./g) ?? []) {
			if (t[0] === '"' || t[0] === "'") out += span(C.string, t);
			else if (/^[\w:-]+$/.test(t)) out += span(C.attr, t);
			else out += span(C.text, t);
		}
		i = close + 1;
	}
	return out;
}

/** Markdown: link and image texts as strings, URLs as links, brackets plain. */
function markdown(code: string): string {
	let out = '';
	let inText = false;
	for (const t of code.match(/!?\[|\]\([^)]*\)|[^[\]!]+|./g) ?? []) {
		if (t === '[' || t === '![') {
			out += span(C.text, t);
			inText = true;
		} else if (t.startsWith('](')) {
			out += span(C.text, '](') + span(C.attr, t.slice(2, -1)) + span(C.text, ')');
			inText = false;
		} else out += span(inText ? C.string : C.text, t);
	}
	return out;
}

/** Shell: the command word, the rest, and comments. */
function shell(code: string): string {
	return code
		.split('\n')
		.map((line) => {
			const hash = line.indexOf('#');
			const [cmd, comment] = hash < 0 ? [line, ''] : [line.slice(0, hash), line.slice(hash)];
			const m = /^(\s*)(\S+)(.*)$/.exec(cmd);
			const body = m ? span(C.text, m[1]) + span(C.command, m[2]) + span(C.text, m[3]) : span(C.text, cmd);
			return body + span(C.comment, comment);
		})
		.join('\n');
}

const BY_LANG = { html, md: markdown, sh: shell };

/** A code block for code made in the browser, styled like the prerendered ones. */
export function highlightLite(code: string, lang: keyof typeof BY_LANG): Highlighted {
	const body = BY_LANG[lang](code)
		.split('\n')
		.map((line) => `<span class="line">${line}</span>`)
		.join('\n');
	return {
		lang: lang === 'md' ? 'text' : lang,
		code,
		html: `<pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code>${body}</code></pre>`
	};
}
