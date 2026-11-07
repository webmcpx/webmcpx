<!--
	Loads webmcpx on this very page and lets the reader call its tools. Without native WebMCP, a tiny demo
	host (frozen, like some real ones) collects the registered tools so they can run here.
-->
<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Play from '@lucide/svelte/icons/play';
	import Terminal from '@lucide/svelte/icons/terminal';
	import { onMount } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CopyButton from '#lib/components/ui/CopyButton.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Tool {
		name: string;
		description: string;
		execute: (input: unknown, client: { signal: AbortSignal }) => Promise<string>;
	}

	const EXAMPLES: Record<string, string> = {
		search_page: '{ "query": "frozen host", "limit": 2 }',
		fetch_as_markdown: '{ "max_chars": 600 }',
		get_page_context: '{}'
	};

	let tools = $state<Tool[]>([]);
	let native = $state(false);
	let selected = $state('search_page');
	let input = $state(EXAMPLES.search_page);
	let output = $state('');
	let running = $state(false);
	const tool = $derived(tools.find((t) => t.name === selected));
	const items = $derived(tools.map((t) => ({ id: t.name, label: t.name })));

	onMount(() => {
		const doc = document as Document & { modelContext?: { registerTool: unknown } };
		native = Boolean(doc.modelContext);
		const demo: Tool[] = [];
		if (!native) {
			Object.defineProperty(document, 'modelContext', {
				value: Object.freeze({ registerTool: async (t: Tool) => void demo.push(t) })
			});
		}
		let dispose = () => {};
		import('webmcpx').then(async ({ register }) => {
			const r = await register();
			dispose = r.dispose;
			tools = [...demo].sort((a, b) => a.name.localeCompare(b.name));
		});
		return () => dispose();
	});

	$effect(() => {
		// A new tool resets the example input and the previous result.
		input = EXAMPLES[selected] ?? '{}';
		output = '';
	});

	async function run() {
		if (!tool) return;
		running = true;
		try {
			const result = await tool.execute(JSON.parse(input || '{}'), { signal: new AbortController().signal });
			output = JSON.stringify(JSON.parse(result), null, 2);
		} catch (e) {
			output = `Invalid input: ${(e as Error).message}`;
		} finally {
			running = false;
		}
	}
</script>

<Section
	id="playground"
	eyebrow="Playground"
	icon={Terminal}
	title="This page runs webmcpx. Call its tools."
	lead="The same loader you would ship, registering the same tools. Pick one, edit the input, and see exactly what an agent receives."
>
	{#if native}
		<Card padding="lg">
			<p class="text-muted">
				Your browser exposes WebMCP natively, so the tools are registered with it. Ask your agent to search
				this page.
			</p>
		</Card>
	{:else}
		<Reveal>
			<Card padding="none" class="overflow-hidden">
				<div class="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
					<span class="relative flex size-2.5">
						{#if tools.length}
							<span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"
							></span>
						{/if}
						<span
							class="relative inline-flex size-2.5 rounded-full {tools.length ? 'bg-accent' : 'bg-subtle'}"
						></span>
					</span>
					<span class="text-sm text-muted" aria-live="polite">
						{tools.length ? `${tools.length} tools registered on this page` : 'Loading webmcpx…'}
					</span>
				</div>
				<div class="grid lg:grid-cols-2 [&>*]:min-w-0">
					<div class="flex flex-col gap-4 border-b border-border p-4 sm:p-6 lg:border-r lg:border-b-0">
						{#if items.length}
							<Tabs {items} bind:value={selected} label="Tools" listClass="flex-wrap font-mono">
								{#snippet panel()}
									<p class="mt-3 min-h-16 text-sm leading-relaxed text-muted">{tool?.description}</p>
								{/snippet}
							</Tabs>
						{/if}
						<label class="text-sm font-medium" for="tool-input">Input (JSON)</label>
						<textarea
							id="tool-input"
							bind:value={input}
							rows="4"
							spellcheck="false"
							class="w-full rounded-xl border border-border-strong bg-bg p-3 font-mono text-sm transition focus:border-accent"
						></textarea>
						<Button variant="primary" onclick={run} disabled={running || !tool} class="self-start">
							{#if running}<LoaderCircle class="animate-spin" aria-hidden="true" />{:else}<Play
									aria-hidden="true"
								/>{/if}
							{running ? 'Running…' : 'Run tool'}
						</Button>
					</div>
					<div class="flex min-h-80 flex-col bg-code">
						<div class="flex h-11 items-center justify-between border-b border-border pr-1.5 pl-4">
							<span class="font-mono text-xs text-subtle">what the agent gets</span>
							{#if output}<CopyButton text={output} label="Copy result" />{/if}
						</div>
						<pre
							class="max-h-96 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-muted"
							aria-live="polite">{output || 'Run a tool to see its envelope.'}</pre>
					</div>
				</div>
			</Card>
		</Reveal>
	{/if}
</Section>
