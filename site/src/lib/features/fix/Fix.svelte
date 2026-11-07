<!-- The fix, in one line, and what it gives agents. -->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { ALTERNATIVES, type Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	let { scriptTag }: { scriptTag: Highlighted } = $props();

	const GIVES = [
		{ tool: 'search_page', what: 'finds the passage' },
		{ tool: 'fetch_as_markdown', what: 'reads the page, paged' },
		{ tool: 'get_page_context', what: 'knows where it is' }
	];
</script>

<Section
	id="fix"
	title="One line. Agent-ready."
	lead="Paste it before </body>. Where WebMCP is missing, it does nothing."
	center
>
	<Reveal class="mx-auto max-w-3xl">
		<CodeBlock snippet={scriptTag} title="index.html" />
		<p class="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-ink-2">
			{#each ALTERNATIVES as alt (alt.label)}
				<span
					>or <code class="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono text-ink">{alt.code}</code> for {alt.label}</span
				>
			{/each}
		</p>
	</Reveal>
	<ul class="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
		{#each GIVES as g, i (g.tool)}
			<li>
				<Reveal
					delay={i * 90}
					class="flex h-full flex-col items-center gap-2 rounded-card border-2 border-ink bg-card p-5 text-center"
				>
					<span class="grid size-9 place-items-center rounded-full border-2 border-ink bg-good-soft">
						<Check size={18} strokeWidth={3} aria-hidden="true" />
					</span>
					<code class="font-mono text-sm font-semibold">{g.tool}</code>
					<span class="text-sm text-ink-2">{g.what}</span>
				</Reveal>
			</li>
		{/each}
	</ul>
	<p class="mt-8 text-center font-mono text-xs tracking-wider text-ink-3 uppercase">
		~2.7 KB on load · Rust + WebAssembly · MIT license
	</p>
</Section>
