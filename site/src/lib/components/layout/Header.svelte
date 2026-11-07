<!--
	The site header: logo, the section menu, the language switcher and GitHub. On wide screens the menu is a
	framed pill with an icon per link, and the section in view is marked (`aria-current`). On phones a
	<details> menu opens the same links, so it works before (and without) JavaScript. The language
	switcher is a <details> list too, in the pill and in the phone menu: each language links to this page
	in that language (a full page load, so <html lang> and fonts follow).
-->
<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import Globe from '@lucide/svelte/icons/globe';
	import Lightbulb from '@lucide/svelte/icons/lightbulb';
	import Menu from '@lucide/svelte/icons/menu';
	import Scale from '@lucide/svelte/icons/scale';
	import Terminal from '@lucide/svelte/icons/terminal';
	import X from '@lucide/svelte/icons/x';
	import { siGithub } from 'simple-icons';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, type Component } from 'svelte';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { REPO, VERSION } from '#lib/content/site.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import { LOCALES, localized, unlocalized } from '#lib/i18n/locales.ts';
	import Logo from './Logo.svelte';

	interface Item {
		label: string;
		href: string;
		icon: Component;
		/** The landing section this link scrolls to; external links have none. */
		section?: string;
	}

	const i18n = useI18n();
	const m = $derived(i18n.m.header);
	const home = $derived(i18n.href('/'));
	const NAV: Item[] = $derived([
		// In page order: the fix comes right after the logos.
		{ label: m.links.fix, href: `${home}#fix`, icon: Terminal, section: 'fix' },
		{ label: m.links.why, href: `${home}#why`, icon: Lightbulb, section: 'why' },
		{ label: m.links.proof, href: `${home}#proof`, icon: ChartColumn, section: 'proof' },
		{ label: m.links.vsMcp, href: `${home}#vs-mcp`, icon: Scale, section: 'vs-mcp' },
		{ label: m.links.issues, href: `${home}#issues`, icon: CircleDot, section: 'issues' },
		{ label: m.links.docs, href: `${REPO}#readme`, icon: BookOpen }
	]);
	/** This page in every language (the English path is the shared key). */
	const english = $derived(unlocalized(page.url.pathname));

	/** The landing section in view, if any (sections absent from this page are ignored). */
	let current: string | undefined = $state();
	let menu: HTMLDetailsElement | undefined = $state();

	// Rebuilt after every navigation: the header outlives pages, and each page has its own sections.
	let io: IntersectionObserver | undefined;
	function observe() {
		io?.disconnect();
		current = undefined;
		const sections = NAV.flatMap((i) => (i.section ? [document.getElementById(i.section)] : [])).filter(
			(s): s is HTMLElement => s !== null
		);
		if (!sections.length) return;
		// A section counts as current while it crosses the band 30-40% down the viewport.
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) current = e.target.id;
					else if (current === e.target.id) current = undefined;
				}
			},
			{ rootMargin: '-30% 0px -60% 0px' }
		);
		for (const s of sections) io.observe(s);
	}
	afterNavigate((nav) => {
		// Same page, new hash: the sections are the same ones.
		if (nav.type === 'enter' || nav.from?.url.pathname !== nav.to?.url.pathname) observe();
	});
	onDestroy(() => io?.disconnect());
</script>

