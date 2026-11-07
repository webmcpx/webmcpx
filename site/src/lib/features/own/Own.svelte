<!--
	"Your own tools": the same tool written each way a site can, as tabs (most used first), then the
	command that shows it, with no browser flag.
-->
<script lang="ts">
	import { siHtml5, siJavascript, siReact, siSvelte, siVuedotjs, type SimpleIcon } from 'simple-icons';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { OWN_TABS, type Highlighted, type OwnId } from '#lib/content/snippets.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	let { samples, check }: { samples: Record<OwnId, Highlighted>; check: Highlighted } = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.own);
	const LOGOS: Record<OwnId, SimpleIcon> = {
		react: siReact,
		vue: siVuedotjs,
		svelte: siSvelte,
		js: siJavascript,
		form: siHtml5
	};
	const FILES: Record<OwnId, string> = {
		react: 'Cart.jsx',
		vue: 'Cart.vue',
		svelte: 'Cart.svelte',
		js: 'app.js',
		form: 'index.html'
	};
	const note = (id: OwnId) => (id === 'form' ? m.notes.form : id === 'js' ? m.notes.js : m.notes.hook);
	const tabs: CodeTab[] = $derived(
		(Object.keys(OWN_TABS) as OwnId[]).map((id) => ({
			id,
			label: OWN_TABS[id],
			icon: LOGOS[id],
			snippet: samples[id],
			title: FILES[id],
			note: note(id)
		}))
	);
</script>

<Section id="own" title={m.title} lead={m.lead} center>
	<Reveal class="mx-auto max-w-3xl text-left">
		<CodeTabs label={m.title} {tabs} />
		<p class="mt-8 text-sm font-medium text-ink-2">{m.check}</p>
		<CodeBlock snippet={check} title="terminal" class="mt-2" />
	</Reveal>
</Section>
