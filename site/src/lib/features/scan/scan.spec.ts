import { describe, expect, it } from 'vitest';
import { errors, host, normalize, scan, shareLink, type Report } from './scan.ts';

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
	elapsed_ms: 1
};

const respond = (status: number, body: unknown) =>
	(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

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

	it('passes the server message through', async () => {
		const out = await scan('http://10.0.0.1/', respond(400, { error: '10.0.0.1 is not a public address' }));
		expect(out).toEqual({ ok: false, error: '10.0.0.1 is not a public address' });
	});

	it('explains a missing scanner', async () => {
		const out = await scan('https://a.example/', respond(404, {}));
		expect(out.ok).toBe(false);
		expect(!out.ok && out.error).toContain('just serve');
	});

	it('survives a network failure', async () => {
		const out = await scan('https://a.example/', (async () => {
			throw new TypeError('fetch failed');
		}) as unknown as typeof fetch);
		expect(out.ok).toBe(false);
	});
});

describe('helpers', () => {
	it('counts, names and links', () => {
		expect(errors(report)).toBe(1);
		expect(host('https://www.allbirds.com/x')).toBe('allbirds.com');
		expect(shareLink('https://webmcp.zone', 'https://a.example/')).toBe(
			'https://webmcp.zone/?scan=https%3A%2F%2Fa.example%2F'
		);
	});
});
