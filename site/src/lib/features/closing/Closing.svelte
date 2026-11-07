<!-- The closing call: the same scan as the hero, for whoever read the whole page. The result shows up top. -->
<script lang="ts">
	import Section from '#lib/components/ui/Section.svelte';
	import ScanForm from '#lib/features/scan/ScanForm.svelte';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	const i18n = useI18n();
	const m = $derived(i18n.m.closing);
</script>

<Section id="scan-now" title={m.title} lead={m.lead} center>
	<Reveal>
		<ScanForm size="md" />
	</Reveal>
</Section>
