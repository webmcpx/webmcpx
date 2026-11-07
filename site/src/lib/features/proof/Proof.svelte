<!--
	The evidence, site by site. A filter picks the site (default: the biggest saving on a live site);
	each shows the question asked there, both arms side by side, and every task it ran. "All sites" is the
	average over every task. The full chart and the method sit behind a disclosure.
-->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import {
		compare,
		headline,
		losses,
		METRICS,
		percent,
		perThousand,
		rows,
		seconds,
		spotlight,
		tokens,
		type ArmSummary,
		type Results
	} from '#lib/features/benchmark/bench.ts';
	import type { BenchSite, SiteTask } from '#lib/features/benchmark/sites.ts';
	import TaskChart from '#lib/features/benchmark/TaskChart.svelte';

	interface Props {
		results: Results;
		sites: BenchSite[];
		reproduce: Highlighted;
	}

	let { results, sites, reproduce }: Props = $props();

	const h = $derived(headline(results));
	const all = $derived(rows(results));
	const choices = $derived<(BenchSite & { label: string })[]>([
		{
			id: 'all',
			label: 'All sites',
			name: 'All sites',
			live: false,
			tasks: sites.flatMap((s) => s.tasks),
			baseline: h?.baseline ?? null,
			webmcp: h?.webmcp ?? null
		},
		...sites.map((s) => ({ ...s, label: s.name }))
	]);
	const best = $derived(spotlight(results));
	// The default is decided from the data, so the prerendered HTML already shows it (no flash).
	const featured = () => sites.find((s) => s.tasks.some((t) => t.task === best?.task))?.id ?? 'all';
	let siteId = $state(featured());
	const repeats = $derived(all[0]?.webmcp?.runs ?? all[0]?.baseline?.runs ?? 0);

	let metricId = $state<string>(METRICS[0].id);
	const metric = $derived(METRICS.find((m) => m.id === metricId) ?? METRICS[0]);
	const worse = $derived(losses(results, metric.id));
	const solved = (s: ArmSummary) => `${Math.round(s.success_rate * s.runs)}/${s.runs}`;
	const siteOf = (t: SiteTask) => sites.find((s) => s.tasks.includes(t))?.name ?? '';
</script>

