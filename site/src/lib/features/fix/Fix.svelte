<!-- The fix, in one line, and what it gives agents. -->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { ALTERNATIVES, type Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	let { scriptTag, agentPrompt }: { scriptTag: Highlighted; agentPrompt: Highlighted } = $props();
	const OPENAI_DOCS = 'https://learn.chatgpt.com/docs/webmcp';

	const i18n = useI18n();
	const m = $derived(i18n.m.fix);
	/** The standard tools the script registers (what each does: `fix.gives.<tool>`). */
	const GIVES = ['search_page', 'fetch_as_markdown', 'get_page_context'] as const;
</script>

<Section id="fix" title={m.title} lead={fmt(m.lead, { tag: '</body>' })} center>
	<Reveal class="mx-auto max-w-3xl">
		<CodeBlock snippet={scriptTag} title="index.html" />
		<p class="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-ink-2">
			{#each ALTERNATIVES as alt (alt.id)}
				<span
					><Rich text={fmt(m.alternative, { label: m.alternatives[alt.id] })}
						>{#snippet code()}<code class="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono text-ink"
								>{alt.code}</code
							>{/snippet}</Rich
					></span
				>
			{/each}
		</p>
		<div
			class="mt-8 rounded-card border-2 border-dashed border-ink/40 p-5 text-left text-sm text-ink-2 sm:p-6"
		>
			<p class="font-display text-base font-bold text-ink">{m.see.title}</p>
			<ul class="mt-2 list-disc space-y-1.5 pl-5">
				<li>
					<Rich text={m.see.chatgpt}
						>{#snippet docs()}<a
								class="font-medium text-ink underline decoration-marker decoration-2 underline-offset-4"
								href={OPENAI_DOCS}>{m.see.docs}</a
							>{/snippet}</Rich
					>
				</li>
				<li>
					<Rich text={m.see.chrome}
						>{#snippet flag()}<code class="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono text-ink"
								>chrome://flags/#enable-webmcp-testing</code
							>{/snippet}</Rich
					>
				</li>
				<li>
					<Rich text={m.see.live}
						>{#snippet meta()}<code class="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono text-ink"
								>&lt;meta http-equiv="origin-trial"&gt;</code
							>{/snippet}</Rich
					>
				</li>
			</ul>
		</div>
		<p class="mt-8 text-left text-sm font-medium text-ink-2">{m.agent}</p>
		<CodeBlock
			snippet={agentPrompt}
			title="prompt"
			class="code-wrap mt-2"
		/>
	</Reveal>
	<ul class="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
		{#each GIVES as tool, i (tool)}
			<li>
				<Reveal
					delay={i * 90}
					class="flex h-full flex-col items-center gap-2 rounded-card border-2 border-ink bg-card p-5 text-center"
				>
					<span class="grid size-9 place-items-center rounded-full border-2 border-ink bg-good-soft">
						<Check size={18} strokeWidth={3} aria-hidden="true" />
					</span>
					<code class="font-mono text-sm font-semibold">{tool}</code>
					<span class="text-sm text-ink-2">{m.gives[tool]}</span>
				</Reveal>
			</li>
		{/each}
	</ul>
	<p class="mt-8 text-center font-mono text-xs tracking-wider text-ink-3 uppercase">
		{m.facts}
	</p>
</Section>
