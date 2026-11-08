<!--
	Part 2 of "For your site" (rendered inside Fix): the site's own actions, the same tool written each way a
	site can, as tabs (your coding agent first).
-->
<script lang="ts">
	import Bot from '@lucide/svelte/icons/bot';
	import { siHtml5, siJavascript, siReact, siSvelte, siVuedotjs, type SimpleIcon } from 'simple-icons';
	import CodeTabs, { type CodeTab } from '#lib/components/ui/CodeTabs.svelte';
	import { OWN_TABS, type Highlighted, type OwnId } from '#lib/content/snippets.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	let { samples }: { samples: Record<OwnId, Highlighted> } = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.own);
	const LOGOS: Record<Exclude<OwnId, 'agent'>, SimpleIcon> = {
		react: siReact,
		vue: siVuedotjs,
		svelte: siSvelte,
		js: siJavascript,
		form: siHtml5
	};
	const FILES: Record<Exclude<OwnId, 'agent'>, string> = {
		react: 'Cart.jsx',
		vue: 'Cart.vue',
		svelte: 'Cart.svelte',
		js: 'app.js',
		form: 'index.html'
	};
	const note = (id: Exclude<OwnId, 'agent'>) =>
		id === 'form' ? m.notes.form : id === 'js' ? m.notes.js : m.notes.hook;
	const label = $derived(i18n.m.fix.alternatives.agent);
	// Your coding agent first: knowing which tools to add is the hard part, and it works that out.
	const tabs: CodeTab[] = $derived([
		{
			id: 'agent',
			label: label.charAt(0).toLocaleUpperCase(i18n.code) + label.slice(1),
			icon: Bot,
			snippet: samples.agent,
			title: 'prompt',
			note: m.notes.agent
		},
		...(Object.keys(OWN_TABS) as Exclude<OwnId, 'agent'>[]).map((id) => ({
			id,
			label: OWN_TABS[id],
			icon: LOGOS[id],
			snippet: samples[id],
			title: FILES[id],
			note: note(id)
		}))
	]);
</script>

<div id="own" class="mt-14 max-w-3xl scroll-mt-20">
	<Reveal>
		<h3 class="flex items-baseline gap-3 font-display text-2xl font-bold">
			<span class="font-mono text-base text-ink-3" aria-hidden="true">2</span>{m.title}
		</h3>
		<p class="mt-2 mb-5 text-pretty text-ink-2">{m.lead}</p>
		<CodeTabs label={m.title} {tabs} />
	</Reveal>
</div>
