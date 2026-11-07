<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque';
	import '@fontsource-variable/geist';
	import '@fontsource-variable/geist-mono';
	import '../app.css';
	import displayLatin from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?url';
	import textLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { provideI18n } from '#lib/i18n/index.svelte.ts';
	import { LOCALES, locale, localized, unlocalized } from '#lib/i18n/locales.ts';
	import { LOADER_URL } from '#lib/content/snippets.ts';
	import { ORIGIN } from '#lib/content/site.ts';
	import LanguageSuggestion from '#lib/components/layout/LanguageSuggestion.svelte';
	import favicon from '#lib/assets/favicon.svg';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Header from '#lib/components/layout/Header.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const i18n = provideI18n(() => ({ code: data.code, m: data.m }));
	/** This page in every language, for hreflang (the English path is the shared key). */
	const english = $derived(unlocalized(page.url.pathname));

	onMount(() => {
		// Tells base.css the app is live, which turns off the reveal fallback.
		document.documentElement.dataset.hydrated = '';
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="preload" href={displayLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={textLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	{#each LOCALES as l (l.code)}
		<link rel="alternate" hreflang={l.tag} href="{ORIGIN}{localized(english, l.code)}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{ORIGIN}{english}" />
	<link rel="canonical" href="{ORIGIN}{page.url.pathname}" />
	<!-- The same content as Markdown, for agents (llms.txt lists it too). -->
	<link rel="alternate" type="text/markdown" href="{ORIGIN}{page.data.markdown ?? '/index.md'}" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="webmcpx" />
	<meta property="og:url" content="{ORIGIN}{page.url.pathname}" />
	<meta property="og:locale" content={locale(i18n.code).tag.replace('-', '_')} />
	<meta property="og:image" content="{ORIGIN}{page.data.og ?? '/og.png'}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="{ORIGIN}{page.data.og ?? '/og.png'}" />
	<!-- We run what we ship: the site registers the standard WebMCP tools with the loader everyone pastes. -->
	<script type="module" src={LOADER_URL}></script>
</svelte:head>

<a
	href="#main"
	class="sr-only z-50 rounded-full border-2 border-ink bg-marker px-4 py-2 font-display font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
>
	{i18n.m.layout.skip}
</a>
<LanguageSuggestion />
<Header />
<main id="main">
	{@render children()}
</main>
<Footer />
