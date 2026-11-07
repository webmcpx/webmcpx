<!--
	The evidence, one site at a time and one question at a time: no averages. Logos pick the site
	(default: the biggest saving on a live site); sites with several questions let you pick the question.
	Every number is also in the full table behind the disclosure, which works without JavaScript.
-->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import {
		compare,
		losses,
		METRICS,
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

	const all = $derived(rows(results));
	const best = $derived(spotlight(results));
	// Decided from the data, so the prerendered HTML already shows it (no flash on hydration).
	const featured = () => sites.find((s) => s.tasks.some((t) => t.task === best?.task))?.id ?? sites[0]?.id;
	// The featured site first, then the others in their order (live before local).
	const items = $derived(
		[...sites]
			.sort((a, b) => Number(b.id === featured()) - Number(a.id === featured()))
			.map((s) => ({ ...s, label: s.name }))
	);
	let siteId = $state(featured());
	const repeats = $derived(all[0]?.webmcp?.runs ?? all[0]?.baseline?.runs ?? 0);

	let metricId = $state<string>(METRICS[0].id);
	const metric = $derived(METRICS.find((m) => m.id === metricId) ?? METRICS[0]);
	const worse = $derived(losses(results, metric.id));
	const solved = (s: ArmSummary) => `${Math.round(s.success_rate * s.runs)}/${s.runs}`;
</script>

{#snippet side(arm: ArmSummary, label: string, ours: boolean)}
	{@const ok = arm.success_rate >= 0.5}
	<Card padding="lg" shadow="lg" class="h-full text-center">
		<Stamp tone={ours ? 'marker' : 'plain'}>{label}</Stamp>
		<p class="mt-6 font-display text-display font-bold tabular-nums">{tokens(arm.tokens)}</p>
		<p class="font-mono text-xs tracking-widest text-ink-3 uppercase">tokens</p>
		<p class="mt-4 text-ink-2">
			{seconds(arm.duration_ms)} · {arm.steps.toFixed(1)} steps · {perThousand(arm.cost_usd)} per 1k
		</p>
		<Stamp tone={ok ? 'good' : 'bad'} size="lg" class="mt-5">{ok ? 'Solved' : 'Failed'} {solved(arm)}</Stamp>
	</Card>
{/snippet}

{#snippet question(task: SiteTask)}
	{#if task.baseline && task.webmcp}
		{@const r = compare(task.baseline.tokens, task.webmcp.tokens, 'fewer tokens', 'more tokens')}
		<div class="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr] [&>*]:min-w-0">
			{@render side(task.baseline, 'Without WebMCP', false)}
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
			{@render side(task.webmcp, 'With webmcpx', true)}
		</div>
	{/if}
{/snippet}

<Section
	id="proof"
	kicker="Benchmark · {results.model}"
	title="Same agent. Same question."
	lead="Pick a site. One agent reads the page like a browser agent; the other calls the site's WebMCP tools."
>
	{#if sites.length}
		<Tabs
			{items}
			bind:value={siteId}
			label="Site"
			listClass="-mx-4 mb-10 gap-2.5 px-4 pt-1 pb-3 sm:mx-0 sm:mb-12 sm:flex-wrap sm:px-0"
			tabClass="h-11 border-ink bg-card px-4 text-[15px] text-ink shadow-hard-sm hover:-translate-y-0.5 aria-selected:bg-ink aria-selected:text-paper aria-selected:shadow-none"
		>
			{#snippet tab(site)}
				{#if site.logo?.wordmark}
					<SiteLogo logo={site.logo} size={18} />
					<span class="sr-only">{site.name}</span>
				{:else}
					{#if site.logo}<SiteLogo logo={site.logo} size={20} />{/if}
					{site.name}
				{/if}
				{#if !site.live}<span class="font-mono text-[10px] tracking-wider uppercase opacity-70">local</span
					>{/if}
			{/snippet}
			{#snippet panel(site)}
				<div class="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
					<div class="flex flex-wrap items-center gap-3">
						<h3 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">{site.name}</h3>
						<Stamp tone={site.live ? 'good' : 'plain'} size="sm"
							>{site.live ? 'live site' : 'local fixture'}</Stamp
						>
						{#if site.tasks.some((t) => t.task === best?.task)}
							<Stamp tone="marker" size="sm">Best live case</Stamp>
						{/if}
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

				{#if site.tasks.length === 1}
					<p class="mb-8 max-w-3xl text-lg text-pretty text-ink-2">“{site.tasks[0].prompt}”</p>
					{@render question(site.tasks[0])}
				{:else}
					<p class="mb-3 font-mono text-xs tracking-wider text-ink-3 uppercase">
						{site.tasks.length} questions · pick one
					</p>
					<Tabs
						items={site.tasks.map((t) => ({ ...t, id: t.task, label: t.prompt }))}
						label="Question on {site.name}"
						listClass="mb-8 flex-col gap-2"
						tabClass="h-auto min-h-12 justify-start rounded-2xl border-hairline bg-card px-4 py-2.5 text-left text-base text-ink-2 hover:border-ink aria-selected:border-ink aria-selected:bg-ink aria-selected:text-paper"
					>
						{#snippet tab(t)}
							<span class="text-pretty">“{t.prompt}”</span>
						{/snippet}
						{#snippet panel(t)}
							{@render question(t)}
						{/snippet}
					</Tabs>
				{/if}
			{/snippet}
		</Tabs>

		<details class="group mt-12 rounded-card border-2 border-ink bg-card">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold sm:px-7 [&::-webkit-details-marker]:hidden"
			>
				Every question on one chart, and how we measured
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
							headless Chrome. Same prompt and step limit in both arms; {repeats} runs per question and arm.
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
