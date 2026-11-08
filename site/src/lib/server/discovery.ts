// Build time only: the agent discovery files under /.well-known (as isitagentready.com and others check).
// Agent Skills Discovery RFC v0.2.0 (github.com/cloudflare/agent-skills-discovery-rfc) and the API catalog
// of RFC 9727. The skill is the repo's own skills/webmcpx/SKILL.md, so the digest can never go stale.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ORIGIN, REPO } from '#lib/content/site.ts';

/** The repo's skill, as published. */
export const skillMd = () => readFile(resolve(process.cwd(), '..', 'skills/webmcpx/SKILL.md'), 'utf8');

/** /.well-known/agent-skills/index.json */
export async function skillsIndex(): Promise<string> {
	const md = await skillMd();
	const description =
		/^description:\s*(.+)$/m
			.exec(md)?.[1]
			?.trim()
			.replace(/^["']|["']$/g, '') ?? '';
	return JSON.stringify(
		{
			$schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
			skills: [
				{
					name: 'webmcpx',
					type: 'skill-md',
					description,
					url: '/.well-known/agent-skills/webmcpx/SKILL.md',
					digest: `sha256:${createHash('sha256').update(md, 'utf8').digest('hex')}`
				}
			]
		},
		null,
		2
	);
}

/** /.well-known/api-catalog: the public scan API (RFC 9727, application/linkset+json). */
export const apiCatalog = () =>
	JSON.stringify(
		{
			linkset: [
				{
					anchor: `${ORIGIN}/api/scan`,
					// How to call it (llms.txt documents GET /api/scan?url=) and the project behind it.
					'service-doc': [{ href: `${ORIGIN}/llms.txt`, type: 'text/plain' }],
					describedby: [{ href: `${REPO}#readme`, type: 'text/html' }]
				}
			]
		},
		null,
		2
	);
