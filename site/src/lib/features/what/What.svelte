<!--
	What WebMCP is, before why it matters: the definition in the draft's words, three steps (register, list,
	call) on the left, the smallest real tool on the right, then what webmcpx takes off your plate and the
	two ways in. Words follow the draft (2026-11-02).
-->
<script lang="ts">
	import AppWindow from '@lucide/svelte/icons/app-window';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Bot from '@lucide/svelte/icons/bot';
	import Check from '@lucide/svelte/icons/check';
	import Logo from '#lib/components/layout/Logo.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import { ratio } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		snippet: Highlighted;
		/** The leaderboard's best case (the proof row quotes it, named as one); null: none published. */
		best: { saving: number; site: string; model: string } | null;
	}
	let { snippet, best }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.what);
	const STEPS = ['register', 'list', 'call'] as const;
	// Every claim in the lead, sourced (checked 2026-11-08): why agents need it (fail, cost, time), who
	// drafts it and where, who tests it.
	// Labels in the dictionary (`what.sources`), in this order.
	const SOURCES = [
		{ id: 'mind2web', href: 'https://arxiv.org/abs/2504.01382' },
		{
			id: 'snapshot',
			href: 'https://dev.to/nitai_aharoni_1006318cb51/what-a-browser-mcp-snapshot-actually-costs-i-measured-it-46if'
		},
		{ id: 'windtunnel', href: 'https://webmcp.com/benchmark' },
		{ id: 'draft', href: 'https://webmachinelearning.github.io/webmcp/' },
		{
			id: 'status',
			href: 'https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md'
		},
		{ id: 'chromeTrial', href: 'https://developer.chrome.com/blog/ai-webmcp-origin-trial' },
		{ id: 'chromeStatus', href: 'https://chromestatus.com/feature/5117755740913664' },
		{
			id: 'edgeTrial',
			href: 'https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/0b76fe60-b266-458e-a285-04e375c0c31a'
		},
		{
			id: 'edgeExplainer',
			href: 'https://microsoftedge.github.io/MSEdgeExplainers/WebModelContext/explainer.html'
		},
		{ id: 'method', href: 'https://github.com/webmcpx/webmcpx/blob/main/bench/METHODOLOGY.md' }
	] as const satisfies { id: keyof typeof m.sources; href: string }[];
	const withWebmcpx = (id: (typeof ROWS)[number]) => {
		if (id !== 'proof') return m.webmcpx.items[id].webmcpx;
		const p = m.webmcpx.items.proof;
		return best
			? fmt(p.webmcpx, { best: ratio(best.saving), site: best.site, model: best.model })
			: p.webmcpxPlain;
	};
	const ROWS = [
		'support',
		'tools',
		'actions',
		'agents',
		'draft',
		'correct',
		'safe',
		'testing',
		'proof',
		'cost'
	] as const;
</script>

<Section id="what" kicker={m.kicker} title={m.title} lead={m.lead}>
	<!-- The lead's claims, each with its source. -->
	<p class="-mt-4 mb-10 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs text-ink-3">
		<span class="tracking-widest uppercase">{i18n.m.sources.title}</span>
		{#each SOURCES as s, i (s.href)}
			{#if i > 0}<span aria-hidden="true">·</span>{/if}
			<a
				href={s.href}
				class="inline-block py-1 text-ink-2 underline decoration-ink/30 underline-offset-2 hover:text-ink hover:decoration-ink"
				>{m.sources[s.id]}</a
			>
		{/each}
	</p>
	<div class="grid gap-x-12 gap-y-10 lg:grid-cols-12">
		<ol class="space-y-6 lg:col-span-5">
			{#each STEPS as id, i (id)}
				<li class="flex gap-4">
					<span
						class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-marker font-mono text-sm font-bold"
						aria-hidden="true">{i + 1}</span
					>
					<Reveal delay={i * 80}>
						<p class="font-display text-xl leading-tight font-bold">{m.steps[id].title}</p>
						<p class="mt-1 text-pretty text-ink-2">{m.steps[id].text}</p>
					</Reveal>
				</li>
			{/each}
		</ol>
		<Reveal class="min-w-0 lg:col-span-7">
			<CodeBlock {snippet} title="page.js" />
		</Reveal>
	</div>
	<!-- From the hand-written tool to webmcpx: what it takes off your plate, then the two ways in. -->
	<Reveal class="mt-14 rounded-card border-2 border-ink bg-card p-6 shadow-hard sm:p-8">
		<Logo class="text-3xl sm:text-4xl" />
		<p class="mt-3 text-pretty text-ink-2">{m.webmcpx.about}</p>
		<h3 class="mt-6 font-display text-2xl font-bold text-balance sm:text-3xl">{m.webmcpx.title}</h3>
		<p class="mt-2 text-pretty text-ink-2">{m.webmcpx.lead}</p>
		<!-- The side-by-side: one row per objection, by hand vs with webmcpx (stacked on small screens). -->
		<table class="mt-8 w-full border-collapse text-left text-sm">
			<caption class="sr-only">{m.webmcpx.compare.caption}</caption>
			<thead class="hidden md:table-header-group">
				<tr class="border-b-2 border-ink">
					<th scope="col" class="w-1/5 py-3 pr-4"><span class="sr-only">{m.webmcpx.compare.caption}</span></th
					>
					<th scope="col" class="w-2/5 py-3 pr-6 font-mono text-xs tracking-wider text-ink-2 uppercase">
						{m.webmcpx.compare.hand}
					</th>
					<th scope="col" class="w-2/5 py-3 font-mono text-xs tracking-wider uppercase">
						<span class="marker">{m.webmcpx.compare.webmcpx}</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{#each ROWS as id (id)}
					<tr class="block border-b border-hairline py-4 md:table-row md:py-0">
						<th scope="row" class="block pb-2 align-top font-bold md:table-cell md:py-4 md:pr-4">
							{m.webmcpx.items[id].label}
						</th>
						<td class="block pb-2 align-top text-pretty text-ink-2 md:table-cell md:py-4 md:pr-6">
							<span class="mr-1 font-mono text-[11px] tracking-wider uppercase md:hidden"
								>{m.webmcpx.compare.hand}:</span
							>{m.webmcpx.items[id].hand}
						</td>
						<td class="block align-top md:table-cell md:py-4">
							<span class="flex gap-2.5">
								<span
									class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink bg-marker"
									aria-hidden="true"><Check size={12} strokeWidth={3} /></span
								>
								<span class="text-pretty">
									<span class="sr-only md:hidden">{m.webmcpx.compare.webmcpx}: </span>{withWebmcpx(id)}
								</span>
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="mt-8 flex flex-wrap gap-3">
			<Button href="#for-sites" class="bg-marker text-ink"
				><AppWindow aria-hidden="true" />{m.webmcpx.sites}<ArrowRight aria-hidden="true" /></Button
			>
			<Button href="#for-agents" variant="outline"
				><Bot aria-hidden="true" />{m.webmcpx.agents}<ArrowRight aria-hidden="true" /></Button
			>
		</div>
	</Reveal>
</Section>
