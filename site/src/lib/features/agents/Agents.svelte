<!--
	For people who use agents (no site, no scan needed): the saving as one big number from the published
	runs (with the range and the losses under it), the tools it works with, then one tab per way to set it
	up: the prompt first, then the command for each client, then the in-page call for agents that drive
	a browser themselves.
-->
<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import Code from '@lucide/svelte/icons/code';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import {
		CHROME,
		CLAUDE,
		CURSOR,
		FIREFOX,
		OPENAI,
		PLAYWRIGHT,
		PUPPETEER,
		SAFARI,
		SELENIUM,
		type Logo
	} from '#lib/content/logos.ts';
	import type { Highlighted, SnippetId } from '#lib/content/snippets.ts';
	import { ratio, savingIsRange, span, type TokenSaving } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { siClaude, siCursor } from 'simple-icons';

	interface Props {
		code: Record<SnippetId, Highlighted>;
		/** Each model's whole-run token saving (null: no run published, and the number is left out). */
		saving: TokenSaving | null;
	}

	let { code, saving }: Props = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.agents);

	// The range across models, under the big number (the big number is the best of them).
	const range = $derived(
		saving
			? savingIsRange(saving)
				? i18n.plural(saving.models, m.saving.range, { low: ratio(saving.low), high: ratio(saving.high) })
				: fmt(m.saving.best, { high: ratio(saving.high) })
			: null
	);
	// The questions where WebMCP used more tokens: said next to the saving, never hidden.
	const losses = $derived(
		saving && saving.worse[1] > 0
			? i18n.plural(saving.questions, m.saving.losses, { worse: span(saving.worse), total: saving.questions })
			: null
	);

	const WORKS: { name: string; logo: Logo }[] = [
		{ name: 'Claude Code', logo: CLAUDE },
		{ name: 'Codex', logo: OPENAI },
		{ name: 'Cursor', logo: CURSOR },
		{ name: 'Chrome', logo: CHROME },
		{ name: 'Firefox', logo: FIREFOX },
		{ name: 'Safari', logo: SAFARI },
		{ name: 'Playwright', logo: PLAYWRIGHT },
		{ name: 'Selenium', logo: SELENIUM },
		{ name: 'Puppeteer', logo: PUPPETEER }
	];

	const agentLabel = $derived(i18n.m.fix.alternatives.agent);
	// The prompt first (the agent sets itself up), then each client's one command, then scripts.
	const tabs: CodeTab[] = $derived([
		{
			id: 'prompt',
			label: agentLabel,
			icon: Bot,
			snippet: code.mcpPrompt,
			title: 'prompt',
			note: m.notes.prompt
		},
		{
			id: 'claude',
			label: 'Claude Code',
			icon: siClaude,
			snippet: code.mcpClaude,
			title: 'terminal',
			note: m.notes.cli
		},
		{ id: 'codex', label: 'Codex', icon: Code, snippet: code.mcpCodex, title: 'terminal', note: m.notes.cli },
		{
			id: 'cursor',
			label: 'Cursor',
			icon: siCursor,
			snippet: code.mcpCursor,
			title: '.cursor/mcp.json',
			note: m.notes.cursor
		},
		{
			id: 'scripts',
			label: m.tabs.scripts,
			icon: Code,
			snippet: code.pageScript,
			title: 'script.js',
			note: m.notes.scripts
		}
	]);
</script>

<Section id="for-agents" title={m.title} lead={m.lead} center>
	{#if saving}
		<Reveal class="-mt-2 mb-10 text-center">
			<a href="#leaderboard" class="inline-block font-display font-bold text-ink">
				<span class="align-middle text-2xl sm:text-3xl">{m.hype.up}</span>
				<span
					class="px-1 text-7xl leading-none tracking-tight sm:text-8xl"
					style="background: linear-gradient(transparent 62%, var(--color-marker) 62%)"
					>{ratio(saving.high)}</span
				>
				<span class="align-middle text-2xl sm:text-3xl">{m.hype.fewer}</span>
			</a>
			<p class="mx-auto mt-4 max-w-xl text-pretty text-ink-2">
				<span class="font-medium text-ink">{m.hype.same}</span>
				<a
					href="#leaderboard"
					class="underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink">{range}</a
				>
			</p>
			{#if losses}<p class="mx-auto mt-1 max-w-xl text-sm text-pretty text-ink-3">{losses}</p>{/if}
		</Reveal>
	{/if}
	<Reveal class="mx-auto mb-8 max-w-3xl">
		<p class="text-center font-mono text-xs tracking-wider text-ink-3 uppercase">{m.worksWith}</p>
		<ul class="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm text-ink-2">
			{#each WORKS as w (w.name)}
				<li class="inline-flex items-center gap-1.5"><SiteLogo logo={w.logo} size={16} />{w.name}</li>
			{/each}
		</ul>
	</Reveal>
	<Reveal class="mx-auto max-w-3xl text-left">
		<CodeTabs label={m.title} {tabs} />
	</Reveal>
</Section>
