<!--
	For people who run a site (where a scan's "Fix it" lands): one line on the site, as tabs (coding agent,
	script tag, npm; the first one opens). The agent side has its own section (features/agents).
-->
<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import { siHtml5, siNpm } from 'simple-icons';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted, SnippetId } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';

	let { code }: { code: Record<SnippetId, Highlighted> } = $props();

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
<Section id="for-sites" title={m.title} lead={m.lead} center>
	<Reveal class="mx-auto max-w-3xl text-left">
		<CodeTabs label={m.title} tabs={install} />
	</Reveal>
	<p class="mt-8 text-center font-mono text-xs tracking-wider text-ink-3 uppercase">{m.facts}</p>
</Section>
