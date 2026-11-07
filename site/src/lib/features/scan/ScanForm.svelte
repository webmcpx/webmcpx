<!-- The main call to action: paste a site, see what agents get. Runs `?scan=<url>` links on load. -->
<script lang="ts">
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import { onMount, type Snippet } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import { scanner } from './scanner.svelte.ts';

	interface Props {
		/** Reads `?scan=` from the address bar and starts that scan (only one form should). */
		fromQuery?: boolean;
		size?: 'md' | 'lg';
		/** A line under the input (e.g. suggestions), centered on the input itself, not on input + button. */
		hint?: Snippet;
		/** Focus the input on load, so visitors can type their site right away (the hero form). */
		focusOnLoad?: boolean;
		/** Scroll to the result (#scan) after submitting: for forms far from it, like the closing one. */
		reveal?: boolean;
	}

	let { fromQuery = false, size = 'lg', hint, focusOnLoad = false, reveal = false }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.scan);
	const uid = $props.id();
	let input: HTMLInputElement | undefined = $state();

	onMount(() => {
		const shared = fromQuery ? new URLSearchParams(location.search).get('scan') : null;
		if (shared) scanner.run(shared);
		// Only at the top of the page, when nothing else has focus, and with a mouse or trackpad: on touch
		// screens, focusing would pop the keyboard over the page before the visitor asked for it.
		const atTop = !location.hash && scrollY < 100;
		const idle = document.activeElement === document.body || document.activeElement === null;
		if (focusOnLoad && !shared && atTop && idle && matchMedia('(pointer: fine)').matches) {
			input?.focus({ preventScroll: true });
		}
	});

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		scanner.run();
		if (reveal) {
			const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
			document.getElementById('scan')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
		}
	}
</script>

<!--
	Progressive: before (or without) hydration the form is a plain GET to /?scan=<url>, which the hero form
	runs on load, so a scan typed early is never lost. Once hydrated, onsubmit runs it in place.
-->
<form
	{onsubmit}
	method="get"
	action="{i18n.href('/')}#scan"
	role="search"
	aria-label={m.form}
	class="mx-auto grid w-full max-w-2xl gap-3 sm:grid-cols-[1fr_auto]"
>
	<label for="{uid}-url" class="sr-only">{m.address}</label>
	<input
		bind:this={input}
		id="{uid}-url"
		name="scan"
		bind:value={scanner.input}
		type="text"
		inputmode="url"
		autocomplete="url"
		spellcheck="false"
		placeholder={m.placeholder}
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
		<ScanSearch aria-hidden="true" />{scanner.status === 'loading' ? m.scanning : m.submit}
	</Button>
	{#if hint}
		<!-- Grid column 1 only: under the input, so it centers on the input, not on input + button. -->
		<div class="mt-1 text-center sm:col-start-1">{@render hint()}</div>
	{/if}
</form>
