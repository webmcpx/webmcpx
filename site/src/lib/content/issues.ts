// Pain points reported in the WebMCP spec tracker and how webmcpx handles them.
// Keep in sync with what the code does; every row must be true today.

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
		title: 'Standard tools',
		pain: 'Hundreds of sites hand-roll the same tools: search_site and fetch_as_markdown top the list.',
		fix: 'Standard search_page, fetch_as_markdown, get_page_context and search_site, one script tag.',
		icon: Blocks
	},
	{
		number: 282,
		title: 'Errors agents can act on',
		pain: 'A rejected tool call reaches the agent as a bare UnknownError.',
		fix: 'Tools never reject: every result is an envelope with a stable error code, retryable flag and hint.',
		icon: ShieldCheck
	},
	{
		number: 292,
		title: 'Typed, paged results',
		pain: 'Results are untyped and cannot say they were truncated.',
		fix: 'Output budgets, truncated + next_cursor paging, the same shape for every tool.',
		icon: Layers
	},
	{
		number: 293,
		title: 'Frozen hosts',
		pain: 'Some agent browsers expose a frozen modelContext; polyfills silently fail.',
		fix: 'Only registerTool() is called, never an assignment. Tested against a frozen host.',
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
		pain: 'No agreed limits for names and descriptions; hosts may cut them.',
		fix: 'webmcpx lint warns at Chrome’s guidance and errors at the proposed host floors.',
		icon: Ruler
	},
	{
		number: 255,
		title: 'Tool budget',
		pain: 'A page with 126 tools got WebMCP disabled.',
		fix: 'The tool-budget rule warns above 20 tools per page and errors above 100.',
		icon: Gauge
	}
];

export const issueUrl = (n: number) => `https://github.com/webmachinelearning/webmcp/issues/${n}`;