<!-- The languages, by their own names, each linking to this page in that language. -->
{#snippet languages(listClass: string)}
	<ul class={listClass}>
		{#each LOCALES as l (l.code)}
			<li>
				<a
					href={localized(english, l.code)}
					hreflang={l.tag}
					lang={l.tag}
					data-sveltekit-reload
					aria-current={l.code === i18n.code ? 'true' : undefined}
					class="flex items-center rounded-xl px-3 py-2 font-medium text-ink-2 hover:bg-marker hover:text-ink aria-[current=true]:bg-ink aria-[current=true]:text-paper"
					>{l.name}</a
				>
			</li>
		{/each}
	</ul>
{/snippet}

<header class="absolute inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-5">
	<nav aria-label={m.nav} class="mx-auto flex h-16 items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
		<div class="flex items-center gap-3">
			<a href={home} class="rounded-lg"><Logo /><span class="sr-only">{m.home}</span></a>
			<Stamp size="sm" class="hidden sm:inline-flex">v{VERSION}</Stamp>
		</div>

		<ul
			class="hidden items-center gap-0.5 rounded-full border-2 border-ink bg-card p-1 shadow-hard-sm lg:flex"
		>
			{#each NAV as item (item.href)}
				<li>
					<a
						href={item.href}
						aria-current={item.section && current === item.section ? 'true' : undefined}
						class="group flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[15px] font-medium whitespace-nowrap text-ink-2 transition hover:bg-marker hover:text-ink aria-[current=true]:bg-ink aria-[current=true]:text-paper xl:px-3.5"
					>
						<item.icon size={16} strokeWidth={2.25} aria-hidden="true" />
						{item.label}
						{#if !item.section}<ArrowUpRight
								size={14}
								strokeWidth={2.5}
								class="-ml-0.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								aria-hidden="true"
							/>{/if}
					</a>
				</li>
			{/each}
			<li>
				<details class="group/lang relative">
					<!-- Compact: the globe and the current language's code; the list names every language. -->
					<summary
						class="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 font-mono text-xs font-semibold text-ink-2 uppercase transition group-open/lang:bg-marker group-open/lang:text-ink hover:bg-marker hover:text-ink xl:px-3 [&::-webkit-details-marker]:hidden"
					>
						<Globe size={16} strokeWidth={2.25} aria-hidden="true" />
						<span aria-hidden="true">{i18n.code}</span>
						<span class="sr-only">{m.language}</span>
					</summary>
					{@render languages(
						'absolute right-0 mt-3 w-56 rounded-card border-2 border-ink bg-card p-2 shadow-hard'
					)}
				</details>
			</li>
		</ul>

		<div class="flex items-center gap-2">
			<Button href={REPO} variant="outline" size="sm"><BrandIcon icon={siGithub} size={16} />GitHub</Button>
			<details bind:this={menu} class="group relative lg:hidden">
				<summary
					class="grid size-10 cursor-pointer list-none place-items-center rounded-full border-2 border-ink bg-card shadow-hard-sm [&::-webkit-details-marker]:hidden"
				>
					<Menu size={18} class="group-open:hidden" aria-hidden="true" />
					<X size={18} class="hidden group-open:block" aria-hidden="true" />
					<span class="sr-only">{m.menu}</span>
				</summary>
				<div class="absolute right-0 mt-3 w-56 rounded-card border-2 border-ink bg-card p-2 shadow-hard">
					<ul>
						{#each NAV as item (item.href)}
							<li>
								<a
									href={item.href}
									onclick={() => menu?.removeAttribute('open')}
									class="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink-2 hover:bg-marker hover:text-ink"
								>
									<item.icon size={18} strokeWidth={2.25} aria-hidden="true" />
									{item.label}
									{#if !item.section}<ArrowUpRight size={14} class="ml-auto" aria-hidden="true" />{/if}
								</a>
							</li>
						{/each}
					</ul>
					<details class="group/lang mt-1 border-t-2 border-hairline pt-1">
						<summary
							class="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink-2 hover:bg-marker hover:text-ink [&::-webkit-details-marker]:hidden"
						>
							<Globe size={18} strokeWidth={2.25} aria-hidden="true" />
							{m.language}
							<span class="ml-auto font-mono text-xs uppercase">{i18n.code}</span>
							<ChevronDown size={14} class="transition group-open/lang:rotate-180" aria-hidden="true" />
						</summary>
						{@render languages('mt-1')}
					</details>
				</div>
			</details>
		</div>
	</nav>
</header>
