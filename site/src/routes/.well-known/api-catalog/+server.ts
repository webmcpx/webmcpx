// The API catalog (RFC 9727): the public scan API. Prerendered; nginx serves it as application/linkset+json.
import { apiCatalog } from '#lib/server/discovery.ts';

export const prerender = true;
export const GET = () =>
	new Response(apiCatalog(), { headers: { 'content-type': 'application/linkset+json' } });
