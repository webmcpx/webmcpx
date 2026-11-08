<!--
	For people who run a site (where a scan's "Fix it" lands), in two parts under one title: 1. the standard
	tools, one line (coding agent, script tag, npm); 2. the site's own actions (Own). The agent side has its own
	section (features/agents).
-->
<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import { siHtml5, siNpm } from 'simple-icons';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted, OwnId, SnippetId } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import Own from '#lib/features/own/Own.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';

	let { code, own }: { code: Record<SnippetId, Highlighted>; own: Record<OwnId, Highlighted> } = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.fix);
	const capital = (s: string) => s.charAt(0).toLocaleUpperCase(i18n.code) + s.slice(1);

	// Your coding agent always comes first; then the paths by how many sites use them.
	const install: CodeTab[] = $derived([
		{
			id: 'agent',
			label: capital(m.alternatives.agent),
			icon: Bot,
			snippet: code.agentPrompt,
			title: 'prompt'
		},
		{
			id: 'html',
			label: 'HTML',
			icon: siHtml5,
			snippet: code.scriptTag,
			title: 'index.html',
			note: fmt(m.html, { tag: '</body>' })
		},
		{ id: 'npm', label: 'npm', icon: siNpm, snippet: code.npmUsage, title: 'app.js' }
	]);
</script>

<!-- The old anchor: published CLIs (npx webmcpx tools, 0.2.5 and before) still print webmcpx.dev/#fix. -->
<div id="fix" class="scroll-mt-20" aria-hidden="true"></div>
<Section id="for-sites" title={m.title} lead={m.lead}>
	<Reveal class="max-w-3xl">
		<h3 class="flex items-baseline gap-3 font-display text-2xl font-bold">
			<span class="font-mono text-base text-ink-3" aria-hidden="true">1</span>{m.standard.title}
		</h3>
		<p class="mt-2 mb-5 text-pretty text-ink-2">{m.standard.lead}</p>
		<CodeTabs label={m.standard.title} tabs={install} />
		<p class="mt-4 font-mono text-xs tracking-wider text-ink-3 uppercase">{m.facts}</p>
	</Reveal>
	<Own samples={own} />
</Section>
