<!--
	Per-task comparison for one metric, drawn twice on purpose:
	- a visual chart (aria-hidden) that reflows from one line per task on desktop to two on phones;
	- a real <table> for screen readers and agents (visually hidden), with the same numbers.
	Bars grow once when scrolled into view and resize when the metric changes.
-->
<script lang="ts">
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { ARMS } from './arms.ts';
	import { metricValue, percent, type Metric, type Row } from './bench.ts';

	let { rows, metric }: { rows: Row[]; metric: Metric } = $props();

	const max = $derived(
		Math.max(Number.MIN_VALUE, ...rows.flatMap((r) => ARMS.map((a) => metricValue(r[a.arm], metric.id) ?? 0)))
	);
	const name = (task: string) => task.replace(/^live-/, '');
	const value = (row: Row, arm: (typeof ARMS)[number]['arm']) => {
		const v = metricValue(row[arm], metric.id);
		return v == null ? '–' : metric.format(v);
	};
</script>

<Reveal>
	<div aria-hidden="true">
		<div class="hidden grid-cols-[30%_1fr_4.5rem] gap-4 pb-3 text-xs text-ink-3 sm:grid">
			<span>Task</span><span>{metric.label} · {metric.unit}</span><span class="text-right">Solved</span>
		</div>
		<ul>
			{#each rows as row (row.task)}
				<li
					class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-hairline py-3 [grid-template-areas:'name_solved''bars_bars'] sm:grid-cols-[30%_1fr_4.5rem] sm:items-center sm:[grid-template-areas:'name_bars_solved']"
				>
					<div class="flex min-w-0 flex-wrap items-center gap-1.5 [grid-area:name]">
						<span class="font-mono text-xs break-words">{name(row.task)}</span>
						{#if row.live}<Stamp tone="marker" size="sm">live</Stamp>{/if}
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
		<caption>{metric.label} per task, {metric.unit}; lower is better. Success rate per arm.</caption>
		<thead>
			<tr>
				<th scope="col">Task</th>
				{#each ARMS as a (a.arm)}<th scope="col">{a.label}: {metric.label.toLowerCase()}</th>{/each}
				{#each ARMS as a (a.arm)}<th scope="col">{a.label}: solved</th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.task)}
				<tr>
					<th scope="row">{name(row.task)}{row.live ? ' (live site)' : ''}</th>
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
