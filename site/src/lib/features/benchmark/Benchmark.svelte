<script lang="ts">
	import ChartColumn from '@lucide/svelte/icons/chart-no-axes-column';
	import Coins from '@lucide/svelte/icons/coins';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Footprints from '@lucide/svelte/icons/footprints';
	import Timer from '@lucide/svelte/icons/timer';
	import Zap from '@lucide/svelte/icons/zap';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { ARMS } from './arms.ts';
	import { headline, losses, METRICS, rows, type Results } from './bench.ts';
	import StatTiles from './StatTiles.svelte';
	import TaskChart from './TaskChart.svelte';

	let { results, reproduce }: { results: Results; reproduce: Highlighted } = $props();

	const ICONS = { tokens: Zap, duration_ms: Timer, steps: Footprints, cost_usd: Coins };
	const h = $derived(headline(results));
	const taskRows = $derived(rows(results));
	const repeats = $derived(taskRows[0]?.webmcp?.runs ?? taskRows[0]?.baseline?.runs);
	const live = $derived(taskRows.filter((r) => r.live).length);
	const ran = $derived(
		results.started_at ? new Date(results.started_at * 1000).toISOString().slice(0, 10) : null
	);
	let metricId = $state<string>(METRICS[0].id);
	const metric = $derived(METRICS.find((m) => m.id === metricId) ?? METRICS[0]);
	const worse = $derived(losses(results, metric.id));
</script>

<Section
	id="benchmark"
	eyebrow="Benchmark"
	icon={ChartColumn}
	title="Same agent, same pages. Only the tools differ."
	lead="{taskRows.length} tasks, {live} of them on public sites that already ship WebMCP. Each runs in both arms, graded without an LLM judge."
>
	{#if h}
		<StatTiles headline={h} />

		<Card padding="none" class="mt-6">
			<div class="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 sm:px-6">
				<div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
					{#each ARMS as a (a.arm)}
						<span class="flex items-center gap-2"
							><span class="size-2.5 rounded-full {a.bar}"></span>{a.label}</span
						>
					{/each}
					<span class="text-subtle">Lower is better</span>
				</div>
			</div>
			<Tabs
				items={METRICS}
				bind:value={metricId}
				label="Metric"
				listClass="border-b border-border p-2 sm:px-4"
			>
				{#snippet tab(m)}
					{@const Icon = ICONS[m.id]}
					<Icon aria-hidden="true" />{m.label}
				{/snippet}
				{#snippet panel()}
					<div class="p-4 sm:p-6">
						<TaskChart rows={taskRows} {metric} />
						{#if worse.length}
							<p class="mt-5 rounded-xl border border-border bg-bg p-3 text-xs leading-relaxed text-muted">
								<strong class="font-medium text-fg"
									>Where webmcpx loses on {metric.label.toLowerCase()}:</strong
								>
								{worse.map((t) => t.replace(/^live-/, '')).join(', ')}. Published as measured.
							</p>
						{/if}
					</div>
				{/snippet}
			</Tabs>
		</Card>
	{:else}
		<Card padding="lg" class="border-dashed">
			<p class="font-medium">No run published yet.</p>
			<p class="mt-1 text-sm text-muted">
				Run the benchmark locally and this section fills in from <code class="font-mono"
					>bench/results/latest.json</code
				>.
			</p>
		</Card>
	{/if}

	<div class="mt-6 grid gap-6 lg:grid-cols-5 [&>*]:min-w-0">
		<Reveal class="lg:col-span-3">
			<Card padding="lg" class="h-full">
				<h3 class="flex items-center gap-2 font-semibold">
					<FlaskConical size={18} class="text-accent-ink" aria-hidden="true" />How it is measured
				</h3>
				<ul class="mt-4 space-y-3 text-sm leading-relaxed text-muted">
					<li>
						Model <code class="font-mono text-fg">{results.model}</code>{#if results.reasoning_effort},
							reasoning
							{results.reasoning_effort}{/if}, headless Chrome{#if ran}, run on {ran}{/if}. Same prompt,
						system prompt and step limit in both arms{#if repeats}; {repeats} runs per task and arm{/if}.
					</li>
					<li>
						<strong class="font-medium text-fg">Without WebMCP</strong>, the agent reads a text snapshot of
						the page and clicks or fills elements by reference, like DOM-snapshot browser agents.
						<strong class="font-medium text-fg">With webmcpx</strong>, it gets only the tools the page
						registers.
					</li>
					<li>
						<strong class="font-medium text-fg">Live</strong> tasks run on Cloudflare and Notion docs, a Shopify
						store, a WooCommerce store and specification.website. The others run on local fixture sites.
					</li>
					<li>
						Deterministic grading: the answer must contain the expected facts, and actions are checked against
						the page state.{#if results.price_per_mtok}
							Cost uses the provider's list prices, cached input included.{/if}
					</li>
				</ul>
			</Card>
		</Reveal>
		<Reveal delay={100} class="flex flex-col gap-3 lg:col-span-2">
			<h3 class="font-semibold">Reproduce it</h3>
			<p class="text-sm text-muted">
				Any OpenAI-compatible model works; results land in the same JSON this page reads.
			</p>
			<CodeBlock snippet={reproduce} title="terminal" />
		</Reveal>
	</div>
</Section>
