<!--
	The landing, in order of importance: can agents use YOUR site (scan) → others already do (logos) → why it matters →
	proof it matters (benchmark) → how it relates to MCP → the fix (one line) → what the community asked for .
-->
<script lang="ts">
	import Fix from '#lib/features/fix/Fix.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';
	import Issues from '#lib/features/issues/Issues.svelte';
	import LogoWall from '#lib/features/logos/LogoWall.svelte';
	import Versus from '#lib/features/versus/Versus.svelte';
	import Why from '#lib/features/why/Why.svelte';
	import Proof from '#lib/features/proof/Proof.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import type { PageProps } from './$types';

	let { data: page }: PageProps = $props();
	const i18n = useI18n();
</script>

<svelte:head>
	<title>{i18n.m.meta.home.title}</title>
	<meta name="description" content={i18n.m.meta.home.description} />
</svelte:head>

<Hero scriptTag={page.code.scriptTag} />
<LogoWall />
{#if page.best}<Why bestSaving={page.best.saving} bestSite={page.best.site} />{/if}
<Proof runs={page.runs} reproduce={page.code.reproduce} />
<Versus />
<Fix scriptTag={page.code.scriptTag} />
<Issues />
