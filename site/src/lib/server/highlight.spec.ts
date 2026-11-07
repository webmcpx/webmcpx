import { describe, expect, it } from 'vitest';
import { SNIPPETS } from '#lib/content/snippets.ts';
import { highlight, highlightAll } from './highlight.ts';

describe('highlight', () => {
	it('emits both themes as CSS variables and escapes the code', async () => {
		const h = await highlight({ lang: 'html', code: '<b>"x"</b>' });
		expect(h.html).toContain('--shiki-dark');
		expect(h.html).toContain('--shiki-light');
		expect(h.html).not.toContain('<b>');
		expect(h.code).toBe('<b>"x"</b>');
	});

	it('highlights every snippet on the site', async () => {
		const all = await highlightAll(SNIPPETS);
		expect(Object.keys(all)).toEqual(Object.keys(SNIPPETS));
		for (const s of Object.values(all)) expect(s.html).toMatch(/^<pre class="shiki/);
	});
});
