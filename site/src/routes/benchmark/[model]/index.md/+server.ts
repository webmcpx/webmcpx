// /benchmark/<model>/index.md: that run as Markdown, for agents (also served for Accept: text/markdown).
import { benchmarkMarkdown } from '#lib/server/agents.ts';
import { loadRuns } from '#lib/server/bench.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => loadRuns().map((r) => ({ model: r.results.model }));
export const GET: RequestHandler = ({ params }) =>
	new Response(benchmarkMarkdown(params.model), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
