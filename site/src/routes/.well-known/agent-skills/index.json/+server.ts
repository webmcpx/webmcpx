// The Agent Skills discovery index (RFC v0.2.0). Prerendered.
import { skillsIndex } from '#lib/server/discovery.ts';

export const prerender = true;
export const GET = async () =>
	new Response(await skillsIndex(), { headers: { 'content-type': 'application/json' } });
