<!--
	The landing, in order of importance: can agents use YOUR site (scan) → others already do (logos) → why it matters →
	proof it matters (benchmark) → the fix (one line) → what the community asked for .
-->
<script lang="ts">
	import Fix from '#lib/features/fix/Fix.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';
	import Issues from '#lib/features/issues/Issues.svelte';
	import LogoWall from '#lib/features/logos/LogoWall.svelte';
	import Why from '#lib/features/why/Why.svelte';
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

<Hero scriptTag={page.code.scriptTag} />
<LogoWall />
{#if page.best}<Why bestSaving={page.best.saving} bestSite={page.best.site} />{/if}
<Proof runs={page.runs} reproduce={page.code.reproduce} />
<Fix scriptTag={page.code.scriptTag} />
<Issues />
