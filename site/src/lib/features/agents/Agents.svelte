<!--
	For people who use agents (no site, no scan needed): the saving on the leaderboard, computed from the
	published runs, then one prompt the agent runs on itself, then the two ways it can take (an MCP
	client, or document.modelContext from any browser automation) as the small print.
-->
<script lang="ts">
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import { ratio, savingIsRange, type TokenSaving } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		prompt: Highlighted;
		/** Each model's whole-run token saving (null: no run published, and the line is left out). */
		saving: TokenSaving | null;
	}

	let { prompt, saving }: Props = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.agents);

	const proof = $derived.by(() => {
		if (!saving) return null;
		const [low, high] = [ratio(saving.low), ratio(saving.high)];
		return savingIsRange(saving)
			? i18n.plural(saving.models, m.saving.range, { low, high })
			: fmt(m.saving.best, { high });
	});

	const ways = $derived([
		{ way: m.ways.mcp, inline: 'npx -y webmcpx mcp' },
		{ way: m.ways.browser, inline: 'document.modelContext' }
	]);
</script>

<!-- Code inside a sentence: breaks inside a word only when it cannot fit a line (code always wraps). -->
{#snippet inlineCode(text: string)}<code class="font-mono text-xs wrap-break-word text-ink">{text}</code
	>{/snippet}

<Section id="for-agents" title={m.title} lead={m.lead} center>
	{#if proof}
		<Reveal class="-mt-4 mb-8 text-center sm:-mt-6">
			<a
				href="#leaderboard"
				class="inline-flex items-center gap-2 rounded-2xl bg-marker px-4 py-1.5 font-display font-bold text-pretty text-ink underline-offset-4 hover:underline"
			>
				<ChartColumn size={18} strokeWidth={2.25} class="shrink-0" aria-hidden="true" />{proof}
			</a>
		</Reveal>
	{/if}
	<Reveal class="mx-auto max-w-3xl rounded-card border-2 border-ink bg-card p-5 text-left shadow-hard sm:p-6">
		<p class="mb-4 text-sm text-pretty text-ink-2">{m.prompt}</p>
		<CodeBlock snippet={prompt} title="prompt" />
		<dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
			{#each ways as { way, inline } (inline)}
				<div class="rounded-xl bg-paper px-3.5 py-2.5">
					<dt class="font-display font-bold">{way.label}</dt>
					<dd class="mt-1 text-pretty text-ink-2">
						<Rich text={way.text}>
							{#snippet cmd()}{@render inlineCode(inline)}{/snippet}
							{#snippet api()}{@render inlineCode(inline)}{/snippet}
						</Rich>
					</dd>
				</div>
			{/each}
		</dl>
	</Reveal>
</Section>
