// /index.md: the home page as Markdown, for agents (linked from every page and from llms.txt). Prerendered.
import { homeMarkdown } from '#lib/server/agents.ts';

export const prerender = true;
export const GET = () =>
	new Response(homeMarkdown(), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
