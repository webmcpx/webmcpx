<!--
	Code samples as tabs with logos (WAI-ARIA tabs: arrow keys, Home/End). The first tab opens: list the
	most used first. Without JavaScript every panel shows, one after another, each with its copy button.
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
	import { onMount } from 'svelte';
	import BrandIcon from './BrandIcon.svelte';
	import CodeBlock from './CodeBlock.svelte';

	let { tabs, label, id: prefix }: { tabs: CodeTab[]; label: string; id: string } = $props();

	let active = $state(0);
	let hydrated = $state(false);
	onMount(() => (hydrated = true));
	const buttons: HTMLButtonElement[] = [];

	function key(event: KeyboardEvent, i: number) {
		const last = tabs.length - 1;
		const next =
			event.key === 'ArrowRight'
				? (i + 1) % tabs.length
				: event.key === 'ArrowLeft'
					? (i - 1 + tabs.length) % tabs.length
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? last
							: -1;
		if (next < 0) return;
		event.preventDefault();
		active = next;
		buttons[next]?.focus();
	}
	const brand = (icon: CodeTab['icon']): icon is SimpleIcon => typeof icon === 'object' && 'path' in icon;
</script>

<div role="tablist" aria-label={label} class="flex flex-wrap gap-2">
	{#each tabs as tab, i (tab.id)}
		<button
			bind:this={buttons[i]}
			id="{prefix}-tab-{tab.id}"
			role="tab"
			type="button"
			aria-selected={active === i}
			aria-controls="{prefix}-panel-{tab.id}"
			tabindex={active === i ? 0 : -1}
			onclick={() => (active = i)}
			onkeydown={(e) => key(e, i)}
			class={[
				'inline-flex items-center gap-2 rounded-full border-2 border-ink px-3.5 py-1.5 font-mono text-sm font-medium transition',
				active === i ? 'bg-ink text-paper' : 'bg-card text-ink hover:bg-paper-2'
			]}
		>
			{#if brand(tab.icon)}
				<BrandIcon icon={tab.icon} size={15} class="shrink-0" />
			{:else}
				<tab.icon size={15} strokeWidth={2.25} aria-hidden="true" />
			{/if}
			{tab.label}
		</button>
	{/each}
</div>
{#each tabs as tab, i (tab.id)}
	<div
		id="{prefix}-panel-{tab.id}"
		role="tabpanel"
		aria-labelledby="{prefix}-tab-{tab.id}"
		hidden={hydrated && active !== i}
		class="mt-4"
	>
		<CodeBlock snippet={tab.snippet} title={tab.title} class="code-wrap" />
		{#if tab.note}<p class="mt-3 text-left text-sm text-pretty text-ink-2">{tab.note}</p>{/if}
	</div>
{/each}
