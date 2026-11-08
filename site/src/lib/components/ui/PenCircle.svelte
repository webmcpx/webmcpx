<!--
	Content circled by hand in the yellow highlighter: an SVG stroke around it that draws itself, holds, fades and draws
	again (pen-loop in base.css). The path is built at the content's real size (not stretched), so the
	drawing always runs the full loop. Decorative: the content inside is unchanged and stays clickable.
	With reduced motion there is no loop and the circle is simply there.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: className }: { children: Snippet; class?: string } = $props();

	let w = $state(0);
	let h = $state(0);
	// Room for the stroke around the content, in px.
	const PAD_X = 8;
	const PAD_Y = 12;
	/** A loose hand-drawn loop (drawn on a 300×60 grid), mapped onto the box: it overshoots where it closes. */
	const loop = (W: number, H: number) => {
		const x = (n: number) => ((n / 300) * W).toFixed(1);
		const y = (n: number) => ((n / 60) * H).toFixed(1);
		return `M${x(268)} ${y(9)}C${x(214)} ${y(-1)} ${x(70)} ${y(1)} ${x(22)} ${y(15)}C${x(-6)} ${y(24)} ${x(2)} ${y(50)} ${x(60)} ${y(56)}C${x(146)} ${y(64)} ${x(276)} ${y(58)} ${x(294)} ${y(38)}C${x(306)} ${y(22)} ${x(280)} ${y(8)} ${x(226)} ${y(5)}`;
	};
	const W = $derived(w + 2 * PAD_X);
	const H = $derived(h + 2 * PAD_Y);
</script>

<span class={['relative inline-block', className]} bind:clientWidth={w} bind:clientHeight={h}>
	{@render children()}
	{#if w > 0}
		<svg
			aria-hidden="true"
			class="pointer-events-none absolute overflow-visible text-marker"
			style="left: {-PAD_X}px; top: {-PAD_Y}px"
			width={W}
			height={H}
			viewBox="0 0 {W} {H}"
			fill="none"
		>
			<path
				class="pen-path"
				d={loop(W, H)}
				pathLength="1"
				stroke="currentColor"
				stroke-width="3.5"
				stroke-linecap="round"
			/>
		</svg>
	{/if}
</span>
