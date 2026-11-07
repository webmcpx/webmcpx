<!--
	The WebMCP tools a site registered for one question: each tool's name and description (the text the
	agent reads to choose a tool), the ones the agent called marked and first, and the calls it made.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { onMount } from 'svelte';
	import type { QuestionTools } from '#lib/features/benchmark/tools.ts';

	interface Props {
		tools: QuestionTools;
		siteName: string;
	}

	let { tools, siteName }: Props = $props();

	/**
	 * Long lists and long descriptions stay short until asked for, but only once the page is live: the
	 * prerendered HTML (and readers without JavaScript) always get every tool and every full description.
	 */
	const PREVIEW = 4;
	let hydrated = $state(false);
	let expanded = $state(false);
	onMount(() => (hydrated = true));
	const collapsed = $derived(hydrated && !expanded);
	const shown = $derived(collapsed ? tools.tools.slice(0, PREVIEW) : tools.tools);
	const hidden = $derived(tools.tools.length - shown.length);
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

	<ul class="grid gap-3 md:grid-cols-2">
		{#each shown as tool (tool.name)}
			{@const calls = tools.calls.filter((c) => c.name === tool.name)}
			<li
				class={[
					'min-w-0 rounded-card border-2 bg-card p-4',
					tool.called ? 'border-ink shadow-hard-sm' : 'border-hairline'
				]}
			>
				<p class="flex flex-wrap items-center gap-2">
					<code class="font-mono text-sm font-semibold">{tool.name}</code>
					{#if tool.called}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-marker px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase"
						>
							<Check size={11} strokeWidth={3} aria-hidden="true" />Called
						</span>
					{/if}
				</p>
				<p class={['mt-2 text-sm text-pretty whitespace-pre-line text-ink-2', collapsed && 'line-clamp-3']}>
					{tool.description || '(not registered when the snapshot was taken)'}
				</p>
				{#each calls as call, i (i)}
					<p
						class="mt-3 truncate rounded-lg bg-paper-2 px-2.5 py-1.5 font-mono text-xs"
						title="{call.name}({call.arguments})"
					>
						{call.name}({call.arguments})
					</p>
				{/each}
			</li>
		{/each}
	</ul>

	{#if hydrated}
		<button
			type="button"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
			class="mt-4 font-mono text-sm font-medium underline decoration-marker decoration-[3px] underline-offset-[5px] hover:decoration-ink"
		>
			{expanded
				? 'Show less'
				: hidden > 0
					? `Show all ${tools.tools.length} tools and full descriptions`
					: 'Show full descriptions'}
		</button>
	{/if}
</section>
