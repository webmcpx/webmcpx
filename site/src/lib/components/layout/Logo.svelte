<!--
	The webmcpx lockup: "webmcp" in Bricolage Grotesque with the Junction mark as the final x, at x-height.
	`mark` shows the Junction alone. The name is announced once, as text.
-->
<script lang="ts">
	import { JUNCTION } from '#lib/content/brand.ts';

	let { class: className, mark = false }: { class?: string; mark?: boolean } = $props();
</script>

<!-- Size comes from `class` (a text-* utility); text-xl when none is given. -->
<span class={['font-brand inline-flex items-baseline font-bold tracking-tight', className ?? 'text-xl']}>
	{#if mark}
		<svg viewBox={JUNCTION.viewBox} class="size-[1em] self-center" fill="currentColor" aria-hidden="true">
			{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
		</svg>
		<span class="sr-only">webmcpx</span>
	{:else}
		<span aria-hidden="true">webmcp</span>
		<svg viewBox="2 4 20 16" class="ml-[0.05em] h-[0.7em] w-auto" fill="currentColor" aria-hidden="true">
			{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
		</svg>
		<span class="sr-only">webmcpx</span>
	{/if}
</span>
