// /sitemap.xml: every page in every language. Prerendered.
import { sitemapXml } from '#lib/server/agents.ts';

export const prerender = true;
export const GET = () => new Response(sitemapXml(), { headers: { 'content-type': 'application/xml' } });
