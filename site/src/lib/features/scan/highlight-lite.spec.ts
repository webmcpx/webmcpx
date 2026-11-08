import { describe, expect, it } from 'vitest';
import { highlightLite } from './highlight-lite.ts';

describe('highlightLite', () => {
	it('colors HTML tags, attributes and values, escaping the code', () => {
		const h = highlightLite('<a href="x?a=1&b=2">hi</a>', 'html');
		expect(h.html).toContain('<span style="color:#7EE787">a</span>');
		expect(h.html).toContain('<span style="color:#79C0FF">href</span>');
		expect(h.html).toContain(
			'<span style="color:#A5D6FF">&quot;x?a=1&amp;b=2&quot;</span>'.replace(/&quot;/g, '"')
		);
		expect(h.html).not.toContain('<a ');
	});
	it('colors Markdown link texts and URLs', () => {
		const h = highlightLite('[![ok](https://b.svg)](https://webmcpx.dev)', 'md');
		expect(h.html).toContain('<span style="color:#79C0FF">https://webmcpx.dev</span>');
		expect(h.html).toContain('<span style="color:#A5D6FF">ok</span>');
	});
	it('colors shell commands and comments, one line each', () => {
		const h = highlightLite('cargo install webmcpx # needs Rust\nwebmcpx lint src/', 'sh');
		expect(h.html).toContain('<span style="color:#FFA657">cargo</span>');
		expect(h.html).toContain('<span style="color:#8B949E"># needs Rust</span>');
		expect(h.html.match(/class="line"/g)).toHaveLength(2);
	});
});
