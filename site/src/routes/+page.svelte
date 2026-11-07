<!--
	The landing, in order of importance: can agents use YOUR site (scan) → others already do (logos) →
	proof it matters (benchmark) → the fix (one line) → what the community asked for → scan again.
-->
<script lang="ts">
	import FinalCta from '#lib/features/cta/FinalCta.svelte';
	import Fix from '#lib/features/fix/Fix.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';
	import Issues from '#lib/features/issues/Issues.svelte';
	import LogoWall from '#lib/features/logos/LogoWall.svelte';
	import Proof from '#lib/features/proof/Proof.svelte';
	import type { PageProps } from './$types';

	let { data: page }: PageProps = $props();
</script>

<svelte:head>
	<title>webmcpx: is your site agent-ready?</title>
	<meta
		name="description"
		content="Scan any site for WebMCP tools. One script tag makes it agent-ready. Reproducible benchmark, open source."
	/>
</svelte:head>

<Hero />
<LogoWall />
<Proof results={page.results} reproduce={page.code.reproduce} />
<Fix scriptTag={page.code.scriptTag} />
<Issues />
<FinalCta />
