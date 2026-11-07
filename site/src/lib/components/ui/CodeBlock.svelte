<!-- A highlighted code block (HTML from `server/highlight.ts`) with an optional title bar and copy button. -->
<script lang="ts">
	import type { Highlighted } from '#lib/content/snippets.ts';
	import CopyButton from './CopyButton.svelte';

	interface Props {
		snippet: Highlighted;
		/** Shown in the title bar, e.g. a file name. Defaults to the language. */
		title?: string;
		copy?: boolean;
		class?: string;
	}

	let { snippet, title, copy = true, class: className }: Props = $props();
</script>

<figure class={['min-w-0 overflow-hidden rounded-2xl border border-border bg-code', className]}>
	<figcaption class="flex h-11 items-center justify-between gap-3 border-b border-border pr-1.5 pl-4">
		<span class="truncate font-mono text-xs text-subtle">{title ?? snippet.lang}</span>
		{#if copy}
			<CopyButton text={snippet.code} label="Copy {title ?? snippet.lang} code" class="size-8" />
		{/if}
	</figcaption>
	<!-- Shiki escapes the code; the HTML is generated at build time from our own snippets. -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	<div class="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">{@html snippet.html}</div>
</figure>
