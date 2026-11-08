<!--
	For people who use agents (no site, no scan needed): the saving as one big number from the published
	runs (with the range and the losses under it), the tools it works with, then the one prompt that sets it
	up (owner's decision 2026-11-08: no list of options; the agent reads llms.txt and picks its own way).
-->
<script lang="ts">
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import {
		ARC,
		BRAVE,
		CHROME,
		CLAUDE,
		CLINE,
		COPILOT,
		CURSOR,
		CYPRESS,
		FIREFOX,
		GEMINI,
		JETBRAINS,
		OPENAI,
		OPERA,
		PLAYWRIGHT,
		PUPPETEER,
		SAFARI,
		SELENIUM,
		VIVALDI,
		WEBDRIVERIO,
		WINDSURF,
		ZED,
		type Logo
	} from '#lib/content/logos.ts';
	import type { Highlighted, SnippetId } from '#lib/content/snippets.ts';
	import { ratio, savingIsRange, span, type TokenSaving } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		code: Record<SnippetId, Highlighted>;
		/** Each model's whole-run token saving (null: no run published, and the number is left out). */
		saving: TokenSaving | null;
		/** The leaderboard's best case (one question, on one site and model): the big number. */
		best: { saving: number; site: string; model: string } | null;
	}

	let { code, saving, best }: Props = $props();

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

	// Where the claim holds: MCP clients that run stdio servers (the bridge), then browsers (the polyfill, on
	// HTTPS) and automation tools (document.modelContext in the page). Each is a public, documented fact.
	const CLIENTS: { name: string; logo: Logo }[] = [
		{ name: 'Claude Code', logo: CLAUDE },
		{ name: 'Codex', logo: OPENAI },
		{ name: 'Cursor', logo: CURSOR },
		{ name: 'GitHub Copilot', logo: COPILOT },
		{ name: 'Windsurf', logo: WINDSURF },
		{ name: 'Gemini CLI', logo: GEMINI },
		{ name: 'Zed', logo: ZED },
		{ name: 'JetBrains', logo: JETBRAINS },
		{ name: 'Cline', logo: CLINE }
	];
	const BROWSERS: { name: string; logo: Logo }[] = [
		{ name: 'Chrome', logo: CHROME },
		{ name: 'Firefox', logo: FIREFOX },
		{ name: 'Safari', logo: SAFARI },
		{ name: 'Brave', logo: BRAVE },
		{ name: 'Arc', logo: ARC },
		{ name: 'Opera', logo: OPERA },
		{ name: 'Vivaldi', logo: VIVALDI },
		{ name: 'Playwright', logo: PLAYWRIGHT },
		{ name: 'Selenium', logo: SELENIUM },
		{ name: 'Puppeteer', logo: PUPPETEER },
		{ name: 'Cypress', logo: CYPRESS },
		{ name: 'WebdriverIO', logo: WEBDRIVERIO }
	];
</script>

<Section id="for-agents" title={m.title} lead={m.lead}>
	<!-- The case on the left (the number, what it works with), the setup on the right; stacked on small screens. -->
	<div class="grid gap-x-12 gap-y-10 lg:grid-cols-12">
		<div class="lg:col-span-5">
			{#if saving}
				<Reveal class="mb-10">
					<a href="#leaderboard" class="inline-block font-display font-bold text-ink">
						<span class="align-middle text-2xl sm:text-3xl">{m.hype.up}</span>
						<span
							class="sweep px-1 text-7xl leading-none tracking-tight sm:text-8xl"
							style="background: linear-gradient(transparent 62%, var(--color-marker) 62%)"
							>{ratio(best?.saving ?? saving.high)}</span
						>
						<span class="align-middle text-2xl whitespace-nowrap sm:text-3xl">{m.hype.fewer}</span>
					</a>
					{#if best}<p class="mt-3 font-mono text-xs tracking-wider text-ink-3 uppercase">
							{fmt(m.hype.bestCase, { site: best.site, model: best.model })}
						</p>{/if}
					<p class="mt-4 text-pretty text-ink-2">
						<span class="font-medium text-ink">{m.hype.same}</span>
						<a
							href="#leaderboard"
							class="underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
							>{range}</a
						>
					</p>
					{#if losses}<p class="mt-1 text-sm text-pretty text-ink-3">{losses}</p>{/if}
				</Reveal>
			{/if}
		</div>
		<Reveal class="min-w-0 lg:col-span-7">
			<!-- What it works with, right above how to set it up. -->
			<div class="mb-8">
				<p class="font-mono text-xs tracking-wider text-ink-3 uppercase">{m.worksWith}</p>
				{#each [CLIENTS, BROWSERS] as group, g (g)}
					<ul
						class={[
							'flex flex-wrap gap-x-5 gap-y-3 text-sm text-ink-2',
							g === 0 ? 'mt-3' : 'mt-4 border-t-2 border-hairline pt-4'
						]}
					>
						{#each group as w (w.name)}
							<li class="inline-flex items-center gap-1.5"><SiteLogo logo={w.logo} size={16} />{w.name}</li>
						{/each}
					</ul>
				{/each}
			</div>
			<CodeBlock snippet={code.mcpPrompt} title={i18n.m.ui.prompt} />
			<p class="mt-3 text-left text-sm text-pretty text-ink-2">{m.note}</p>
		</Reveal>
	</div>
</Section>
