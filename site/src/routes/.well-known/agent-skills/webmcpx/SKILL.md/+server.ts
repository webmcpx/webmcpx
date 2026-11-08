// The webmcpx skill, byte for byte the repo's skills/webmcpx/SKILL.md (its digest is in the index). Prerendered.
import { skillMd } from '#lib/server/discovery.ts';

export const prerender = true;
export const GET = async () =>
	new Response(await skillMd(), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
