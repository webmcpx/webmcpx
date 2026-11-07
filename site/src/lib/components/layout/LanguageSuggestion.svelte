<!--
	On a first visit in English from a browser set to another site language, a quiet bar offers that
	language, written in it. Never a redirect: shared links and crawlers get the page they asked for.
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
		class="relative z-40 flex items-center justify-center gap-3 border-b-2 border-ink bg-marker px-12 py-2 text-sm"
	>
		<span>{offer.text}</span>
		<a
			href={localized(unlocalized(page.url.pathname), offer.code)}
			onclick={remember}
			class="font-bold underline underline-offset-4">{offer.action}</a
		>
		<button
			type="button"
			onclick={() => {
				remember();
				offer = null;
			}}
			class="absolute right-3 grid size-8 place-items-center rounded-full hover:bg-ink/10"
		>
			<X size={16} aria-hidden="true" />
			<span class="sr-only">{offer.dismiss}</span>
		</button>
	</aside>
{/if}
