<!--
	Short answers to what people ask about WebMCP, in plain text: readable without JavaScript, and the same
	text is published as FAQPage structured data (see faqJsonLd), so search and answer engines can quote it.
-->
<script lang="ts">
	import Section from '#lib/components/ui/Section.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	const i18n = useI18n();
	const m = $derived(i18n.m.faq);
</script>

<Section id="faq" kicker={m.kicker} title={m.title}>
	<dl class="grid max-w-4xl gap-x-10 gap-y-8 md:grid-cols-2">
		{#each Object.entries(m.items) as [id, item], i (id)}
			<Reveal delay={(i % 2) * 70}>
				<dt class="font-display text-lg leading-tight font-bold">{item.q}</dt>
				<dd class="mt-2 text-pretty text-ink-2">{item.a}</dd>
			</Reveal>
		{/each}
	</dl>
</Section>
