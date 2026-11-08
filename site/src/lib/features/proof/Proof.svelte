<!--
	The evidence, one model, one site and one question at a time: no averages. The model switcher picks the
	run; logos pick the site (best case first). The rotation moves from site to site (each by its best
	question), and the selected logo follows, so the logos are the carousel's position (WCAG 2.2.2: it holds while hovered,
	focused or off screen, stops for good once a site is picked, and never moves for reduced motion). Under them, tabs show that site's questions per metric, its
	WebMCP tools and the method. On each model's own page every panel is in the HTML, so everything reads
	without JavaScript; the home renders only the open site and tab (`compact`).
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
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import { modelLook } from '#lib/content/models.ts';
	import { REPO } from '#lib/content/site.ts';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import { compare, METRICS, ratio, rows, tokens, type ModelRun } from '#lib/features/benchmark/bench.ts';
	import { bestGain, type BenchSite, type SiteTask } from '#lib/features/benchmark/sites.ts';
	import TaskChart from '#lib/features/benchmark/TaskChart.svelte';
	import { siteTools } from '#lib/features/benchmark/tools.ts';
	import ToolTable from './ToolTable.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	interface Props {
		/** One run per model, in switcher order. */
		runs: ModelRun[];
		/** Every published model, linked to its own page for readers without JavaScript (default: `runs`). */
		models?: string[];
		reproduce: Highlighted;
		/**
		 * Render only the open site and detail tab (the home: thousands fewer elements, a faster first paint).
		 * Without JavaScript the home shows the first site; each model's own page renders every site and tab.
		 */
		compact?: boolean;
	}

	let { runs, models: published, reproduce, compact = false }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.proof);
	const pages = $derived((published ?? runs.map((r) => r.results.model)).map(modelLook));

	const models = $derived(
		// Each run carries its leaderboard place: a model's own page shows its real one.
		runs.map((run) => ({ ...run, ...modelLook(run.results.model), id: run.results.model, label: '' }))
	);
	// Initial values only: the tabs own the state after that.
	const initial = () => ({ model: runs[0]?.results.model, site: runs[0]?.sites[0]?.id });
	let modelId = $state(initial().model);
	const current = $derived(models.find((x) => x.id === modelId));
	// The site and detail tab stay put when the model changes (a site a model lacks falls back to its
	// best one). Sites come best case first (see sites.ts), so the first is shown by default, already
	// in the prerendered HTML.
	let siteId = $state(initial().site);

	/** The tabs under a site's questions: one per metric, then its tools and the method. */
	const ICONS = {
		tokens: Zap,
		duration_ms: Timer,
		steps: Footprints,
		cost_usd: Coins,
		tools: Wrench,
		method: FlaskConical
	} satisfies Record<keyof typeof m.tabs, Component>;
	const DETAILS = $derived(
		(Object.keys(ICONS) as (keyof typeof ICONS)[]).map((id) => ({ id, label: m.tabs[id], icon: ICONS[id] }))
	);
	let detailId = $state('tokens');

	// The carousel: one site at a time, in the selected model's order (best case first), each shown by
	// its best question; the selected logo is where it is. A site's other questions are in the tabs below.
	let paused = $state(false);
	let hovering = $state(false);
	let focused = $state(false);
	let onScreen = $state(false);
	const running = $derived(
		!paused && !hovering && !focused && onScreen && !prefersReducedMotion.current && !!current
	);
	$effect(() => {
		if (!running || !current || current.sites.length < 2) return;
		const sites = current.sites;
		void siteId; // read here: the clock restarts on every move (by hand too), so each site gets its full time
		const t = setInterval(() => {
			if (document.hidden) return;
			const at = Math.max(
				0,
				sites.findIndex((x) => x.id === siteId)
			);
			siteId = sites[(at + 1) % sites.length].id;
		}, 6000);
		return () => clearInterval(t);
	});
	/** A site picked by hand stops the rotation for good: the reader has taken over (WCAG 2.2.2). */
	function pick(id: string) {
		siteId = id;
		paused = true;
	}
	function watch(node: HTMLElement) {
		const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}
	const shown = (sites: BenchSite[]) => sites.reduce((n, s) => n + s.tasks.length, 0);
	const repeats = (run: ModelRun) => {
		const first = rows(run.results)[0];
		return first?.webmcp?.runs ?? first?.baseline?.runs ?? 0;
	};
</script>

