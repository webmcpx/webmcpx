// /llms-full.txt: llms.txt plus the README and the agent skill, in one file. Prerendered.
import { llmsFullTxt } from '#lib/server/agents.ts';

export const prerender = true;
export const GET = async () =>
	new Response(await llmsFullTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
