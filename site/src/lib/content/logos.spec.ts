import { describe, expect, it } from 'vitest';
import { BENCH_SITES } from './benchSites.ts';
import * as logos from './logos.ts';
import { SITES } from './sites.ts';

const all = Object.entries(logos).filter((e): e is [string, logos.Logo] => typeof e[1] === 'object');
// Path data only: drawing commands and numbers, nothing that could carry markup or script.
const PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\-\s eE]+$/;

describe('logos', () => {
	it.each(all)('%s is drawing data only, with a valid viewBox', (_, logo) => {
		expect(logo.viewBox).toMatch(/^-?[\d.]+ -?[\d.]+ [\d.]+ [\d.]+$/);
		const ds = [...logo.paths, ...(logo.strokes ?? []), ...(logo.cutouts ?? [])].map((p) => p.d);
		expect(ds.length).toBeGreaterThan(0);
		for (const d of ds) expect(d).toMatch(PATH);
	});

	it('every site on the page has a logo', () => {
		for (const site of SITES) expect(site.logo, site.name).toBeDefined();
		for (const [key, look] of Object.entries(BENCH_SITES)) expect(look.logo, key).toBeDefined();
	});
});
