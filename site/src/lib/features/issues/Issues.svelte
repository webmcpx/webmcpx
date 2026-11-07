<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Bug from '@lucide/svelte/icons/bug';
	import Card from '#lib/components/ui/Card.svelte';
	import IconTile from '#lib/components/ui/IconTile.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { ISSUES, issueUrl } from '#lib/content/issues.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
</script>

<Section
	id="issues"
	eyebrow="From the spec tracker"
	icon={Bug}
	title="What developers asked for, built and tested."
	lead="The WebMCP group keeps its tracker for the spec itself, so tooling ideas land elsewhere. This is that elsewhere."
>
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each ISSUES as issue, i (issue.number)}
			<!-- Seven cards on a 3-column grid: the first and last span two, so every row is full. -->
			<li class={['min-w-0', (i === 0 || i === ISSUES.length - 1) && 'lg:col-span-2']}>
				<Reveal delay={(i % 3) * 80} class="h-full">
					<Card interactive padding="lg" class="flex h-full flex-col">
						<div class="flex items-start justify-between gap-4">
							<IconTile icon={issue.icon} size="lg" />
							<a
								href={issueUrl(issue.number)}
								class="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted transition hover:border-accent/50 hover:text-accent-ink"
							>
								#{issue.number}<ArrowUpRight size={12} aria-hidden="true" />
								<span class="sr-only">(WebMCP issue on GitHub)</span>
							</a>
						</div>
						<h3 class="mt-6 text-lg font-semibold">{issue.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-subtle">{issue.pain}</p>
						<p class="mt-4 flex gap-2 border-t border-border pt-4 text-sm leading-relaxed">
							<CircleCheck size={16} class="mt-0.5 shrink-0 text-accent-ink" aria-hidden="true" />
							<span>{issue.fix}</span>
						</p>
					</Card>
				</Reveal>
			</li>
		{/each}
	</ul>
</Section>
