// Pain points reported in the WebMCP spec tracker and how webmcpx handles them.
// Keep in sync with what the code does; every row must be true today. Wording follows the WebMCP draft
// (Draft Community Group Report, 2 November 2026): webmcpx conventions and lint policy are named as ours,
// never as spec requirements.

import type { Component } from 'svelte';
import Blocks from '@lucide/svelte/icons/blocks';
import EyeOff from '@lucide/svelte/icons/eye-off';
import Gauge from '@lucide/svelte/icons/gauge';
import Layers from '@lucide/svelte/icons/layers';
import Ruler from '@lucide/svelte/icons/ruler';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import Snowflake from '@lucide/svelte/icons/snowflake';

export interface Issue {
	number: number;
	title: string;
	pain: string;
	fix: string;
	icon: Component;
}

export const ISSUES: Issue[] = [
	{
		number: 319,
		title: 'Shared tools',
		pain: 'Hundreds of sites hand-roll the same tools: search_site and fetch_as_markdown top the list.',
		fix: 'One script tag registers webmcpx’s search_page, fetch_as_markdown and get_page_context; search_site when you pass your search.',
		icon: Blocks
	},
	{
		number: 282,
		title: 'Errors agents can act on',
		pain: 'When execute() rejects, the agent gets a generic OperationError with no reason it can act on.',
		fix: 'webmcpx tools return expected failures as a result: a stable error code, a retryable flag and a hint.',
		icon: ShieldCheck
	},
	{
		number: 292,
		title: 'Paged results',
		pain: 'outputSchema is optional and the draft defines no way to say a result was truncated.',
		fix: 'Every webmcpx tool uses one result shape, with output budgets and truncated + next_cursor paging.',
		icon: Layers
	},
	{
		number: 293,
		title: 'Frozen modelContext',
		pain: 'Some browsers expose a frozen modelContext object, so polyfills that assign to it silently fail.',
		fix: 'webmcpx only calls registerTool(), never assigns. Tested against a frozen modelContext.',
		icon: Snowflake
	},
	{
		number: 360,
		title: 'Hidden instructions',
		pain: 'Zero-width, bidi and tag characters hide instructions from humans.',
		fix: 'Stripped from page text at runtime; the linter flags and --fix removes them in source.',
		icon: EyeOff
	},
	{
		number: 359,
		title: 'Length limits',
		pain: 'Names are capped at 128 characters; descriptions have no limit yet, and browsers may cut them.',
		fix: 'webmcpx lint checks the name rules and flags descriptions past Chrome’s guidance.',
		icon: Ruler
	},
	{
		number: 255,
		title: 'Tool budget',
		pain: 'A page with 126 tools got WebMCP disabled.',
		fix: 'webmcpx lint warns above 20 tools per page and errors above 100 (our policy, not the draft’s).',
		icon: Gauge
	}
];

export const issueUrl = (n: number) => `https://github.com/webmachinelearning/webmcp/issues/${n}`;
