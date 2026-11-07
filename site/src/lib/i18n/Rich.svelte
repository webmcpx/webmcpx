<!--
	A translated sentence with marked-up pieces, without splitting it into fragments that assume English
	word order: `text` is a template, and each `{name}` in it is rendered by the snippet of that name.

	<Rich text={m.hero.title.text}>
		{#snippet mark()}<span class="marker">{m.hero.title.mark}</span>{/snippet}
	</Rich>

	Fill plain values first with `fmt()`; a placeholder with no snippet is shown as written.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { parts } from './format.ts';

	interface Props {
		text: string;
		[placeholder: string]: Snippet | string;
	}

	let { text, ...snippets }: Props = $props();
	const pieces = $derived(parts(text));
	const snippet = (name: string) => {
		const s = snippets[name];
		return typeof s === 'function' ? s : undefined;
	};
</script>

<!-- One line on purpose: any whitespace here would show up between the pieces. -->
<!-- prettier-ignore -->
{#each pieces as piece, i (i)}{#if i % 2 === 0}{piece}{:else if snippet(piece)}{@render snippet(piece)?.()}{:else}{`{${piece}}`}{/if}{/each}
