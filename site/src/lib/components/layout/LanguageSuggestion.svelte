<!--
	On a first visit in English from a browser set to another site language, a small card at the bottom of
	the screen (clear of the logo and menu, in the design system's card style) offers that language, written in it. Never a redirect: shared links and crawlers get the page they asked for.
	Dismissing it (or switching) is remembered on this device.
-->
<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import { loadMessages } from '#lib/i18n/load.ts';
	import { localized, preferred, unlocalized, type LocaleCode } from '#lib/i18n/locales.ts';

	const i18n = useI18n();
	const KEY = 'webmcpx:language-suggestion';
	let offer: { code: LocaleCode; text: string; action: string; dismiss: string } | null = $state(null);

	const remember = () => {
		try {
			localStorage.setItem(KEY, 'done');
		} catch {
			// Storage may be blocked; the bar just comes back next visit.
		}
	};

	onMount(async () => {
		if (i18n.code !== 'en') return;
		try {
			if (localStorage.getItem(KEY)) return;
		} catch {
			return;
		}
		const code = preferred(navigator.languages ?? [navigator.language]);
		if (!code) return;
		const m = await loadMessages(code);
		offer = {
			code,
			text: m.layout.suggest.text,
			action: m.layout.suggest.action,
			dismiss: m.layout.suggest.dismiss
		};
	});
</script>

{#if offer}
	<aside
		lang={offer.code === 'pt-br' ? 'pt-BR' : offer.code === 'zh' ? 'zh-Hans' : offer.code}
		aria-label={offer.text}
		data-language-suggestion
		class="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-card border-2 border-ink bg-marker py-2.5 pr-2 pl-5 text-sm shadow-hard sm:bottom-5"
	>
		<span class="min-w-0 flex-1">{offer.text}</span>
		<a
			href={localized(unlocalized(page.url.pathname), offer.code)}
			onclick={remember}
			data-sveltekit-reload
			class="shrink-0 font-bold underline underline-offset-4">{offer.action}</a
		>
		<button
			type="button"
			onclick={() => {
				remember();
				offer = null;
			}}
			class="grid size-8 shrink-0 place-items-center rounded-full hover:bg-ink/10"
		>
			<X size={16} aria-hidden="true" />
			<span class="sr-only">{offer.dismiss}</span>
		</button>
	</aside>
{/if}
