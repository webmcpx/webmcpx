// Build time only: the copy that reaches the browser already rendered, so it never weighs on a language's
// dictionary chunk: the benchmark questions (keyed by task id; the run files stay as the harness wrote
// them, in English) and the prompts people paste into their agent. One file per language in
// `i18n/build/<code>.ts`; English is the source (the run files and `content/snippets.ts`), so it has none.
// Agent files (`llms.txt`, `index.md`) stay in English and never read this.
import { OWN, SNIPPETS, type CodeSample } from '#lib/content/snippets.ts';
import type { ModelRun } from '#lib/features/benchmark/bench.ts';
import { isLocale, type LocaleCode } from '#lib/i18n/locales.ts';

export interface BuildCopy {
	/** Task id → the question, transcreated. Names, values and code in quotes or backticks stay verbatim. */
	questions: Record<string, string>;
	/** The copy-to-agent prompts: commands, URLs and file names verbatim. */
	prompts: {
		/** `SNIPPETS.mcpPrompt`: "For agents". */
		mcp: string;
		/** `SNIPPETS.agentPrompt`: "For sites", the coding agent tab. */
		agent: string;
		/** `OWN.agent`: "Your own tools", the coding agent tab. */
		own: string;
	};
}

const COPY = import.meta.glob<BuildCopy>('../i18n/build/*.ts', { eager: true, import: 'default' });

/** The build copy of a language, or null for English (and for a route without a language). */
export function buildCopy(lang: string | undefined): BuildCopy | null {
	const code: LocaleCode = isLocale(lang) ? lang : 'en';
	if (code === 'en') return null;
	const copy = COPY[`../i18n/build/${code}.ts`];
	if (!copy) throw new Error(`no build copy for ${code}`);
	return copy;
}

/** The runs with each question in the reader's language (English where a translation is missing). */
export function localizeRuns(runs: ModelRun[], lang: string | undefined): ModelRun[] {
	const copy = buildCopy(lang);
	if (!copy) return runs;
	return runs.map((run) => ({
		...run,
		sites: run.sites.map((site) => ({
			...site,
			tasks: site.tasks.map((t) => ({ ...t, prompt: copy.questions[t.task] ?? t.prompt }))
		}))
	}));
}

const withCode = (sample: CodeSample, code: string): CodeSample => ({ ...sample, code });

/** Every code sample, with the copy-to-agent prompts in the reader's language. */
export function localizedSnippets(lang: string | undefined) {
	const copy = buildCopy(lang);
	if (!copy) return { snippets: SNIPPETS, own: OWN };
	return {
		snippets: {
			...SNIPPETS,
			mcpPrompt: withCode(SNIPPETS.mcpPrompt, copy.prompts.mcp),
			agentPrompt: withCode(SNIPPETS.agentPrompt, copy.prompts.agent)
		},
		own: { ...OWN, agent: withCode(OWN.agent, copy.prompts.own) }
	};
}
