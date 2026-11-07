<!-- The main call to action: paste a site, see what agents get. Runs `?scan=<url>` links on load. -->
<script lang="ts">
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import { onMount, type Snippet } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { HOME } from '#lib/content/site.ts';
	import { scanner } from './scanner.svelte.ts';

	interface Props {
		/** Reads `?scan=` from the address bar and starts that scan (only one form should). */
		fromQuery?: boolean;
		size?: 'md' | 'lg';
		/** A line under the input (e.g. suggestions), centered on the input itself, not on input + button. */
		hint?: Snippet;
	}

	let { fromQuery = false, size = 'lg', hint }: Props = $props();
	const uid = $props.id();

	onMount(() => {
		const shared = fromQuery ? new URLSearchParams(location.search).get('scan') : null;
		if (shared) scanner.run(shared);
	});

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		scanner.run();
	}
</script>

<!--
	Progressive: before (or without) hydration the form is a plain GET to /?scan=<url>, which the hero form
	runs on load, so a scan typed early is never lost. Once hydrated, onsubmit runs it in place.
-->
<form
	{onsubmit}
	method="get"
	action="{HOME}#scan"
	role="search"
	aria-label="Scan a site"
	class="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-[1fr_auto]"
>
	<label for="{uid}-url" class="sr-only">Your site's address</label>
	<input
		id="{uid}-url"
		name="scan"
		bind:value={scanner.input}
		type="text"
		inputmode="url"
		autocomplete="url"
		spellcheck="false"
		placeholder="yoursite.com"
		class={[
			'min-w-0 rounded-full border-2 border-ink bg-card px-6 font-display font-bold text-ink shadow-hard',
			'placeholder:text-ink-3 focus:outline-none focus-visible:shadow-hard-lg',
			size === 'lg' ? 'h-14 text-lg sm:h-16 sm:text-xl' : 'h-12 text-base'
		]}
	/>
	<Button
		type="submit"
		size={size === 'lg' ? 'lg' : 'md'}
		disabled={scanner.status === 'loading'}
		class={size === 'lg' ? 'sm:h-16' : ''}
	>
		<ScanSearch aria-hidden="true" />{scanner.status === 'loading' ? 'Scanning…' : 'Scan it'}
	</Button>
	{#if hint}
		<!-- Grid column 1 only: under the input, so it centers on the input, not on input + button. -->
		<div class="mt-1 text-center sm:col-start-1">{@render hint()}</div>
	{/if}
</form>
