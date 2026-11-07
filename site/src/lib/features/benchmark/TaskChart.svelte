<!--
	Per-question comparison for one metric (a "question" is one benchmark request: what the agent was asked
	on one site; not a WebMCP concept). Drawn twice on purpose:
	- a visual chart (aria-hidden) that reflows from one line per question on desktop to two on phones;
	- a real <table> for screen readers and agents (visually hidden), with the same numbers.
	Bars grow once when scrolled into view and resize when the metric changes.
-->
<script lang="ts">
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { ARMS } from './arms.ts';
	import { metricValue, percent, type Metric, type Row } from './bench.ts';
	import type { BenchSite, SiteTask } from './sites.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';

	interface Props {
		/** Every question with its site, in display order. */
		questions: { task: SiteTask; site: BenchSite }[];
		metric: Metric;
	}

	let { questions, metric }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.proof);
	const c = $derived(m.chart);
	const name = $derived(m.metrics[metric.id]);
	const rows = $derived(questions.map((q) => q.task));

	const max = $derived(
		Math.max(Number.MIN_VALUE, ...rows.flatMap((r) => ARMS.map((a) => metricValue(r[a.arm], metric.id) ?? 0)))
	);
	const value = (row: Row, arm: (typeof ARMS)[number]['arm']) => {
		const v = metricValue(row[arm], metric.id);
		return v == null ? '–' : metric.format(v);
	};
</script>

<Reveal>
	<div aria-hidden="true">
		<div class="hidden grid-cols-[30%_1fr_4.5rem] gap-4 pb-3 text-xs text-ink-3 sm:grid">
			<span>{c.question}</span><span>{fmt(c.head, { metric: name.label, unit: name.unit })}</span><span
				class="text-right">{c.solved}</span
			>
		</div>
		<ul>
			{#each questions as { task: row, site } (row.task)}
				<li
					class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-hairline py-3 [grid-template-areas:'name_solved''bars_bars'] sm:grid-cols-[30%_1fr_4.5rem] sm:items-center sm:[grid-template-areas:'name_bars_solved']"
				>
					<div class="min-w-0 [grid-area:name]">
						<p class="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-ink-3 uppercase">
							{#if site.logo && !site.logo.wordmark}<SiteLogo logo={site.logo} size={12} />{/if}
							{site.name}{#if !site.live}<span>· {m.local}</span>{/if}
						</p>
						<p class="mt-0.5 line-clamp-2 text-sm text-pretty" title={row.prompt}>{row.prompt}</p>
					</div>
					<div class="min-w-0 [grid-area:bars]">
						{#each ARMS as a (a.arm)}
							{@const v = metricValue(row[a.arm], metric.id)}
							<div class="flex items-center gap-3 py-0.5">
								<div class="h-3.5 min-w-0 flex-1">
									{#if v != null}<div class="bar h-full rounded-full {a.bar}" style:--w={v / max}></div>{/if}
								</div>
								<span class="w-14 shrink-0 text-right font-mono text-xs tabular-nums {a.text}"
									>{value(row, a.arm)}</span
								>
							</div>
						{/each}
					</div>
					<div class="flex gap-2 text-right font-mono text-xs tabular-nums [grid-area:solved] sm:block">
						{#each ARMS as a (a.arm)}
							{@const s = row[a.arm]}
							<div class="sm:py-0.5 {a.text}">{s ? percent(s.success_rate) : '–'}</div>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	</div>
</Reveal>

<!-- Tables ignore width/overflow, so the visually hidden box is a wrapper. -->
<div class="sr-only">
	<table>
		<caption>{fmt(c.caption, { metric: name.label, unit: name.unit })}</caption>
		<thead>
			<tr>
				<th scope="col">{c.question}</th>
				{#each ARMS as a (a.arm)}<th scope="col"
						>{fmt(c.armMetric, { arm: m.arms[a.arm], metric: name.column })}</th
					>{/each}
				{#each ARMS as a (a.arm)}<th scope="col">{fmt(c.armSolved, { arm: m.arms[a.arm] })}</th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each questions as { task: row, site } (row.task)}
				<tr>
					<th scope="row"
						>{fmt(c.row, {
							site: site.live ? site.name : fmt(c.localSite, { site: site.name }),
							question: row.prompt
						})}</th
					>
					{#each ARMS as a (a.arm)}<td>{value(row, a.arm)}</td>{/each}
					{#each ARMS as a (a.arm)}<td>{row[a.arm] ? percent(row[a.arm]!.success_rate) : '–'}</td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.bar {
		width: max(4px, calc(var(--w) * 100%));
		transition: width 0.9s var(--ease-out-expo);
	}

	/* Grow from zero the first time the chart scrolls into view (only when JS runs). */
	:global([data-js] .reveal:not([data-visible])) .bar {
		width: 0;
	}
</style>
