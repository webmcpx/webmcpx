<script lang="ts">
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { LINT_OUTPUT, type Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { lines, type Tone } from './diagnostics.ts';

	let { source, commands }: { source: Highlighted; commands: Highlighted } = $props();

	const TONE: Record<Tone, string> = {
		error: 'text-danger',
		warning: 'text-warn',
		snippet: 'text-subtle',
		summary: 'font-semibold text-fg',
		plain: ''
	};
</script>

<Section
	id="lint"
	eyebrow="Lint"
	icon={ScanSearch}
	title="Catch broken tools before agents do."
	lead="webmcpx lint finds registerTool() calls in JS and TS, and WebMCP manifests. JSON and SARIF output for CI and agents; exit codes 0, 1 and 2."
>
	<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
		<Reveal class="h-full"><CodeBlock snippet={source} title="tools.js" class="h-full" /></Reveal>
		<Reveal delay={80} class="h-full"><CodeBlock snippet={commands} title="terminal" class="h-full" /></Reveal
		>
		<Reveal delay={160} class="lg:col-span-2">
			<Card padding="none" class="h-full overflow-hidden bg-code">
				<div class="flex h-11 items-center justify-between border-b border-border px-4">
					<span class="font-mono text-xs text-subtle">$ webmcpx lint tools.js</span>
					<span class="font-mono text-xs text-danger">exit 1</span>
				</div>
				<pre class="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed"><code
						>{#each lines(LINT_OUTPUT) as line, i (i)}<span class={TONE[line.tone]}>{`${line.text}\n`}</span
							>{/each}</code
					></pre>
			</Card>
		</Reveal>
	</div>
</Section>
