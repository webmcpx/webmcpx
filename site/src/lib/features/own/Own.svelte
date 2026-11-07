<!--
	"Your own tools": the same tool written each way a site can (HTML form, JavaScript, React, Vue,
	Svelte), as tabs. Without JavaScript every panel shows, one after another.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { CHECK_COMMAND, OWN_TABS, type Highlighted, type OwnId } from '#lib/content/snippets.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';
	import Reveal from '#lib/motion/Reveal.svelte';

	let { samples }: { samples: Record<OwnId, Highlighted> } = $props();

	const i18n = useI18n();
	const m = $derived(i18n.m.own);
	const IDS = Object.keys(OWN_TABS) as OwnId[];
	const TITLES: Record<OwnId, string> = {
		form: 'index.html',
		js: 'app.js',
		react: 'Cart.jsx',
		vue: 'Cart.vue',
		svelte: 'Cart.svelte'
	};
	let active: OwnId = $state('form');
	// Before hydration (or without JavaScript) every panel shows.
	let hydrated = $state(false);
	onMount(() => (hydrated = true));
	const tabs: HTMLButtonElement[] = [];

	/** Arrow keys move between tabs (WAI-ARIA tabs pattern). */
	function key(event: KeyboardEvent, i: number) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = (i + step + IDS.length) % IDS.length;
		active = IDS[next];
		tabs[next]?.focus();
	}
	const note = (id: OwnId) => (id === 'form' ? m.notes.form : id === 'js' ? m.notes.js : m.notes.hook);
</script>

<Section id="own" title={m.title} lead={m.lead} center>
	<Reveal class="mx-auto max-w-3xl">
		<div role="tablist" aria-label={m.title} class="flex flex-wrap justify-center gap-2">
			{#each IDS as id, i (id)}
				<button
					bind:this={tabs[i]}
					id="own-tab-{id}"
					role="tab"
					type="button"
					aria-selected={active === id}
					aria-controls="own-panel-{id}"
					tabindex={active === id ? 0 : -1}
					onclick={() => (active = id)}
					onkeydown={(e) => key(e, i)}
					class={[
						'rounded-full border-2 border-ink px-4 py-1.5 font-mono text-sm font-medium transition',
						active === id ? 'bg-ink text-paper' : 'bg-card text-ink hover:bg-paper-2'
					]}>{OWN_TABS[id]}</button
				>
			{/each}
		</div>
		{#each IDS as id (id)}
			<div
				id="own-panel-{id}"
				role="tabpanel"
				aria-labelledby="own-tab-{id}"
				hidden={hydrated && active !== id}
				class="mt-5"
			>
				<CodeBlock snippet={samples[id]} title={TITLES[id]} class="code-wrap" />
				<p class="mt-3 text-left text-sm text-pretty text-ink-2">{note(id)}</p>
			</div>
		{/each}
		<p class="mt-6 text-sm text-ink-2">
			<Rich text={m.check}
				>{#snippet cmd()}<code
						class="rounded-md bg-paper-2 px-1.5 py-0.5 font-mono whitespace-nowrap text-ink"
						>{CHECK_COMMAND}</code
					>{/snippet}</Rich
			>
		</p>
	</Reveal>
</Section>
