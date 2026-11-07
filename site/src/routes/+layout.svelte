<script lang="ts">
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import '../app.css';
	import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Header from '#lib/components/layout/Header.svelte';
	import { theme } from '#lib/theme.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		theme.sync();
		// Tells base.css the app is live, which turns off the reveal fallback.
		document.documentElement.dataset.hydrated = '';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a
	href="#main"
	class="sr-only z-50 rounded-lg bg-accent px-4 py-2 font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	Skip to content
</a>
<Header />
<main id="main">
	{@render children()}
</main>
<Footer />
