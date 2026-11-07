<!--
	WebMCP vs MCP: a fair comparison (data and sources in `content/versus.ts`). A table on wide screens;
	on phones each row stacks, with the column name shown beside each value (hidden from screen readers,
	which get the table headers).
-->
<script lang="ts">
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { VERSUS, VERSUS_SOURCES } from '#lib/content/versus.ts';
	import { sourceLabel } from '#lib/content/why.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';

	const i18n = useI18n();
	const m = $derived(i18n.m.versus);
</script>

<Section id="vs-mcp" kicker={m.kicker} title={m.title} lead={m.lead}>
	<div class="overflow-hidden rounded-card border-2 border-ink bg-card shadow-hard">
		<table class="w-full text-left text-[15px]">
			<caption class="sr-only">{m.caption}</caption>
			<thead class="max-md:sr-only">
				<tr class="border-b-2 border-ink">
					<th
						scope="col"
						class="w-[20%] p-5 font-mono text-xs font-medium tracking-widest text-ink-3 uppercase"
						><span class="sr-only">{m.aspect}</span></th
					>
					<th scope="col" class="w-[40%] p-5"><Stamp tone="marker">WebMCP</Stamp></th>
					<th scope="col" class="w-[40%] p-5"><Stamp tone="plain">MCP</Stamp></th>
				</tr>
			</thead>
			<tbody>
				{#each VERSUS as id (id)}
					{@const row = m.rows[id]}
					<tr class="border-b border-hairline last:border-0 max-md:grid max-md:gap-3 max-md:p-5">
						<th
							scope="row"
							class="p-5 align-top font-mono text-xs font-medium tracking-widest text-ink-3 uppercase max-md:p-0"
							>{row.label}</th
						>
						<td class="p-5 align-top text-pretty max-md:p-0">
							<span class="mb-1 block font-display text-sm font-bold md:hidden" aria-hidden="true"
								>WebMCP</span
							>
							{row.webmcp}
						</td>
						<td class="p-5 align-top text-pretty text-ink-2 max-md:p-0">
							<span class="mb-1 block font-display text-sm font-bold text-ink md:hidden" aria-hidden="true"
								>MCP</span
							>
							{row.mcp}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="mt-8 rounded-card border-2 border-ink bg-marker p-6 sm:p-7">
		<p class="font-mono text-[11px] tracking-widest uppercase">{m.useBoth}</p>
		<p class="mt-2 font-display text-xl font-bold text-pretty sm:text-2xl">{m.verdict}</p>
	</div>
	<p class="mt-6 font-mono text-[11px] leading-relaxed text-ink-3">
		<span class="tracking-widest uppercase">{i18n.m.sources.title}</span>
		{#each VERSUS_SOURCES as s, i (s.href)}
			{#if i}<span class="mx-1" aria-hidden="true">·</span>{/if}
			<a
				href={s.href}
				class="text-ink-2 underline decoration-hairline underline-offset-2 hover:text-ink hover:decoration-ink"
				>{sourceLabel(s, i18n.m)}</a
			>
		{/each}
	</p>
</Section>
