<!--
	Between page sections: a 2px ink rule (the design system's outline weight) with the Junction mark at its
	center, page and agent meeting. Decorative, so screen readers skip it; sections keep their own headings.
-->
<script lang="ts">
	import { JUNCTION } from '#lib/content/brand.ts';
</script>

<div aria-hidden="true" class="mx-auto flex max-w-6xl items-center gap-5 px-4 sm:px-6">
	<span class="h-0.5 flex-1 rounded-full bg-ink"></span>
	<svg viewBox={JUNCTION.viewBox} class="size-6 shrink-0 text-ink" fill="currentColor">
		{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
	</svg>
	<span class="h-0.5 flex-1 rounded-full bg-ink"></span>
</div>
