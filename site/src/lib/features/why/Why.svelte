<!--
	Why WebMCP: every reason that holds up, ranked by evidence (data and sources in `content/why.ts`). Four
	lead reasons as cards, three supporting ones below, and the draft's status in plain sight. The best saving
	is computed from the published run, never typed.
-->
<script lang="ts">
	import Blocks from '@lucide/svelte/icons/blocks';
	import CircleCheck from '@lucide/svelte/icons/circle-check-big';
	import Coins from '@lucide/svelte/icons/coins';
	import Eye from '@lucide/svelte/icons/eye';
	import ServerOff from '@lucide/svelte/icons/server-off';
	import Sliders from '@lucide/svelte/icons/sliders-horizontal';
	import Timer from '@lucide/svelte/icons/timer';
	import type { Component } from 'svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { LEAD, STATUS, SUPPORT, type Reason } from '#lib/content/why.ts';
	import { ratio } from '#lib/features/benchmark/bench.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		/** The largest token saving among the showcased questions (e.g. 96.8). */
		bestSaving: number;
		/** On which site that saving was measured. */
		bestSite: string;
	}

	let { bestSaving, bestSite }: Props = $props();

	const ICONS: Record<Reason['id'], Component> = {
		finish: CircleCheck,
		tokens: Coins,
		speed: Timer,
		backend: ServerOff,
		loop: Eye,
		control: Sliders,
		small: Blocks
	};
	const fill = (s: string) => s.replace('{best}', ratio(bestSaving)).replace('{bestSite}', bestSite);
</script>

{#snippet sources(r: Reason)}
	<p class="mt-auto pt-5 font-mono text-[11px] leading-relaxed text-ink-3">
		<span class="tracking-widest uppercase">Sources</span>
		{#each r.sources as s, i (s.href)}
			{#if i}<span class="mx-1" aria-hidden="true">·</span>{/if}
			<a
				href={s.href}
				class="text-ink-2 underline decoration-hairline underline-offset-2 hover:text-ink hover:decoration-ink"
				>{s.label}</a
			>
		{/each}
	</p>
{/snippet}

{#snippet icon(r: Reason, size: number)}
	{@const Icon = ICONS[r.id]}
	<span
		class="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-marker"
		aria-hidden="true"
	>
		<Icon {size} strokeWidth={2} />
	</span>
{/snippet}

<Section
	id="why"
	kicker="Why WebMCP?"
	title="Give agents a contract, not a screenshot."
	lead="WebMCP lets your page hand AI agents typed tools that run in the user’s own tab. Here is what that changes, strongest evidence first."
>
	<ol class="grid gap-4 md:grid-cols-2">
		{#each LEAD as r, i (r.id)}
			<li class="min-w-0">
				<Reveal delay={(i % 2) * 80} class="h-full">
					<div class="flex h-full flex-col rounded-card border-2 border-ink bg-card p-6 shadow-hard sm:p-7">
						{@render icon(r, 22)}
						<h3 class="mt-5 font-display text-2xl font-bold tracking-tight">{r.title}</h3>
						<p class="mt-4 font-mono text-[11px] tracking-widest text-ink-3 uppercase">Today</p>
						<p class="mt-1 text-pretty text-ink-2">{r.pain}</p>
						<p class="mt-4 font-mono text-[11px] tracking-widest text-ink-3 uppercase">With WebMCP</p>
						<p class="mt-1 text-pretty">{fill(r.gain)}</p>
						{@render sources(r)}
					</div>
				</Reveal>
			</li>
		{/each}
	</ol>
	<ol class="mt-4 grid gap-4 md:grid-cols-3" start={LEAD.length + 1}>
		{#each SUPPORT as r, i (r.id)}
			<li class="min-w-0">
				<Reveal delay={i * 80} class="h-full">
					<div class="flex h-full flex-col rounded-card border-2 border-ink bg-card p-5 sm:p-6">
						<div class="flex items-center gap-3">
							{@render icon(r, 20)}
							<h3 class="font-display text-xl font-bold tracking-tight">{r.title}</h3>
						</div>
						<p class="mt-4 text-sm text-pretty text-ink-2">{r.pain}</p>
						<p class="mt-2 text-sm text-pretty">{fill(r.gain)}</p>
						{@render sources(r)}
					</div>
				</Reveal>
			</li>
		{/each}
	</ol>
	<p class="mt-8 max-w-3xl text-sm text-pretty text-ink-3">{STATUS}</p>
</Section>