{#snippet side(arm: ArmSummary, label: string, ours: boolean)}
	{@const ok = arm.success_rate >= 0.5}
	<Card padding="lg" shadow="lg" class="h-full text-center">
		<Stamp tone={ours ? 'marker' : 'plain'}>{label}</Stamp>
		<p class="mt-6 font-display text-display font-bold tabular-nums">{tokens(arm.tokens)}</p>
		<p class="font-mono text-xs tracking-widest text-ink-3 uppercase">tokens per question</p>
		<p class="mt-4 text-ink-2">
			{seconds(arm.duration_ms)} · {arm.steps.toFixed(1)} steps · {perThousand(arm.cost_usd)} per 1k
		</p>
		<Stamp tone={ok ? 'good' : 'bad'} size="lg" class="mt-5">
			{percent(arm.success_rate)} solved · {solved(arm)}
		</Stamp>
	</Card>
{/snippet}

<Section
	id="proof"
	kicker="Benchmark · {results.model}"
	title="Same agent. Same question."
	lead="Pick a site. One agent reads the page like a browser agent; the other calls the site's WebMCP tools."
>
	{#if h}
		<Tabs items={choices} bind:value={siteId} label="Site" listClass="mb-8 flex-wrap gap-y-2">
			{#snippet tab(site)}
				{#if site.live}<span class="size-2 rounded-full bg-good" aria-hidden="true"></span>{/if}
				{site.label}
			{/snippet}
			{#snippet panel(site)}
				<div class="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
					<div class="min-w-0">
						<div class="flex flex-wrap items-center gap-3">
							<h3 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">{site.name}</h3>
							{#if site.id !== 'all'}
								<Stamp tone={site.live ? 'good' : 'plain'} size="sm">
									{site.live ? 'live site' : 'local fixture'}
								</Stamp>
							{/if}
						</div>
						<p class="mt-2 max-w-3xl text-lg text-pretty text-ink-2">
							{#if site.tasks.length === 1}
								“{site.tasks[0].prompt}”
							{:else}
								Average of {site.tasks.length} questions, {repeats} runs each.
							{/if}
						</p>
					</div>
					{#if site.url}
						<a
							href={site.url}
							class="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
						>
							{new URL(site.url).hostname}<ArrowUpRight size={14} aria-hidden="true" />
						</a>
					{/if}
				</div>

				{#if site.baseline && site.webmcp}
					{@const r = compare(site.baseline.tokens, site.webmcp.tokens, 'fewer tokens', 'more tokens')}
					<div class="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr] [&>*]:min-w-0">
						{@render side(site.baseline, 'Without WebMCP', false)}
						<div class="flex justify-center">
							<div
								class={[
									'grid size-32 place-items-center rounded-full border-2 border-ink text-center shadow-hard sm:size-36',
									r.label === 'fewer tokens' ? 'bg-marker' : 'bg-card'
								]}
							>
								<p class="font-display leading-none font-bold">
									<span class="block text-5xl sm:text-6xl">{r.value}</span>
									<span class="font-mono text-[11px] tracking-wider uppercase">{r.label}</span>
								</p>
							</div>
						</div>
						{@render side(site.webmcp, 'With webmcpx', true)}
					</div>
				{/if}

				{#if site.tasks.length > 1}
					<ul
						class="mt-8 divide-y-2 divide-hairline rounded-card border-2 border-ink bg-card"
						aria-label="Questions on {site.name}"
					>
						{#each site.tasks as t (t.task)}
							<li class="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-6">
								<p class="text-sm text-pretty">
									{#if site.id === 'all'}<span class="font-semibold">{siteOf(t)}:</span>{/if}
									“{t.prompt}”
								</p>
								<p class="flex flex-wrap gap-x-4 font-mono text-xs text-ink-2 tabular-nums">
									<span>
										{t.baseline ? tokens(t.baseline.tokens) : '–'} →
										<strong class="text-ink">{t.webmcp ? tokens(t.webmcp.tokens) : '–'}</strong> tokens
									</span>
									<span>
										solved {t.baseline ? percent(t.baseline.success_rate) : '–'} →
										<strong class="text-ink">{t.webmcp ? percent(t.webmcp.success_rate) : '–'}</strong>
									</span>
								</p>
							</li>
						{/each}
					</ul>
				{/if}
			{/snippet}
		</Tabs>

		<details class="group mt-10 rounded-card border-2 border-ink bg-card">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold sm:px-7 [&::-webkit-details-marker]:hidden"
			>
				All {all.length} tasks on one chart, and how we measured
				<ChevronDown class="transition group-open:rotate-180" aria-hidden="true" />
			</summary>
			<div class="border-t-2 border-ink p-5 sm:p-7">
				<Tabs items={METRICS} bind:value={metricId} label="Metric" listClass="mb-6 flex-wrap">
					{#snippet panel()}
						<TaskChart rows={all} {metric} />
						{#if worse.length}
							<p class="mt-5 text-sm text-ink-2">
								<strong class="text-ink">webmcpx loses on {metric.label.toLowerCase()} in:</strong>
								{worse.map((t) => t.replace(/^live-/, '')).join(', ')}. Published as measured.
							</p>
						{/if}
					{/snippet}
				</Tabs>
				<div class="mt-8 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
					<ul class="list-disc space-y-2 pl-5 text-sm text-ink-2">
						<li>
							{results.model}{#if results.reasoning_effort}, reasoning {results.reasoning_effort}{/if},
							headless Chrome. Same prompt and step limit in both arms; {repeats} runs per task and arm.
						</li>
						<li>Without WebMCP: a DOM-snapshot agent that reads, clicks and fills.</li>
						<li>With webmcpx: only the tools the page registers.</li>
						<li>Graded by facts in the answer and page state. No LLM judge.</li>
						<li>Live sites ship their own WebMCP tools; local fixtures use webmcpx.</li>
					</ul>
					<CodeBlock snippet={reproduce} title="reproduce it" />
				</div>
			</div>
		</details>
	{:else}
		<Card padding="lg" shadow="none" class="border-dashed">
			<p class="font-display font-bold">No run published yet.</p>
			<p class="mt-1 text-sm text-ink-2">Run <code class="font-mono">just bench</code> and this fills in.</p>
		</Card>
	{/if}
</Section>
