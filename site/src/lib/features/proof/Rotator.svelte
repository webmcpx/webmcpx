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
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';

	interface Props {
		items: T[];
		/** Names the group for screen readers: "Questions". */
		label: string;
		/** Names one item's dot, with `{n}` and `{total}`: "Question {n} of {total}". */
		itemLabel: string;
		interval?: number;
		/** False while hidden (e.g. behind another tab): no rotation in the background. */
		enabled?: boolean;
		item: Snippet<[T]>;
	}

	let { items, label, itemLabel, interval = 5000, enabled = true, item }: Props = $props();
	const i18n = useI18n();

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
	aria-label={label}
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
				aria-label={fmt(itemLabel, { n: i18n.number(i + 1), total: i18n.number(items.length) })}
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
			aria-label={paused ? i18n.m.proof.rotator.resume : i18n.m.proof.rotator.pause}
			class="ml-1 grid size-6 place-items-center rounded-full text-ink-3 hover:text-ink"
		>
			{#if paused}<Play size={12} aria-hidden="true" />{:else}<Pause size={12} aria-hidden="true" />{/if}
		</button>
	</div>
</div>
