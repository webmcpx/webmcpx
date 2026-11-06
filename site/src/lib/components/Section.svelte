<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		id,
		eyebrow,
		title,
		children
	}: { id: string; eyebrow: string; title: string; children: Snippet } = $props();
</script>

<section {id} class="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
	<p class="text-sm font-semibold tracking-wide text-accent-ink uppercase dark:text-accent">{eyebrow}</p>
	<h2 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
	<div class="mt-8">{@render children()}</div>
</section>
