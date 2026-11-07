<!--
	Why WebMCP: every reason that holds up, strongest evidence first (data and sources in `content/why.ts`),
	four cards per row, and the draft's status in plain sight. The best saving is computed from the
	published run, never typed.
-->
<script lang="ts">
	import Blocks from '@lucide/svelte/icons/blocks';
	import CircleCheck from '@lucide/svelte/icons/circle-check-big';
	import Coins from '@lucide/svelte/icons/coins';
	import Eye from '@lucide/svelte/icons/eye';
	import ServerOff from '@lucide/svelte/icons/server-off';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Sliders from '@lucide/svelte/icons/sliders-horizontal';
	import Timer from '@lucide/svelte/icons/timer';
	import type { Component } from 'svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { REASONS, sourceLabel, type Reason } from '#lib/content/why.ts';
	import { ratio } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		/** The largest token saving among the showcased questions (e.g. 96.8). */
		bestSaving: number;
		/** On which site that saving was measured. */
		bestSite: string;
	}

	let { bestSaving, bestSite }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.why);

	const ICONS: Record<Reason['id'], Component> = {
		finish: CircleCheck,
		tokens: Coins,
		speed: Timer,
		backend: ServerOff,
		loop: Eye,
		state: ShoppingCart,
		control: Sliders,
		small: Blocks
	};
	const fill = (s: string) => fmt(s, { best: ratio(bestSaving), bestSite });
</script>

<Section id="why" kicker={m.kicker} title={m.title} lead={m.lead}>
	<ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each REASONS as r, i (r.id)}
			{@const Icon = ICONS[r.id]}
			{@const t = m.reasons[r.id]}
			<li class="min-w-0">
				<Reveal delay={(i % 4) * 60} class="h-full">
					<div class="flex h-full flex-col rounded-card border-2 border-ink bg-card p-5 shadow-hard">
						<h3 class="flex items-center gap-3 font-display text-xl leading-tight font-bold tracking-tight">
							<span
								class="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-marker"
								aria-hidden="true"
							>
								<Icon size={20} strokeWidth={2} />
							</span>
							<span class="text-balance">{t.title}</span>
						</h3>
						<p class="mt-4 font-mono text-[10px] tracking-widest text-ink-3 uppercase">{m.today}</p>
						<p class="mt-1 text-[15px] text-pretty text-ink-2">{t.pain}</p>
						<p class="mt-3 font-mono text-[10px] tracking-widest text-ink-3 uppercase">{m.with}</p>
						<p class="mt-1 text-[15px] text-pretty">{fill(t.gain)}</p>
						<p class="mt-auto pt-4 font-mono text-[11px] leading-relaxed text-ink-3">
							<span class="tracking-widest uppercase">{i18n.m.sources.title}</span>
							{#each r.sources as s, j (s.href)}
								{#if j}<span class="mx-1" aria-hidden="true">·</span>{/if}
								<a
									href={s.href}
									class="text-ink-2 underline decoration-hairline underline-offset-2 hover:text-ink hover:decoration-ink"
									>{sourceLabel(s, i18n.m)}</a
								>
							{/each}
						</p>
					</div>
				</Reveal>
			</li>
		{/each}
	</ol>
	<p class="mt-8 max-w-3xl text-sm text-pretty text-ink-3">{m.status}</p>
</Section>
