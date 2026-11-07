<!--
	Code samples as `Tabs` with logos: one code block (with its copy button) per tab, and an optional note.
	The first tab opens, so list the most used first. Without JavaScript every panel shows, stacked.
-->
<script lang="ts" module>
	import type { Component } from 'svelte';
	import type { SimpleIcon } from 'simple-icons';
	import type { Highlighted } from '#lib/content/snippets.ts';

	export interface CodeTab {
		id: string;
		label: string;
		/** A brand logo (simple-icons) or a Lucide icon. */
		icon: SimpleIcon | Component<{ size?: number; strokeWidth?: number; 'aria-hidden'?: 'true' }>;
		snippet: Highlighted;
		/** The code block's title: a file name or "terminal". */
		title: string;
		note?: string;
	}
</script>

<script lang="ts">
	import BrandIcon from './BrandIcon.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import Tabs from './Tabs.svelte';

	let { tabs, label }: { tabs: CodeTab[]; label: string } = $props();

	const brand = (icon: CodeTab['icon']): icon is SimpleIcon => typeof icon === 'object' && 'path' in icon;
</script>

<Tabs
	items={tabs}
	{label}
	listClass="flex-wrap gap-2"
	tabClass="h-9 border-ink bg-card px-3.5 font-mono text-sm text-ink hover:bg-paper-2 aria-selected:bg-ink aria-selected:text-paper"
>
	{#snippet tab(item)}
		{#if brand(item.icon)}
			<BrandIcon icon={item.icon} size={15} class="shrink-0" />
		{:else}
			<item.icon size={15} strokeWidth={2.25} aria-hidden="true" />
		{/if}
		{item.label}
	{/snippet}
	{#snippet panel(item)}
		<div class="mt-4">
			<CodeBlock snippet={item.snippet} title={item.title} />
			{#if item.note}<p class="mt-3 text-left text-sm text-pretty text-ink-2">{item.note}</p>{/if}
		</div>
	{/snippet}
</Tabs>
