import { describe, expect, it } from 'vitest';
import en from '#lib/i18n/dict/en.ts';
import {
	BADGES,
	badgeEmbed,
	errors,
	errorText,
	host,
	normalize,
	scan,
	shareLink,
	type Outcome,
	type Report
} from './scan.ts';

const report: Report = {
	url: 'https://a.example/',
	final_url: 'https://a.example/',
	title: 'A',
	verdict: 'issues',
	tools: [],
	diagnostics: [
		{ rule: 'invalid-name', severity: 'error', message: 'x' },
		{ rule: 'missing-annotations', severity: 'warning', message: 'y' }
	],
	page_tokens: 100,
	favicon: null,
	elapsed_ms: 1
};

const respond = (status: number, body: unknown, headers: Record<string, string> = {}) =>
	(async () => new Response(JSON.stringify(body), { status, headers })) as unknown as typeof fetch;

/** What the page shows for a failed outcome, in English. */
const text = (out: Outcome) =>
	out.ok ? '' : errorText(out.failure.status, out.failure.detail, out.failure.retryAfter, en.scan.errors);
const TITLE = en.scan.result.badgeTitle;

describe('normalize', () => {
	it('accepts bare hosts and full URLs', () => {
		expect(normalize(' notion.com ')).toBe('https://notion.com/');
		expect(normalize('http://a.example/docs?x=1')).toBe('http://a.example/docs?x=1');
	});

	it('rejects what is not a site', () => {
		for (const bad of ['', 'hello world', 'notadomain', 'javascript:alert(1)', 'ftp://a.example'])
			expect(normalize(bad), bad).toBeNull();
	});
});

describe('scan', () => {
	it('returns the report', async () => {
		const out = await scan('https://a.example/', respond(200, report));
		expect(out).toEqual({ ok: true, report });
	});

	it("passes the server message through, after a lead in the reader's language", async () => {
		const out = await scan('http://10.0.0.1/', respond(400, { error: '10.0.0.1 is not a public address' }));
		expect(out).toEqual({
			ok: false,
			failure: { status: 400, detail: '10.0.0.1 is not a public address', retryAfter: null }
		});
		expect(text(out)).toBe("That address can't be scanned. (10.0.0.1 is not a public address)");
		const unreadable = await scan('https://a.example/', respond(422, { error: 'not HTML' }));
		expect(text(unreadable)).toBe("The page couldn't be read. (not HTML)");
	});

	it('says when to retry after a rate limit', async () => {
		const out = await scan(
			'https://a.example/',
			respond(429, { error: 'slow down' }, { 'Retry-After': '52' })
		);
		expect(text(out)).toBe('One scan per minute, please. Try again in 52 s.');
		const later = await scan('https://a.example/', respond(429, { error: 'slow down' }));
		expect(text(later)).toBe(en.scan.errors.busyLater);
	});

	it('explains a timeout and other failures', async () => {
		expect(text(await scan('https://a.example/', respond(504, { error: 'timed out' })))).toBe(
			en.scan.errors.timeout
		);
		expect(text(await scan('https://a.example/', respond(500, {})))).toBe('Scan failed (500).');
	});

	it('explains a missing scanner', async () => {
		const out = await scan('https://a.example/', respond(404, {}));
		expect(out.ok).toBe(false);
		expect(text(out)).toContain('just serve');
	});

	it('survives a network failure', async () => {
		const out = await scan('https://a.example/', (async () => {
			throw new TypeError('fetch failed');
		}) as unknown as typeof fetch);
		expect(out.ok).toBe(false);
		expect(text(out)).toBe(en.scan.errors.offline);
	});
});

describe('helpers', () => {
	it('counts, names and links', () => {
		expect(errors(report)).toBe(1);
		expect(host('https://www.allbirds.com/x')).toBe('allbirds.com');
		expect(shareLink('https://webmcp.zone', 'https://a.example/')).toBe(
			'https://webmcp.zone/?scan=https%3A%2F%2Fa.example%2F'
		);
		expect(shareLink('https://webmcp.zone', 'https://a.example/', '/ja/')).toBe(
			'https://webmcp.zone/ja/?scan=https%3A%2F%2Fa.example%2F'
		);
	});
});

describe('badgeEmbed', () => {
	it('inlines the badge SVG inside a link to a live re-scan, with nothing loaded from us', () => {
		const html = badgeEmbed('https://webmcp.zone', 'https://a.example/?x=1&y="2"', 'card', TITLE);
		expect(html).toContain(
			'href="https://webmcp.zone/?scan=https%3A%2F%2Fa.example%2F%3Fx%3D1%26y%3D%222%22#scan"'
		);
		expect(html).toMatch(/^<a href="[^"]+" title="[^"]+"><svg [\s\S]+<\/svg><\/a>$/);
		expect(html).not.toMatch(/<img|src=|href="[^"]*\.svg/);
		expect(html).toContain(`title="${TITLE}"`);
	});

	it.each(BADGES)('ships a small, script-free $id badge', ({ id, svg }) => {
		expect(svg.length).toBeLessThan(2000);
		expect(svg).not.toMatch(/<script|on\w+=|<image|xlink:href|href=|\sid=/i);
		expect(svg).toContain('<title>Agent-ready: WebMCP tools checked with webmcpx</title>');
		expect(badgeEmbed('https://webmcp.zone', 'https://a.example/', id, TITLE)).toContain(svg);
	});
});
