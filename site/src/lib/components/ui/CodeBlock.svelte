<!-- A highlighted code block (HTML from `server/highlight.ts`) on ink, with an optional title and copy. -->
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

<figure class={['min-w-0 overflow-hidden rounded-2xl border-2 border-ink bg-code shadow-hard', className]}>
	<figcaption class="flex h-12 items-center justify-between gap-3 pr-2 pl-4">
		<span class="truncate font-mono text-xs text-on-code">{title ?? snippet.lang}</span>
		{#if copy}<CopyButton text={snippet.code} label="Copy {title ?? snippet.lang}" />{/if}
	</figcaption>
	<!-- Focusable so keyboard users can scroll long lines (WCAG; axe scrollable-region-focusable); text-on-code
	     for samples without highlighting. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="overflow-x-auto px-4 pb-4 font-mono text-[13px] leading-relaxed text-on-code"
		tabindex="0"
		role="region"
		aria-label="{title ?? snippet.lang} code"
	>
		<!-- Escaped HTML: shiki at build time, or plain code escaped by the caller (see ScanResult). -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html snippet.html}
	</div>
</figure>
