<!-- The main call to action: paste a site, see what agents get. Runs `?scan=<url>` links on load. -->
<script lang="ts">
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import { onMount } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { scanner } from './scanner.svelte.ts';

	interface Props {
		/** Reads `?scan=` from the address bar and starts that scan (only one form should). */
		fromQuery?: boolean;
		size?: 'md' | 'lg';
	}

	let { fromQuery = false, size = 'lg' }: Props = $props();
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

<form
	{onsubmit}
	role="search"
	aria-label="Scan a site"
	class="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
>
	<label for="{uid}-url" class="sr-only">Your site's address</label>
	<input
		id="{uid}-url"
		bind:value={scanner.input}
		type="text"
		inputmode="url"
		autocomplete="url"
		spellcheck="false"
		placeholder="yoursite.com"
		class={[
			'min-w-0 rounded-full border-2 border-ink bg-card px-6 font-display font-bold text-ink shadow-hard sm:flex-1',
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
</form>
