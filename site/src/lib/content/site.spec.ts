import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VERSION } from './site.ts';
import { LOADER_URL } from './snippets.ts';

describe('version', () => {
	const pkg = JSON.parse(
		readFileSync(new URL('../../../../packages/webmcpx/package.json', import.meta.url), 'utf8')
	);
	const line = pkg.version.split('.').slice(0, 2).join('.');

	it('the header shows the published minor line', () => {
		expect(VERSION).toBe(line);
	});

	it('the install line loads that line from the CDN', () => {
		expect(LOADER_URL).toContain(`webmcpx@${line}/`);
	});
});
