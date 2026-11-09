<!--
	The landing, in order of importance: can agents use YOUR site (scan) → others already do (logos) → what WebMCP is and why it matters (sourced) → proof it matters (benchmark) → then one section per audience: people who run a site (one line,
	then their own tools), and people who use agents (one prompt) → how it relates to MCP → what the community
	asked for.
-->
<script lang="ts">
	import Meta from '#lib/components/layout/Meta.svelte';
	import Divider from '#lib/components/ui/Divider.svelte';
	import Agents from '#lib/features/agents/Agents.svelte';
	import Faq from '#lib/features/faq/Faq.svelte';
	import { homeJsonLd, jsonForScript } from '#lib/features/faq/jsonld.ts';
	import Fix from '#lib/features/fix/Fix.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';
	import Issues from '#lib/features/issues/Issues.svelte';
	import LogoWall from '#lib/features/logos/LogoWall.svelte';
	import Versus from '#lib/features/versus/Versus.svelte';
	import What from '#lib/features/what/What.svelte';
	import Proof from '#lib/features/proof/Proof.svelte';
	import { locale } from '#lib/i18n/locales.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import type { PageProps } from './$types';

	let { data: page }: PageProps = $props();
	const i18n = useI18n();
	const home = $derived(i18n.m.meta.home);
	const description = $derived(home.description);
	const ld = $derived(jsonForScript(homeJsonLd(i18n.m.faq, description, locale(i18n.code).tag)));
	// Built here: a closing script tag can't be written literally inside this script block.
	const ldTag = $derived(`<script type="application/ld+json">${ld}<${'/'}script>`);
</script>

<Meta title={home.title} {description} />
<svelte:head>
	<!-- Our own JSON, with < escaped (jsonForScript). -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html ldTag}
</svelte:head>

<Hero best={page.best} />
<LogoWall />
<Divider />
<What snippet={page.code.registerTool} best={page.best} />
<Divider />
<Proof runs={page.runs} reproduce={page.reproduce} compact />
<Divider />
<Agents code={page.code} saving={page.saving} best={page.best} />
<Divider />
<Fix code={page.code} own={page.own} />
<Divider />
<Versus />
<Divider />
<Issues />
<Divider />
<Faq />
