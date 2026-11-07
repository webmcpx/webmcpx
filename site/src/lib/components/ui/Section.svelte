<!-- A page section: anchor id, a big hand-drawn headline, an optional one-line lead, then content. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Reveal from '#lib/motion/Reveal.svelte';

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
</script>

<section {id} aria-labelledby="{id}-title" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
	<Reveal class={['max-w-3xl', center && 'mx-auto text-center']}>
		{#if kicker}
			<p class="mb-4 font-mono text-xs font-medium tracking-widest text-ink-3 uppercase">{kicker}</p>
		{/if}
		<h2 id="{id}-title" class="font-display text-headline font-bold text-balance">{title}</h2>
		{#if lead}<p class="mt-4 text-lg text-pretty text-ink-2">{lead}</p>{/if}
	</Reveal>
	<div class="mt-10 sm:mt-12">{@render children()}</div>
</section>
