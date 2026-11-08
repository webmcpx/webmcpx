<!--
	Short answers to what people ask about WebMCP: readable without JavaScript, and the same text is
	published as FAQPage structured data (see jsonld.ts), so search and answer engines can quote it.
	Cards like the community section's; the agent one (the main audience, with the longest commands) spans
	two columns, so both rows are full.
-->
<script lang="ts">
	import AppWindow from '@lucide/svelte/icons/app-window';
	import Bot from '@lucide/svelte/icons/bot';
	import Globe from '@lucide/svelte/icons/globe';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Scale from '@lucide/svelte/icons/scale';
	import type { Component } from 'svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { codeParts } from './code.ts';

	const i18n = useI18n();
	const m = $derived(i18n.m.faq);
	const ICONS: Record<keyof typeof m.items, Component> = {
		what: Lightbulb,
		agent: Bot,
		site: AppWindow,
		browsers: Globe,
		mcp: Scale
	};
	const ORDER = ['what', 'agent', 'site', 'browsers', 'mcp'] as const;
</script>

<Section id="faq" kicker={m.kicker} title={m.title}>
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each ORDER as id, i (id)}
			{@const item = m.items[id]}
			{@const Icon = ICONS[id]}
			<li class={['min-w-0', id === 'agent' && 'lg:col-span-2']}>
				<Reveal delay={(i % 3) * 70} class="h-full">
					<div
						class="flex h-full flex-col gap-3 rounded-card border-2 border-ink bg-card p-6 shadow-hard-sm transition-[translate,box-shadow] duration-200 ease-out-expo hover:-translate-y-1 hover:shadow-hard"
					>
						<span class="flex items-center justify-between">
							<span class="grid size-9 place-items-center rounded-full border-2 border-ink bg-marker">
								<Icon size={18} strokeWidth={2} aria-hidden="true" />
							</span>
							<span class="font-mono text-xs text-ink-3" aria-hidden="true">Q{i + 1}</span>
						</span>
						<h3
							class={[
								'font-display text-xl leading-tight font-bold tracking-tight',
								id === 'agent' && 'lg:text-2xl'
							]}
						>
							{item.q}
						</h3>
						<p class={['text-pretty text-ink-2', id === 'agent' && 'lg:text-lg']}>
							{#each codeParts(item.a) as part, j (j)}{#if part.code}<code
										class="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-[0.88em] [overflow-wrap:anywhere] text-ink"
										>{part.text}</code
									>{:else}{part.text}{/if}{/each}
						</p>
					</div>
				</Reveal>
			</li>
		{/each}
	</ul>
</Section>
