<!-- The four headline numbers, as plain prerendered text (no count-up: crawlers and agents read them too). -->
<script lang="ts">
	import Coins from '@lucide/svelte/icons/coins';
	import Timer from '@lucide/svelte/icons/timer';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Zap from '@lucide/svelte/icons/zap';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { compare, percent, perThousand, type Headline } from './bench.ts';

	let { headline: h }: { headline: Headline } = $props();

	const tiles = $derived([
		{ icon: Zap, ...compare(h.baseline.tokens, h.webmcp.tokens, 'fewer tokens', 'more tokens') },
		{ icon: Timer, ...compare(h.baseline.duration_ms, h.webmcp.duration_ms, 'faster', 'slower') },
		{
			icon: Trophy,
			value: percent(h.webmcp.success_rate),
			label: `tasks solved, vs ${percent(h.baseline.success_rate)}`
		},
		{
			icon: Coins,
			value: perThousand(h.webmcp.cost_usd),
			label: `per 1,000 tasks, vs ${perThousand(h.baseline.cost_usd)}`
		}
	]);
</script>

<dl class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
	{#each tiles as tile, i (tile.label)}
		<Reveal delay={i * 80} class="flex flex-col gap-3 bg-surface p-5 sm:p-6">
			<tile.icon size={22} strokeWidth={1.6} class="text-accent-ink" aria-hidden="true" />
			<dt class="order-last text-sm text-muted">{tile.label}</dt>
			<dd class="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{tile.value}</dd>
		</Reveal>
	{/each}
</dl>