{#snippet question(site: BenchSite, task: SiteTask)}
	{@const r =
		task.baseline && task.webmcp
			? compare(task.baseline.tokens, task.webmcp.tokens, m.fewerTokens, m.moreTokens)
			: null}
	<!-- The saving, one number, on the left past a rule; the site and its question next to it (the number
	     below them on small screens). The per-arm numbers are in the tabs underneath. -->
	<div class="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
		<div class="min-w-0 flex-1">
			<!-- The site, named big above its question. -->
			<h4 class="mb-4 flex items-center gap-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
				{#if site.logo}<SiteLogo logo={site.logo} size={32} />{/if}
				{#if !site.logo?.wordmark}{site.name}{:else}<span class="sr-only">{site.name}</span>{/if}
				{#if !site.live}<span class="font-mono text-xs font-normal tracking-wider text-ink-3 uppercase"
						>{m.local}</span
					>{/if}
			</h4>
			<p class="text-lg text-pretty sm:text-xl">“{task.prompt}”</p>
			{#if site.url}
				<a
					href={site.url}
					class="group mt-4 inline-flex items-center gap-1 font-mono text-sm font-medium text-ink underline decoration-marker decoration-[3px] underline-offset-[5px] transition hover:decoration-ink"
				>
					<span>{new URL(site.url).hostname}</span>
					<ArrowUpRight
						size={15}
						strokeWidth={2.5}
						class="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						aria-hidden="true"
					/>
					<span class="sr-only">{fmt(m.opens, { site: site.name })}</span>
				</a>
			{/if}
		</div>
		{#if r && task.baseline && task.webmcp}
			<!-- The saving as type, highlighted like the page's other big numbers, with what it is made of. -->
			<div class="shrink-0 sm:order-first sm:border-r-2 sm:border-ink sm:pr-10">
				<p class="font-display text-7xl leading-none font-bold tracking-tight sm:text-8xl">
					<span
						class="sweep px-1"
						style={task.webmcp.tokens <= task.baseline.tokens
							? 'background: linear-gradient(transparent 60%, var(--color-marker) 60%)'
							: undefined}>{r.value}</span
					>
				</p>
				<p class="mt-3 font-mono text-xs font-bold tracking-wider uppercase">{r.label}</p>
				<p class="mt-1 font-mono text-xs text-ink-3 tabular-nums">
					{tokens(task.baseline.tokens)} → {tokens(task.webmcp.tokens)}
					{m.tokens}
				</p>
			</div>
		{/if}
	</div>
{/snippet}

<Section id="leaderboard" kicker={m.kicker} title={m.title} lead={m.lead}>
	{#if pages.length > 1}
		<!-- Without JavaScript the switcher cannot switch: each model has its own prerendered page. -->
		<nav aria-label={m.byModel} class="no-js-only mb-8">
			<p class="font-mono text-[11px] tracking-widest text-ink-3 uppercase">{m.models}</p>
			<ul class="mt-2 flex flex-wrap gap-x-5 gap-y-2">
				{#each pages as p (p.id)}
					<li>
						<a
							href={i18n.href(`/benchmark/${p.id}/`)}
							class="font-medium underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
							>{p.name}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
	{#if current}
		<!-- Footnotes to the lead: how models are ranked, and which questions the page shows. -->
		<div class="-mt-4 mb-8 space-y-1 text-xs text-ink-3">
			<p>{m.ranking}</p>
			<p>
				<Rich
					text={i18n.plural(current.totalQuestions, m.selected, {
						shown: i18n.number(shown(current.sites)),
						total: i18n.number(current.totalQuestions)
					})}
				>
					{#snippet results()}<a
							href="{REPO}/blob/main/site/src/lib/content/bench/{current.results.model}.json"
							class="font-medium text-ink underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
							>{m.results}</a
						>{/snippet}
					{#snippet command()}<code class="font-mono text-ink">just bench</code>{/snippet}
				</Rich>
			</p>
		</div>
	{/if}
	{#if models.length}
		<Tabs
			items={models}
			bind:value={modelId}
			label={m.model}
			lazy
			listClass="mb-10 w-full rounded-full border-2 border-ink bg-card p-1 shadow-hard-sm"
			tabClass="h-9 grow justify-center border-transparent px-3.5 text-sm whitespace-nowrap text-ink-2 hover:text-ink aria-selected:bg-ink aria-selected:text-paper [&_svg]:size-4"
		>
			{#snippet tab(model)}
				<!-- One segment per model, its place first: a quiet "#1" in the segment, not a badge. -->
				<span class="font-mono text-[11px]" aria-label={fmt(m.rank, { n: model.rank })}>#{model.rank}</span>
				{#if model.logo}<SiteLogo logo={model.logo} size={16} />{/if}
				{model.name}
			{/snippet}
			{#snippet panel(model)}
				<h3 class="sr-only">
					{model.provider ? fmt(m.modelHeading, { name: model.name, provider: model.provider }) : model.name}
				</h3>
				{@render run(model)}
			{/snippet}
		</Tabs>
	{:else}
		<Card padding="lg" shadow="none" class="border-dashed">
			<p class="font-display font-bold">{m.empty.title}</p>
			<p class="mt-1 text-sm text-ink-2">
				<Rich text={m.empty.text}
					>{#snippet command()}<code class="font-mono">just bench</code>{/snippet}</Rich
				>
			</p>
		</Card>
	{/if}
</Section>

{#snippet run(model: ModelRun)}
	{@const { results: result, sites, tools } = model}
	{@const items = sites.map((s) => ({ ...s, label: s.name }))}
	{@const questions = sites.flatMap((site) => site.tasks.map((task) => ({ task, site })))}
	{#if !sites.length}
		<Card padding="lg" shadow="none" class="border-dashed">
			<p class="font-display font-bold">{fmt(m.none.title, { model: result.model })}</p>
			<p class="mt-1 text-sm text-ink-2">{m.none.text}</p>
		</Card>
	{/if}
	<div
		use:watch
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
		role="group"
		aria-roledescription="carousel"
		aria-label={m.rotator.label}
	>
		<Tabs
			{items}
			lazy={compact}
			bind:value={() => siteId, pick}
			label={m.site}
			listClass="-mr-4 gap-3 pt-1 pr-4 pb-3 sm:mr-0 sm:pr-1"
			tabClass="min-w-40 flex-1 flex-col! items-start! gap-1.5! rounded-card! border-ink bg-card px-4 py-3 text-left text-ink shadow-hard-sm hover:-translate-y-0.5 aria-selected:bg-ink aria-selected:text-paper aria-selected:shadow-none"
		>
			{#snippet tab(site)}
				<!-- A small scoreboard tile: the site, then its best saving. -->
				<span class="flex items-center gap-2 text-[15px]">
					{#if site.logo?.wordmark}
						<SiteLogo logo={site.logo} size={18} />
						<span class="sr-only">{site.name}</span>
					{:else}
						{#if site.logo}<SiteLogo logo={site.logo} size={18} />{/if}
						{site.name}
					{/if}
					{#if !site.live}<span class="font-mono text-[10px] tracking-wider uppercase">{m.local}</span>{/if}
				</span>
				<span class="font-mono text-xs tracking-wider whitespace-nowrap uppercase">
					<span class="font-display text-lg font-bold tracking-normal normal-case"
						>{ratio(bestGain(site))}</span
					>
					{m.fewerTokens}
				</span>
			{/snippet}
			{#snippet panel(site, visible)}
				{@const task = site.tasks[0]}
				<!-- Keyed by visibility: the site fades in when the rotation (or a click) brings it up. -->
				{#key visible}
					<div
						class="mt-8 sm:mt-10"
						aria-live={running ? 'off' : 'polite'}
						in:fade={{ duration: prefersReducedMotion.current ? 0 : 400 }}
					>
						{#if task}{@render question(site, task)}{/if}
					</div>
				{/key}
				{@const siteQuestions = questions.filter((q) => q.site.id === site.id)}
				{@const st = siteTools(site.tasks.map((t) => tools[t.task]).filter(Boolean))}
				<Tabs
					items={DETAILS}
					lazy={compact}
					bind:value={detailId}
					label={fmt(m.details, { site: site.name })}
					class="mt-12"
					listClass="mb-6 flex-wrap"
				>
					{#snippet tab(d)}<d.icon aria-hidden="true" />{d.label}{/snippet}
					{#snippet panel(d)}
						{@const metric = METRICS.find((x) => x.id === d.id)}
						<div class="rounded-card border-2 border-ink bg-card p-5 sm:p-7">
							{#if metric}
								<TaskChart questions={siteQuestions} {metric} />
							{:else if d.id === 'tools'}
								{#if st}<ToolTable tools={st} siteName={site.name} />{/if}
							{:else}
								<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
									<ul class="list-disc space-y-2 pl-5 text-sm text-ink-2">
										<li>
											{i18n.plural(
												repeats(model),
												result.reasoning_effort ? m.method.setup : m.method.setupNoEffort,
												{ model: result.model, effort: result.reasoning_effort ?? '' }
											)}
										</li>
										<li>{m.method.baseline}</li>
										<li>{m.method.webmcp}</li>
										<li>{m.method.graded}</li>
										<li>{site.live ? m.method.live : m.method.local}</li>
										<li>{m.method.scope}</li>
										<li>{m.method.runs}</li>
										<li>{m.method.measures}</li>
										<li>{m.method.failures}</li>
									</ul>
									<CodeBlock snippet={reproduce} title={m.method.reproduce} />
								</div>
							{/if}
						</div>
					{/snippet}
				</Tabs>
			{/snippet}
		</Tabs>
	</div>
{/snippet}
