import { describe, expect, it } from 'vitest';
import { OWN, SNIPPETS } from '#lib/content/snippets.ts';
import { LOCALE_CODES } from '#lib/i18n/locales.ts';
import { parse } from '#lib/features/benchmark/bench.ts';
import { buildCopy, localizedSnippets, localizeRuns } from './localize.ts';
import { loadRuns } from './bench.ts';

const FILES = import.meta.glob<unknown>('../content/bench/*.json', { eager: true, import: 'default' });
const prompts = new Map(
	Object.values(FILES).flatMap((d) => Object.entries(parse(d).tasks).map(([id, t]) => [id, t.prompt]))
);
const others = LOCALE_CODES.filter((c) => c !== 'en');

/** What a transcreation must keep verbatim: code, URLs, prices, and the names in a question. */
const KEEP = [
	/`[^`]+`/g,
	/https:\/\/\S+[^.\s,)]/g,
	/\$\d+/g,
	/\b(?:page_size|max-age|HSTS|INP|Orbit|orbit deploy|Workers (?:Paid|Free)|Business|Enterprise|Apparel|Agent Notebooks|Stoneware Teapot|Speckled Bowl|Ash Glaze Vase|Cloudflare|D1|Workers KV|Queue|Notion|API)\b/g
];
const kept = (s: string) => KEEP.flatMap((re) => s.match(re) ?? []);

describe('build copy', () => {
	it.each(others)('%s translates every published question and keeps its names and values', (code) => {
		const copy = buildCopy(code)!;
		expect(Object.keys(copy.questions).sort()).toEqual([...prompts.keys()].sort());
		for (const [id, en] of prompts) {
			const t = copy.questions[id];
			for (const k of kept(en)) expect(t, `${code} ${id}`).toContain(k);
		}
	});

	it.each(others)('%s keeps the prompts’ commands and URLs verbatim', (code) => {
		const { prompts: p } = buildCopy(code)!;
		for (const [t, en] of [
			[p.mcp, SNIPPETS.mcpPrompt.code],
			[p.agent, SNIPPETS.agentPrompt.code],
			[p.own, OWN.agent.code]
		])
			for (const k of kept(en)) expect(t, code).toContain(k);
	});

	it('leaves English (and a route without a language) as published', () => {
		const runs = loadRuns();
		expect(localizeRuns(runs, undefined)).toBe(runs);
		expect(localizedSnippets('en').snippets).toBe(SNIPPETS);
	});

	it('swaps the questions and prompts for a language', () => {
		const pt = localizeRuns(loadRuns(), 'pt-br');
		const task = pt.flatMap((r) => r.sites.flatMap((s) => s.tasks))[0];
		expect(task.prompt).toBe(buildCopy('pt-br')!.questions[task.task]);
		expect(localizedSnippets('pt-br').own.agent.code).toBe(buildCopy('pt-br')!.prompts.own);
	});
});
