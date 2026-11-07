<script lang="ts">
	import BotMessageSquare from '@lucide/svelte/icons/bot-message-square';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Plug from '@lucide/svelte/icons/plug';
	import Workflow from '@lucide/svelte/icons/workflow';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import IconTile from '#lib/components/ui/IconTile.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		scriptTag: Highlighted;
		agentCall: Highlighted;
		envelope: Highlighted;
		lintCommands: Highlighted;
	}

	let { scriptTag, agentCall, envelope, lintCommands }: Props = $props();

	const steps = $derived([
		{
			icon: Plug,
			title: 'Add one script',
			body: 'The loader registers get_page_context, search_page and fetch_as_markdown with the browser. The WebAssembly engine loads on the first call.',
			code: [{ snippet: scriptTag, title: 'index.html' }]
		},
		{
			icon: BotMessageSquare,
			title: 'Agents call standard tools',
			body: 'Every tool answers with the same envelope: data or a stable error code, plus truncation and paging. Nothing ever rejects.',
			code: [
				{ snippet: agentCall, title: 'tool call' },
				{ snippet: envelope, title: 'result' }
			]
		},
		{
			icon: ListChecks,
			title: 'Lint the tools you write',
			body: 'Your own registerTool() calls get checked in CI: names, descriptions, schemas, annotations, hidden characters.',
			code: [{ snippet: lintCommands, title: 'terminal' }]
		}
	]);
</script>

<Section
	id="how"
	eyebrow="How it works"
	icon={Workflow}
	title="Standard tools in, structured answers out."
	lead="No config, no build step. Pages that already register their own tools keep them; webmcpx adds the ones every site reinvents."
>
	<ol class="relative space-y-6">
		<!-- The rail that connects the steps on wide screens. -->
		<div
			aria-hidden="true"
			class="absolute top-8 bottom-8 left-8 hidden w-px bg-linear-to-b from-accent/60 via-border to-transparent lg:block"
		></div>
		{#each steps as step, i (step.title)}
			<li>
				<Reveal class="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 [&>*]:min-w-0">
					<div class="relative flex gap-5">
						<IconTile icon={step.icon} size="lg" />
						<div>
							<p class="font-mono text-xs text-subtle">Step {i + 1}</p>
							<h3 class="mt-1 text-2xl font-semibold tracking-tight">{step.title}</h3>
							<p class="mt-3 leading-relaxed text-muted">{step.body}</p>
						</div>
					</div>
					<div class="flex flex-col gap-3">
						{#each step.code as c (c.title)}
							<CodeBlock snippet={c.snippet} title={c.title} />
						{/each}
					</div>
				</Reveal>
			</li>
		{/each}
	</ol>
</Section>
