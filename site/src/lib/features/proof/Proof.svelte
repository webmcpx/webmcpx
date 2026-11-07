<!--
	The evidence, one site at a time and one question at a time: no averages. Logos pick the site (best
	case first); a site's questions rotate. Under them, tabs show that site's questions per metric, its
	WebMCP tools and the method. All tab panels are in the HTML, so everything reads without JavaScript.
-->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Coins from '@lucide/svelte/icons/coins';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Footprints from '@lucide/svelte/icons/footprints';
	import Timer from '@lucide/svelte/icons/timer';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Zap from '@lucide/svelte/icons/zap';
	import type { Component } from 'svelte';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import { REPO } from '#lib/content/site.ts';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import {
		compare,
		METRICS,
		perThousand,
		rows,
		seconds,
		tokens,
		type ArmSummary,
		type Results
	} from '#lib/features/benchmark/bench.ts';
	import type { BenchSite, SiteTask } from '#lib/features/benchmark/sites.ts';
	import TaskChart from '#lib/features/benchmark/TaskChart.svelte';
	import { siteTools, type QuestionTools } from '#lib/features/benchmark/tools.ts';
	import Rotator from './Rotator.svelte';
	import ToolTable from './ToolTable.svelte';

	interface Props {
		results: Results;
		sites: BenchSite[];
		/** Per question: the site's WebMCP tools and the calls the agent made. */
		tools: Record<string, QuestionTools>;
		/** Questions in the whole run, of which `sites` shows a selection. */
		totalQuestions: number;
		reproduce: Highlighted;
	}

	let { results, sites, tools, totalQuestions, reproduce }: Props = $props();
	const shown = $derived(sites.reduce((n, s) => n + s.tasks.length, 0));

	const all = $derived(rows(results));
	// Sites come best case first (see sites.ts), so the first one is shown by default, already in the
	// prerendered HTML.
	const items = $derived(sites.map((s) => ({ ...s, label: s.name })));
	const questions = $derived(sites.flatMap((site) => site.tasks.map((task) => ({ task, site }))));
	const first = () => sites[0]?.id;
	let siteId = $state(first());
	const repeats = $derived(all[0]?.webmcp?.runs ?? all[0]?.baseline?.runs ?? 0);

	/** The tabs under a site's questions: one per metric, then its tools and the method. */
	const DETAILS: { id: string; label: string; icon: Component }[] = [
		{ id: 'tokens', label: 'Tokens', icon: Zap },
		{ id: 'duration_ms', label: 'Time', icon: Timer },
		{ id: 'steps', label: 'Steps', icon: Footprints },
		{ id: 'cost_usd', label: 'Cost', icon: Coins },
		{ id: 'tools', label: 'Tools', icon: Wrench },
		{ id: 'method', label: 'Method', icon: FlaskConical }
	];
	let detailId = $state('tokens');
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

{#snippet question(site: BenchSite, task: SiteTask)}
	<div class="mb-8">
		<div class="flex items-baseline justify-between gap-4 sm:gap-8">
			<p class="max-w-3xl min-w-0 text-lg text-pretty sm:text-xl">“{task.prompt}”</p>
			{#if site.url}
				<a
					href={site.url}
					class="group inline-flex shrink-0 items-center gap-1 font-mono text-sm font-medium text-ink underline decoration-marker decoration-[3px] underline-offset-[5px] transition hover:decoration-ink"
				>
					<span class="hidden sm:inline">{new URL(site.url).hostname}</span>
					<span class="sm:hidden">Open</span>
					<ArrowUpRight
						size={15}
						strokeWidth={2.5}
						class="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						aria-hidden="true"
					/>
					<span class="sr-only">(opens {site.name})</span>
				</a>
			{/if}
		</div>
	</div>
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
	lead="One agent reads, clicks and fills using page snapshots; the other calls the site's WebMCP tools. Biggest savings first."
>
	<p class="-mt-6 mb-10 text-sm text-ink-3">
		Selected cases: {shown} of {totalQuestions} questions, where WebMCP used at most half the tokens.
		<a
			href="{REPO}/blob/main/site/src/lib/content/bench.json"
			class="font-medium text-ink underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
			>All results</a
		>
		are public, or run it yourself with <code class="font-mono text-ink">just bench</code>.
	</p>
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
			{#snippet panel(site, visible)}
				<!-- The selected logo already names the site: the heading is for screen readers only. -->
				<h3 class="sr-only">{site.name}</h3>
				{#if site.tasks.length === 1}
					{@render question(site, site.tasks[0])}
				{:else}
					<!-- Keyed by site: switching sites starts the rotation over. -->
					{#key site.id}
						<Rotator items={site.tasks} noun="Question" enabled={visible}>
							{#snippet item(t)}
								{@render question(site, t)}
							{/snippet}
						</Rotator>
					{/key}
				{/if}
				{@const siteQuestions = questions.filter((q) => q.site.id === site.id)}
				{@const st = siteTools(site.tasks.map((t) => tools[t.task]).filter(Boolean))}
				<Tabs
					items={DETAILS}
					bind:value={detailId}
					label="Details for {site.name}"
					class="mt-12"
					listClass="mb-6 flex-wrap"
				>
					{#snippet tab(d)}<d.icon aria-hidden="true" />{d.label}{/snippet}
					{#snippet panel(d)}
						{@const m = METRICS.find((x) => x.id === d.id)}
						<div class="rounded-card border-2 border-ink bg-card p-5 sm:p-7">
							{#if m}
								<TaskChart questions={siteQuestions} metric={m} />
							{:else if d.id === 'tools'}
								{#if st}<ToolTable tools={st} siteName={site.name} />{/if}
							{:else}
								<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
									<ul class="list-disc space-y-2 pl-5 text-sm text-ink-2">
										<li>
											{results.model}{#if results.reasoning_effort}, reasoning {results.reasoning_effort}{/if},
											headless Chrome. Same prompt and step limit in both arms; {repeats} runs per question and
											arm.
										</li>
										<li>Without WebMCP: a DOM-snapshot agent that reads, clicks and fills.</li>
										<li>With webmcpx: only the tools the page registers.</li>
										<li>Graded by facts in the answer and page state. No LLM judge.</li>
										<li>
											{site.live
												? 'A live site: it ships its own WebMCP tools.'
												: 'A local test site: its tools come from webmcpx.'}
										</li>
									</ul>
									<CodeBlock snippet={reproduce} title="reproduce it" />
								</div>
							{/if}
						</div>
					{/snippet}
				</Tabs>
			{/snippet}
		</Tabs>
	{:else}
		<Card padding="lg" shadow="none" class="border-dashed">
			<p class="font-display font-bold">No run published yet.</p>
			<p class="mt-1 text-sm text-ink-2">Run <code class="font-mono">just bench</code> and this fills in.</p>
		</Card>
	{/if}
</Section>
