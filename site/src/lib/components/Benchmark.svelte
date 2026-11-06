<script lang="ts">
	import Code from './Code.svelte';
	import Section from './Section.svelte';
	import {
		compare,
		headline,
		percent,
		perThousand,
		seconds,
		tokens,
		type Arm,
		type Results
	} from '#lib/bench.ts';

	let { results }: { results: Results } = $props();

	const h = $derived(headline(results));
	const rows = $derived(Object.entries(results.summary.tasks));
	const maxTokens = $derived(
		Math.max(1, ...rows.flatMap(([, arms]) => Object.values(arms).map((a) => a?.tokens ?? 0)))
	);
	const ran = $derived(
		results.started_at ? new Date(results.started_at * 1000).toISOString().slice(0, 10) : null
	);
	const ARMS: { arm: Arm; label: string; bar: string }[] = [
		{ arm: 'baseline', label: 'Without WebMCP', bar: 'bg-zinc-400 dark:bg-zinc-600' },
		{ arm: 'webmcp', label: 'With webmcpx', bar: 'bg-accent' }
	];
</script>

<Section id="benchmark" eyebrow="Benchmark" title="Same agent, same pages. Only the tools differ.">
	{#if h}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each [compare(h.baseline.tokens, h.webmcp.tokens, 'fewer tokens', 'more tokens'), compare(h.baseline.duration_ms, h.webmcp.duration_ms, 'faster', 'slower'), { value: percent(h.webmcp.success_rate), label: `tasks solved (baseline ${percent(h.baseline.success_rate)})` }, { value: perThousand(h.webmcp.cost_usd), label: `per 1,000 tasks (baseline ${perThousand(h.baseline.cost_usd)})` }] as tile (tile.label)}
				<div class="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
					<p class="text-3xl font-bold tracking-tight tabular-nums">{tile.value}</p>
					<p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{tile.label}</p>
				</div>
			{/each}
		</div>

		<div class="mt-10 overflow-x-auto">
			<table class="w-full min-w-[36rem] text-left text-sm">
				<thead class="text-zinc-500">
					<tr>
						<th class="py-2 font-medium">Task</th>
						<th class="py-2 font-medium">Tokens per run</th>
						<th class="py-2 text-right font-medium">Solved</th>
						<th class="py-2 text-right font-medium">Time</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as [task, arms] (task)}
						<tr class="border-t border-zinc-200 align-top dark:border-zinc-800">
							<td class="py-3 pr-4 font-mono text-xs">{task}</td>
							<td class="w-1/2 py-3 pr-4">
								{#each ARMS as { arm, bar } (arm)}
									{@const s = arms[arm]}
									{#if s}
										<div class="flex items-center gap-2 py-0.5">
											<div
												class="h-2 rounded-full {bar}"
												style:width="{Math.max(2, (s.tokens / maxTokens) * 100)}%"
											></div>
											<span class="text-xs tabular-nums text-zinc-500">{tokens(s.tokens)}</span>
										</div>
									{/if}
								{/each}
							</td>
							<td class="py-3 text-right tabular-nums">
								{#each ARMS as { arm } (arm)}
									<div>{arms[arm] ? percent(arms[arm].success_rate) : '–'}</div>
								{/each}
							</td>
							<td class="py-3 text-right tabular-nums">
								{#each ARMS as { arm } (arm)}
									<div>{arms[arm] ? seconds(arms[arm].duration_ms) : '–'}</div>
								{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="mt-3 flex gap-4 text-xs text-zinc-500">
				{#each ARMS as { arm, label, bar } (arm)}
					<span class="flex items-center gap-1.5"><span class="size-2 rounded-full {bar}"></span>{label}</span>
				{/each}
			</div>
		</div>
	{:else}
		<div class="rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
			<p class="font-medium">No run published yet.</p>
			<p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
				Run the benchmark locally and this section fills in from <code>bench/results/latest.json</code>.
			</p>
		</div>
	{/if}

	<div class="mt-10 grid gap-8 sm:grid-cols-2 [&>*]:min-w-0">
		<div class="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
			<h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">How it is measured</h3>
			<p>
				Model <code class="font-mono">{results.model}</code>{#if results.reasoning_effort}, reasoning {results.reasoning_effort}{/if},
				headless Chrome{#if ran}, run on {ran}{/if}. Every task runs in both arms with the same prompt,
				system prompt and step limit.
			</p>
			<p>
				<strong>Without WebMCP</strong>, the agent reads a text snapshot of the page and clicks or fills
				elements by reference, like DOM-snapshot browser agents. <strong>With webmcpx</strong>, it gets
				only the tools the page registers.
			</p>
			<p>
				Grading is deterministic: the answer must contain the expected facts, and actions are checked
				against the page state. No LLM judge.
			</p>
		</div>
		<div class="space-y-3">
			<h3 class="text-base font-semibold">Reproduce it</h3>
			<Code code={'git clone https://github.com/webmcpx/webmcpx\ncd webmcpx && just setup\nOPENAI_API_KEY=sk-... just bench'} />
		</div>
	</div>
</Section>
