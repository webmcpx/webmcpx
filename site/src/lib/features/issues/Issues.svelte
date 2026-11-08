<!-- What the WebMCP community keeps asking for, each one shipped. Short: number, title, the fix. -->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Section from '#lib/components/ui/Section.svelte';
	import { ISSUES, issueUrl } from '#lib/content/issues.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';

	const i18n = useI18n();
	const m = $derived(i18n.m.issues);
</script>

<Section id="issues" kicker={m.kicker} title={m.title}>
	<!-- Seven cards on four columns: the first spans two, so both rows are full. -->
	<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each ISSUES as issue, i (issue.number)}
			<li class={['min-w-0', i === 0 && 'sm:col-span-2']}>
				<Reveal delay={(i % 3) * 70} class="h-full">
					<a
						href={issueUrl(issue.number)}
						class="group flex h-full flex-col gap-3 rounded-card border-2 border-ink bg-card p-5 transition-[translate,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-hard"
					>
						<span class="flex items-center justify-between">
							<span class="grid size-9 place-items-center rounded-full border-2 border-ink bg-marker">
								<issue.icon size={18} strokeWidth={2} aria-hidden="true" />
							</span>
							<span class="flex items-center font-mono text-xs text-ink-3 group-hover:text-ink">
								#{issue.number}<ArrowUpRight size={14} aria-hidden="true" />
							</span>
						</span>
						<span class="font-display text-lg leading-tight font-bold tracking-tight"
							>{m.items[issue.id].title}</span
						>
						<span class="text-sm text-ink-2">{m.items[issue.id].fix}</span>
					</a>
				</Reveal>
			</li>
		{/each}
	</ul>
</Section>
