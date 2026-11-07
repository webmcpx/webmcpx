<!--
	Shows one item at a time and moves to the next every `interval` ms, with a fade. Accessible rotation
	(WCAG 2.2.2): it pauses while hovered or focused, has a pause control and position dots, and never
	auto-advances for people who prefer reduced motion. Without JavaScript the first item stays.
-->
<script lang="ts" generics="T">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import type { Snippet } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	interface Props {
		items: T[];
		/** What one item is called, for the controls: "Question 2 of 4". */
		noun: string;
		interval?: number;
		/** False while hidden (e.g. behind another tab): no rotation in the background. */
		enabled?: boolean;
		item: Snippet<[T]>;
	}

	let { items, noun, interval = 5000, enabled = true, item }: Props = $props();

	let index = $state(0);
	let paused = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	const current = $derived(items[index % items.length]);
	const running = $derived(enabled && !paused && !hovering && !focused && !prefersReducedMotion.current);

	$effect(() => {
		if (!running || items.length < 2) return;
		const t = setInterval(() => {
			if (!document.hidden) index = (index + 1) % items.length;
		}, interval);
		return () => clearInterval(t);
	});
</script>

<div
	role="group"
	aria-roledescription="carousel"
	aria-label="{noun}s"
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	onfocusin={() => (focused = true)}
	onfocusout={() => (focused = false)}
>
	<div class="grid" aria-live={running ? 'off' : 'polite'}>
		{#key index}
			<div
				class="col-start-1 row-start-1"
				in:fade={{ duration: prefersReducedMotion.current ? 0 : 400 }}
				out:fade={{ duration: prefersReducedMotion.current ? 0 : 200 }}
			>
				{@render item(current)}
			</div>
		{/key}
	</div>

	<div class="mt-6 flex items-center justify-center gap-1">
		{#each items, i (i)}
			<!-- A 24 px hit area (WCAG 2.2 target size) around a small visual dot. -->
			<button
				type="button"
				aria-label="{noun} {i + 1} of {items.length}"
				aria-current={i === index ? 'true' : undefined}
				onclick={() => (index = i)}
				class="group grid h-6 min-w-6 place-items-center"
			>
				<span
					class={[
						'h-2 rounded-full transition-all duration-300',
						i === index ? 'w-6 bg-ink' : 'w-2 bg-ink/25 group-hover:bg-ink/50'
					]}
				></span>
			</button>
		{/each}
		<button
			type="button"
			onclick={() => (paused = !paused)}
			aria-label={paused ? 'Resume rotation' : 'Pause rotation'}
			class="ml-1 grid size-6 place-items-center rounded-full text-ink-3 hover:text-ink"
		>
			{#if paused}<Play size={12} aria-hidden="true" />{:else}<Pause size={12} aria-hidden="true" />{/if}
		</button>
	</div>
</div>
