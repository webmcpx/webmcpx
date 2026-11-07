// /llms.txt: what webmcpx is and where agents find the rest (llmstxt.org). Prerendered.
import { llmsTxt } from '#lib/server/agents.ts';

export const prerender = true;
export const GET = () =>
	new Response(llmsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
