<!--
	The fix: how to add it (tabs: script tag, npm, coding agent), how to see it work in an agent (tabs,
	one per client), and what it gives agents. Tabs list the most used first; the first one opens.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import Bot from '@lucide/svelte/icons/bot';
	import { siClaude, siCursor, siGithubcopilot, siHtml5, siNpm, siWindsurf } from 'simple-icons';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import type { Highlighted, SnippetId } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	let { code }: { code: Record<SnippetId, Highlighted> } = $props();
	const OPENAI_DOCS = 'https://learn.chatgpt.com/docs/webmcp';

	const i18n = useI18n();
	const m = $derived(i18n.m.fix);
	/** The standard tools the script registers (what each does: `fix.gives.<tool>`). */
	const GIVES = ['search_page', 'fetch_as_markdown', 'get_page_context'] as const;
	const capital = (s: string) => s.charAt(0).toLocaleUpperCase(i18n.code) + s.slice(1);

	const install: CodeTab[] = $derived([
		{ id: 'html', label: 'HTML', icon: siHtml5, snippet: code.scriptTag, title: 'index.html' },
		{ id: 'npm', label: 'npm', icon: siNpm, snippet: code.npmUsage, title: 'app.js' },
		{
			id: 'agent',
			label: capital(m.alternatives.agent),
			icon: Bot,
			snippet: code.agentPrompt,
			title: 'prompt'
		}
	]);
	// Clients by how widely their editor or CLI is used; each with its own MCP setup.
	const agents: CodeTab[] = $derived([
		{ id: 'vscode', label: 'VS Code', icon: siGithubcopilot, snippet: code.mcpVscode, title: 'terminal' },
		{ id: 'cursor', label: 'Cursor', icon: siCursor, snippet: code.mcpCursor, title: '.cursor/mcp.json' },
		{ id: 'claude', label: 'Claude Code', icon: siClaude, snippet: code.agentMcp, title: 'terminal' },
		{ id: 'codex', label: 'Codex', icon: SquareTerminal, snippet: code.mcpCodex, title: 'terminal' },
		{
			id: 'windsurf',
			label: 'Windsurf',
			icon: siWindsurf,
			snippet: code.mcpWindsurf,
			title: '~/.codeium/windsurf/mcp_config.json'
		}
	]);
</script>

<Section id="fix" title={m.title} lead={fmt(m.lead, { tag: '</body>' })} center>
	<Reveal class="mx-auto max-w-3xl text-left">
		<CodeTabs label={m.title} tabs={install} />
		<div class="mt-10 rounded-card border-2 border-dashed border-ink/40 p-5 text-sm text-ink-2 sm:p-6">
			<p class="font-display text-base font-bold text-ink">{m.see.title}</p>
			<p class="mt-1.5 mb-4 text-pretty">{m.see.lead}</p>
			<CodeTabs label={m.see.title} tabs={agents} />
			<p class="mt-6 font-medium">{m.see.check}</p>
			<CodeBlock snippet={code.checkTools} title="terminal" class="mt-2" />
			<p class="mt-4 text-pretty">
				<Rich text={m.see.native}
					>{#snippet docs()}<a
							class="font-medium text-ink underline decoration-marker decoration-2 underline-offset-4"
							href={OPENAI_DOCS}>{m.see.docs}</a
						>{/snippet}</Rich
				>
			</p>
		</div>
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
	<p class="mt-8 text-center font-mono text-xs tracking-wider text-ink-3 uppercase">{m.facts}</p>
</Section>
