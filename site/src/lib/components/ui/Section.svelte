<!--
	A page section: anchor id, a big hand-drawn headline, an optional one-line lead, then content. Behind it,
	the Junction as a faint watermark, placed per section (watermark.ts) so the page reads as one composition.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { JUNCTION } from '#lib/content/brand.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { markFor } from './watermark.ts';

	interface Props {
		id: string;
		title: string;
		lead?: string;
		/** Small label above the headline. */
		kicker?: string;
		center?: boolean;
		children: Snippet;
	}

	let { id, title, lead, kicker, center = false, children }: Props = $props();
	const mark = $derived(markFor(id));
</script>

<div class="relative isolate overflow-clip">
	<svg
		aria-hidden="true"
		viewBox={JUNCTION.viewBox}
		fill="currentColor"
		class="watermark pointer-events-none absolute -z-10 text-ink"
		style="left: {mark.x}; top: {mark.y}; width: clamp(240px, {(mark.size / 14.4).toFixed(
			1
		)}vw, {mark.size}px); --r: {mark.rotate}deg"
	>
		{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
	</svg>
	<section
		{id}
		aria-labelledby="{id}-title"
		class="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
	>
		<Reveal class={[center && 'mx-auto max-w-3xl text-center']}>
			{#if kicker}
				<p class="mb-4 font-mono text-xs font-medium tracking-widest text-ink-3 uppercase">{kicker}</p>
			{/if}
			<h2 id="{id}-title" class="font-display text-headline font-bold text-balance">{title}</h2>
			{#if lead}<p class="mt-4 text-lg text-pretty text-ink-2">{lead}</p>{/if}
		</Reveal>
		<div class="mt-10 sm:mt-12">{@render children()}</div>
	</section>
</div>
