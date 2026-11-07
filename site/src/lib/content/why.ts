// "Why WebMCP?": every reason that holds up, ranked by evidence (research: reports/Por que adotar WebMCP.md,
// outside the repo, 2026-11-07). Each claim names its source; our own benchmark is labelled as ours. Left
// out on purpose, because the evidence is thin or points the other way: "safer", accessibility, analytics,
// discoverability, "faster than APIs".

import type { Messages } from '#lib/i18n/dict/en.ts';

/** A source: a proper name stays as data (`name`); a generic label comes from the dictionary (`key`). */
export type Source = { href: string } & (
	{ name: string } | { key: Exclude<keyof Messages['sources'], 'title'> }
);

/** The text of each reason (title, pain, gain) lives in the dictionary under `why.reasons.<id>`. */
export interface Reason {
	id: keyof Messages['why']['reasons'];
	sources: Source[];
}

/** A source's label in the current language. */
export const sourceLabel = (s: Source, m: Messages) => ('name' in s ? s.name : m.sources[s.key]);

const SPEC: Source = { key: 'draft', href: 'https://webmachinelearning.github.io/webmcp/' };
const EXPLAINER: Source = { key: 'explainer', href: 'https://github.com/webmachinelearning/webmcp' };
const MIND2WEB: Source = { name: 'Online-Mind2Web, 2025', href: 'https://arxiv.org/abs/2504.01382' };
const WINDTUNNEL: Source = { name: 'WindTunnel (nekuda)', href: 'https://webmcp.com/benchmark' };
const OURS: Source = { key: 'ours', href: '#proof' };
const SHOPIFY: Source = { name: 'Shopify', href: 'https://shopify.dev/changelog/webmcp-liquid-hydrogen' };

/** Strongest evidence first: the first four carry the section, the rest support it. */
export const REASONS: Reason[] = [
	{ id: 'finish', sources: [MIND2WEB, WINDTUNNEL, OURS] },
	{
		id: 'tokens',
		sources: [
			{
				key: 'snapshotCost',
				href: 'https://dev.to/nitai_aharoni_1006318cb51/what-a-browser-mcp-snapshot-actually-costs-i-measured-it-46if'
			},
			OURS
		]
	},
	{ id: 'speed', sources: [MIND2WEB, WINDTUNNEL] },
	{
		id: 'backend',
		sources: [EXPLAINER, SHOPIFY, { name: 'Cloudflare', href: 'https://blog.cloudflare.com/webmcp/' }]
	},
	{
		id: 'loop',
		sources: [
			SPEC,
			{ key: 'shopifyCheckout', href: 'https://shopify.dev/changelog/webmcp-support-for-checkout' }
		]
	},
	{ id: 'state', sources: [SHOPIFY] },
	{ id: 'control', sources: [SPEC] },
	{ id: 'small', sources: [SPEC] }
];
