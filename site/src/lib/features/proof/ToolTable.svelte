<!--
	A site's WebMCP tools as a table, like the question charts: name, description (the text the agent reads
	to choose a tool), and whether the agent called it, with the exact call. Called tools come first.
	Descriptions always show in full: they are the text the agent reads.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import type { QuestionTools } from '#lib/features/benchmark/tools.ts';

	interface Props {
		tools: QuestionTools;
		siteName: string;
	}

	let { tools, siteName }: Props = $props();
</script>

<section aria-label="WebMCP tools on {siteName}">
	<div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
		<h4 class="font-display text-xl font-bold tracking-tight">
			The {tools.tools.length} WebMCP tools {siteName} registers
		</h4>
		<p class="font-mono text-[11px] tracking-wider text-ink-3 uppercase">
			{tools.source === 'run'
				? `as the agent saw them · ${tools.date}`
				: `descriptions as registered ${tools.date} · benchmark ran ${tools.runDate}`}
		</p>
	</div>

	<table class="w-full table-fixed text-left text-sm">
		<thead class="text-xs text-ink-3">
			<tr>
				<th scope="col" class="w-[38%] pb-3 font-normal sm:w-[30%]">Tool</th>
				<th scope="col" class="pb-3 font-normal">Description</th>
				<th scope="col" class="w-16 pb-3 text-right font-normal">Called</th>
			</tr>
		</thead>
		<tbody>
			{#each tools.tools as tool (tool.name)}
				{@const calls = tools.calls.filter((c) => c.name === tool.name)}
				<tr class="border-t border-hairline align-top">
					<th scope="row" class="py-3 pr-4 font-normal">
						<code class={['font-mono text-sm break-words', tool.called && 'marker font-semibold']}
							>{tool.name}</code
						>
					</th>
					<td class="min-w-0 py-3 pr-4">
						<p class="text-pretty whitespace-pre-line text-ink-2">
							{tool.description || '(not registered when the snapshot was taken)'}
						</p>
						{#each calls as call, i (i)}
							<p
								class="mt-2 truncate rounded-lg bg-paper-2 px-2.5 py-1.5 font-mono text-xs text-ink"
								title="{call.name}({call.arguments})"
							>
								{call.name}({call.arguments})
							</p>
						{/each}
					</td>
					<td class="py-3 text-right">
						{#if tool.called}
							<Check size={16} strokeWidth={3} class="ml-auto" aria-hidden="true" />
							<span class="sr-only">Called</span>
						{:else}
							<span class="font-mono text-xs text-ink-3">–<span class="sr-only">Not called</span></span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>
