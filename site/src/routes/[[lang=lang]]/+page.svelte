<!--
	The landing, in order of importance: can agents use YOUR site (scan) → others already do (logos) → why it
	matters → proof it matters (benchmark) → then one section per audience: people who run a site (one line,
	then their own tools), and people who use agents (one prompt) → how it relates to MCP → what the community
	asked for.
-->
<script lang="ts">
	import Meta from '#lib/components/layout/Meta.svelte';
	import Divider from '#lib/components/ui/Divider.svelte';
	import Agents from '#lib/features/agents/Agents.svelte';
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

<Meta title={i18n.m.meta.home.title} description={i18n.m.meta.home.description} />

<Hero />
<LogoWall />
{#if page.best}
	<Divider />
	<Why bestSaving={page.best.saving} bestSite={page.best.site} />
{/if}
<Divider />
<Proof runs={page.runs} reproduce={page.code.reproduce} />
<Divider />
<Fix code={page.code} own={page.own} />
<Divider />
<Agents code={page.code} saving={page.saving} />
<Divider />
<Versus />
<Divider />
<Issues />
