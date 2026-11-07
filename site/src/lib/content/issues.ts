// Pain points reported in the WebMCP spec tracker and how webmcpx handles them.
// Keep in sync with what the code does; every row must be true today. Wording follows the WebMCP draft
// (Draft Community Group Report, 2 November 2026): webmcpx conventions and lint policy are named as ours,
// never as spec requirements. The title and fix shown on each card live in the dictionary under
// `issues.items.<id>`; the pain (not shown) is noted here, for whoever keeps the rows true.

import type { Component } from 'svelte';
import type { Messages } from '#lib/i18n/dict/en.ts';
import Blocks from '@lucide/svelte/icons/blocks';
import EyeOff from '@lucide/svelte/icons/eye-off';
import Gauge from '@lucide/svelte/icons/gauge';
import Layers from '@lucide/svelte/icons/layers';
import Ruler from '@lucide/svelte/icons/ruler';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import Snowflake from '@lucide/svelte/icons/snowflake';

export interface Issue {
	id: keyof Messages['issues']['items'];
	number: number;
	icon: Component;
}

export const ISSUES: Issue[] = [
	// Hundreds of sites hand-roll the same tools: search_site and fetch_as_markdown top the list.
	{ id: 'shared', number: 319, icon: Blocks },
	// When execute() rejects, the agent gets a generic OperationError with no reason it can act on.
	{ id: 'errors', number: 282, icon: ShieldCheck },
	// outputSchema is optional and the draft defines no way to say a result was truncated.
	{ id: 'paging', number: 292, icon: Layers },
	// Some browsers expose a frozen modelContext object, so polyfills that assign to it silently fail.
	{ id: 'frozen', number: 293, icon: Snowflake },
	// Zero-width, bidi and tag characters hide instructions from humans.
	{ id: 'hidden', number: 360, icon: EyeOff },
	// Names are capped at 128 characters; descriptions have no limit yet, and browsers may cut them.
	{ id: 'length', number: 359, icon: Ruler },
	// A page with 126 tools got WebMCP disabled.
	{ id: 'budget', number: 255, icon: Gauge }
];

export const issueUrl = (n: number) => `https://github.com/webmachinelearning/webmcp/issues/${n}`;
