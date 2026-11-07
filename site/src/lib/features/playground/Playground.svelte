<script lang="ts">
	import { onMount } from 'svelte';
	import Section from './Section.svelte';

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

	onMount(() => {
		const doc = document as Document & { modelContext?: { registerTool: unknown } };
		native = Boolean(doc.modelContext);
		// Without native WebMCP, a demo host collects the tools so you can call them here.
		const demo = new Map<string, Tool>();
		if (!native) {
			Object.defineProperty(document, 'modelContext', {
				value: Object.freeze({
					registerTool: async (tool: Tool) => void demo.set(tool.name, tool)
				})
			});
		}
		let dispose = () => {};
		import('webmcpx').then(async ({ register }) => {
			const r = await register();
			dispose = r.dispose;
			tools = [...demo.values()].sort((a, b) => a.name.localeCompare(b.name));
		});
		return () => dispose();
	});

	function pick(name: string) {
		selected = name;
		input = EXAMPLES[name] ?? '{}';
		output = '';
	}

	async function run() {
		const tool = tools.find((t) => t.name === selected);
		if (!tool) return;
		running = true;
		try {
			const result = await tool.execute(JSON.parse(input || '{}'), {
				signal: new AbortController().signal
			});
			output = JSON.stringify(JSON.parse(result), null, 2);
		} catch (e) {
			output = `Invalid input: ${(e as Error).message}`;
		} finally {
			running = false;
		}
	}
</script>

<Section id="playground" eyebrow="Playground" title="This page runs webmcpx. Call its tools.">
	{#if native}
		<p class="text-zinc-600 dark:text-zinc-400">
			Your browser exposes WebMCP natively, so the tools are registered with it. Ask your agent to search
			this page.
		</p>
	{:else}
		<div class="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
			<div class="space-y-3">
				<div class="flex flex-wrap gap-2" role="tablist" aria-label="Tools">
					{#each tools as tool (tool.name)}
						<button
							type="button"
							role="tab"
							aria-selected={selected === tool.name}
							onclick={() => pick(tool.name)}
							class="rounded-full border px-3 py-1 font-mono text-xs transition {selected === tool.name
								? 'border-accent bg-accent/10 text-accent-ink dark:text-accent'
								: 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-700'}"
						>
							{tool.name}
						</button>
					{:else}
						<p class="text-sm text-zinc-500">Loading tools…</p>
					{/each}
				</div>
				<p class="min-h-10 text-sm text-zinc-600 dark:text-zinc-400">
					{tools.find((t) => t.name === selected)?.description}
				</p>
				<label class="block text-sm font-medium" for="tool-input">Input (JSON)</label>
				<textarea
					id="tool-input"
					bind:value={input}
					rows="4"
					spellcheck="false"
					class="w-full rounded-xl border border-zinc-300 bg-transparent p-3 font-mono text-sm dark:border-zinc-700"
				></textarea>
				<button
					type="button"
					onclick={run}
					disabled={running || tools.length === 0}
					class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				>
					{running ? 'Running…' : 'Run tool'}
				</button>
			</div>
			<div>
				<p class="mb-2 text-sm font-medium">What the agent gets</p>
				<pre
					class="h-80 overflow-auto rounded-xl bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100"
					aria-live="polite">{output || 'Run a tool to see its envelope.'}</pre>
			</div>
		</div>
	{/if}
</Section>
