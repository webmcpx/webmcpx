<!--
	The fix, in two steps: 1. on your site (tabs: script tag, npm, coding agent), 2. in your agent
	(skipped by agents with WebMCP built in; tabs, one per client, then your coding agent).  Tabs list the most used first; the first one opens.
-->
<script lang="ts">
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import Bot from '@lucide/svelte/icons/bot';
	import { siClaude, siCursor, siGithubcopilot, siHtml5, siNpm, siWindsurf } from 'simple-icons';
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
		{ id: 'codex', label: 'Codex CLI', icon: SquareTerminal, snippet: code.mcpCodex, title: 'terminal' },
		{
			id: 'windsurf',
			label: 'Windsurf',
			icon: siWindsurf,
			snippet: code.mcpWindsurf,
			title: '~/.codeium/windsurf/mcp_config.json'
		},
		{
			id: 'agent',
			label: capital(m.alternatives.agent),
			icon: Bot,
			snippet: code.mcpPrompt,
			title: 'prompt'
		}
	]);
</script>

<Section id="fix" title={m.title} lead={m.lead} center>
	<ol class="mx-auto grid max-w-3xl gap-6 text-left">
		{#each [{ n: 1, step: m.steps.site }, { n: 2, step: m.steps.agent }] as { n, step } (n)}
			<li>
				<Reveal delay={(n - 1) * 90} class="rounded-card border-2 border-ink bg-card p-5 shadow-hard sm:p-6">
					<div class="flex items-center gap-3">
						<span
							class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-marker font-display text-lg font-bold"
							aria-hidden="true">{n}</span
						>
						<h3 class="font-display text-xl font-bold">{step.title}</h3>
					</div>
					{#if n === 1}
						<p class="mt-2 mb-4 text-sm text-pretty text-ink-2">
							{fmt(m.steps.site.lead, { tag: '</body>' })}
						</p>
						<CodeTabs label={step.title} tabs={install} />
					{:else}
						<p class="mt-2 text-sm text-pretty text-ink-2">{m.steps.agent.lead}</p>
						<p class="mt-3 mb-4 rounded-xl bg-paper-2 px-3.5 py-2.5 text-sm text-pretty text-ink">
							<Rich text={m.steps.agent.skip}
								>{#snippet docs()}<a
										class="font-medium underline decoration-marker decoration-2 underline-offset-4"
										href={OPENAI_DOCS}>{m.docs}</a
									>{/snippet}</Rich
							>
						</p>
						<CodeTabs label={step.title} tabs={agents} />
					{/if}
				</Reveal>
			</li>
		{/each}
	</ol>
	<p class="mt-8 text-center font-mono text-xs tracking-wider text-ink-3 uppercase">{m.facts}</p>
</Section>
