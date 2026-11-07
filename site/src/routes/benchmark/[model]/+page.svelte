<!-- The benchmark for one model, for readers without JavaScript (the landing's switcher links here). -->
<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { HOME } from '#lib/content/site.ts';
	import { modelLook } from '#lib/content/models.ts';
	import Proof from '#lib/features/proof/Proof.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const name = $derived(modelLook(data.run.results.model).name);
</script>

<svelte:head>
	<title>webmcpx benchmark: {name}</title>
	<meta
		name="description"
		content="With and without WebMCP on {name}: tokens, time, steps and cost per question."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
	<a
		href="{HOME}#proof"
		class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
	>
		<ArrowLeft size={16} aria-hidden="true" />Back to the landing
	</a>
</div>
<Proof runs={[data.run]} models={data.models} reproduce={data.reproduce} />
