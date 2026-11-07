<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import Code from '@lucide/svelte/icons/code';
	import Package from '@lucide/svelte/icons/package';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import type { Component } from 'svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';

	interface Props {
		scriptTag: Highlighted;
		npm: Highlighted;
		agent: Highlighted;
		cli: Highlighted;
	}

	let { scriptTag, npm, agent, cli }: Props = $props();

	const items: { id: string; label: string; title: string; icon: Component; snippet: Highlighted }[] =
		$derived([
			{ id: 'script', label: 'Script tag', title: 'index.html', icon: Code, snippet: scriptTag },
			{ id: 'npm', label: 'npm', title: 'app.js', icon: Package, snippet: npm },
			{ id: 'agent', label: 'Your agent', title: 'terminal', icon: Bot, snippet: agent },
			{ id: 'cli', label: 'Linter', title: 'terminal', icon: SquareTerminal, snippet: cli }
		]);
</script>

<Tabs {items} label="Install" listClass="mb-3 sm:justify-center">
	{#snippet tab(item)}
		<item.icon aria-hidden="true" />{item.label}
	{/snippet}
	{#snippet panel(item)}
		<CodeBlock snippet={item.snippet} title={item.title} class="text-left shadow-glow" />
	{/snippet}
</Tabs>
