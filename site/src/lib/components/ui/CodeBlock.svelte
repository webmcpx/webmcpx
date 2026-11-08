<!-- A highlighted code block (HTML from `server/highlight.ts`) on ink, with an optional title and copy. -->
<script lang="ts">
	import type { Highlighted } from '#lib/content/snippets.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import CopyButton from './CopyButton.svelte';

	interface Props {
		snippet: Highlighted;
		/** Shown in the title bar, e.g. a file name. Defaults to the language. */
		title?: string;
		copy?: boolean;
		class?: string;
		/** A short, scrollable box for long one-off code (a badge's markup): it still wraps, never sideways. */
		compact?: boolean;
	}

	let { snippet, title, copy = true, class: className, compact = false }: Props = $props();
	const i18n = useI18n();
	const name = $derived(title ?? snippet.lang);
</script>

<figure
	class={[
		'min-w-0 overflow-hidden rounded-2xl border-2 border-ink bg-code shadow-hard',
		compact && 'pb-3',
		className
	]}
>
	<figcaption class="flex h-12 items-center justify-between gap-3 pr-2 pl-4">
		<span class="truncate font-mono text-xs text-on-code">{title ?? snippet.lang}</span>
		{#if copy}<CopyButton text={snippet.code} label={fmt(i18n.m.ui.copyNamed, { title: name })} />{/if}
	</figcaption>
	<!-- Lines wrap (code.css), so nothing scrolls sideways; text-on-code for samples without highlighting. -->
	<!-- A compact box scrolls, so keyboard users must reach it (axe: scrollable-region-focusable). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class={[
			'px-4 pb-4 font-mono text-[13px] leading-relaxed text-on-code [&_pre]:[overflow-wrap:anywhere] [&_pre]:whitespace-pre-wrap',
			compact && 'max-h-[3.25em] overflow-y-auto overscroll-contain pb-0 text-xs'
		]}
		tabindex={compact ? 0 : undefined}
		role="region"
		aria-label={fmt(i18n.m.ui.code, { title: name })}
	>
		<!-- Escaped HTML: shiki at build time, or plain code escaped by the caller (see ScanResult). -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html snippet.html}
	</div>
</figure>
