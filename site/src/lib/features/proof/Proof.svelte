<!--
	The evidence, biggest first: one real site side by side, then the averages over every task, then the
	full table behind a disclosure. All numbers come from bench.json.
-->
<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import {
		compare,
		headline,
		losses,
		METRICS,
		percent,
		perThousand,
		ratio,
		rows,
		seconds,
		spotlight,
		tokens,
		type ArmSummary,
		type Results
	} from '#lib/features/benchmark/bench.ts';
	import TaskChart from '#lib/features/benchmark/TaskChart.svelte';

	let { results, reproduce }: { results: Results; reproduce: Highlighted } = $props();

	const h = $derived(headline(results));
	const best = $derived(spotlight(results));
	const all = $derived(rows(results));
	let metricId = $state<string>(METRICS[0].id);
	const metric = $derived(METRICS.find((m) => m.id === metricId) ?? METRICS[0]);
	const worse = $derived(losses(results, metric.id));
	const solved = (s: ArmSummary) => `${Math.round(s.success_rate * s.runs)}/${s.runs}`;
	const name = (task: string) => task.replace(/^live-/, '').replaceAll('-', ' ');
</script>

{#snippet side(arm: ArmSummary, label: string, ours: boolean, delay: number)}
	{@const ok = arm.success_rate >= 0.5}
	<Reveal {delay}>
		<Card padding="lg" shadow="lg" class="text-center">
			<Stamp tone={ours ? 'marker' : 'plain'}>{label}</Stamp>
			<p class="mt-6 font-display text-display font-bold tabular-nums">{tokens(arm.tokens)}</p>
			<p class="font-mono text-xs tracking-widest text-ink-3 uppercase">tokens</p>
			<p class="mt-4 text-ink-2">{seconds(arm.duration_ms)} · {arm.steps.toFixed(1)} steps</p>
			<Stamp tone={ok ? 'good' : 'bad'} size="lg" tilt class="mt-5"
				>{ok ? 'Solved' : 'Failed'} {solved(arm)}</Stamp
			>
		</Card>
	</Reveal>
{/snippet}

<Section
	id="proof"
	kicker="Benchmark · {results.model}"
	title="Same agent. Same question."
	lead="One reads the page. One calls the site's tools."
>
	{#if best && h}
		<div class="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr] [&>*]:min-w-0">
			{@render side(best.baseline, 'Without WebMCP', false, 0)}
			<Reveal delay={240} class="flex justify-center">
				<div
					class="grid size-32 place-items-center rounded-full border-2 border-ink bg-marker text-center shadow-hard sm:size-36"
				>
					<p class="font-display leading-none font-bold">
						<span class="block text-5xl sm:text-6xl"
							>{ratio(best.baseline.tokens / Math.max(1, best.webmcp.tokens))}</span
						>
						<span class="font-mono text-[11px] tracking-wider uppercase">fewer tokens</span>
					</p>
				</div>
			</Reveal>
			{@render side(best.webmcp, 'With webmcpx', true, 120)}
		</div>
		<p class="mt-6 text-center text-sm text-ink-3">
			Best live case: “{name(best.task)}”. Averages over all {all.length} tasks below.
		</p>

		<Reveal>
			<dl class="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
				{#each [{ ...compare(h.baseline.tokens, h.webmcp.tokens, 'fewer tokens', 'more tokens') }, { ...compare(h.baseline.duration_ms, h.webmcp.duration_ms, 'faster', 'slower') }, { value: percent(h.webmcp.success_rate), label: `solved (vs ${percent(h.baseline.success_rate)})` }, { value: perThousand(h.webmcp.cost_usd), label: `per 1k tasks (vs ${perThousand(h.baseline.cost_usd)})` }] as stat (stat.label)}
					<div class="flex flex-col rounded-card border-2 border-ink bg-card p-5 text-center">
						<dt class="order-last text-sm text-ink-2">{stat.label}</dt>
						<dd class="font-display text-4xl font-bold tracking-tight tabular-nums">{stat.value}</dd>
					</div>
				{/each}
			</dl>
		</Reveal>

		<details class="group mt-10 rounded-card border-2 border-ink bg-card">
			<summary
				class="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold sm:px-7 [&::-webkit-details-marker]:hidden"
			>
				All {all.length} tasks and how we measured
				<ChevronDown class="transition group-open:rotate-180" aria-hidden="true" />
			</summary>
			<div class="border-t-2 border-ink p-5 sm:p-7">
				<Tabs items={METRICS} bind:value={metricId} label="Metric" listClass="mb-6 flex-wrap">
					{#snippet panel()}
						<TaskChart rows={all} {metric} />
						{#if worse.length}
							<p class="mt-5 text-sm text-ink-2">
								<strong class="text-ink">webmcpx loses on {metric.label.toLowerCase()} in:</strong>
								{worse.map(name).join(', ')}. Published as measured.
							</p>
						{/if}
					{/snippet}
				</Tabs>
				<div class="mt-8 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
					<ul class="list-disc space-y-2 pl-5 text-sm text-ink-2">
						<li>
							{results.model}{#if results.reasoning_effort}, reasoning {results.reasoning_effort}{/if},
							headless Chrome. Same prompt and step limit in both arms.
						</li>
						<li>Without WebMCP: a DOM-snapshot agent that reads, clicks and fills.</li>
						<li>With webmcpx: only the tools the page registers.</li>
						<li>Graded by facts in the answer and page state. No LLM judge.</li>
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
