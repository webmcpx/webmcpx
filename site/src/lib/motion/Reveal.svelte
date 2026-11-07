<!--
	Fades its content in once, when it first scrolls into view. Server-rendered with the `reveal` class so
	hydration never flickers; see base.css for the hidden state and the reduced-motion override.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { reveal } from './reveal.ts';

	interface Props {
		/** Stagger siblings by giving each a larger delay. */
		delay?: number;
		class?: ClassValue;
		children: Snippet;
	}

	let { delay = 0, class: className, children }: Props = $props();
</script>

<div class={['reveal', className]} style:--reveal-delay={delay ? `${delay}ms` : undefined} {@attach reveal()}>
	{@render children()}
</div>
