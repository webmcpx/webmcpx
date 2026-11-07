<!-- A page section: anchor id, eyebrow, headline and lead, then content. -->
<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		id: string;
		eyebrow: string;
		title: string;
		lead?: string;
		icon?: Component<{ size?: number; 'aria-hidden'?: boolean }>;
		children: Snippet;
	}

	let { id, eyebrow, title, lead, icon: Icon, children }: Props = $props();
</script>

<section {id} aria-labelledby="{id}-title" class="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28">
	<Reveal class="max-w-3xl">
		<p
			class="flex items-center gap-2 font-mono text-xs font-medium tracking-widest text-accent-ink uppercase"
		>
			{#if Icon}<Icon size={14} aria-hidden={true} />{/if}
			{eyebrow}
		</p>
		<h2 id="{id}-title" class="mt-4 text-headline font-semibold text-balance">{title}</h2>
		{#if lead}
			<p class="mt-5 text-lg text-pretty text-muted">{lead}</p>
		{/if}
	</Reveal>
	<div class="mt-12">{@render children()}</div>
</section>
