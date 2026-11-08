<!--
	The site footer: an ink panel (the hero's paper frame, inverted) with the project line, three columns of
	links stacked one per line with their icons, the giant lockup, and the license and trademark notices.
-->
<script lang="ts">
	import { BADGES } from '#lib/features/scan/scan.ts';
	import AppWindow from '@lucide/svelte/icons/app-window';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Bot from '@lucide/svelte/icons/bot';
	import Bug from '@lucide/svelte/icons/bug';
	import ChartColumn from '@lucide/svelte/icons/chart-no-axes-column';
	import FileText from '@lucide/svelte/icons/file-text';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Package from '@lucide/svelte/icons/package';
	import Palette from '@lucide/svelte/icons/palette';
	import Scale from '@lucide/svelte/icons/scale';
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import ScrollText from '@lucide/svelte/icons/scroll-text';
	import { siGithub, siNpm } from 'simple-icons';
	import type { Component } from 'svelte';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import { NPM, REPO, SPEC, SPEC_ISSUES } from '#lib/content/site.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Logo from './Logo.svelte';

	type Icon = { lucide: Component } | { brand: typeof siGithub };
	interface Link {
		label: string;
		href: string;
		icon: Icon;
	}

	const i18n = useI18n();
	const FLAT_BADGE = BADGES.find((b) => b.id === 'flat')?.svg ?? '';
	const m = $derived(i18n.m.footer);
	const home = $derived(i18n.href('/'));
	// Product and site names (GitHub, npm, crates.io) are not translated.
	const COLUMNS: { title: string; links: Link[] }[] = $derived([
		{
			title: m.columns.product,
			links: [
				{ label: m.links.scan, href: `${home}#scan`, icon: { lucide: ScanSearch } },
				{ label: m.links.proof, href: `${home}#leaderboard`, icon: { lucide: ChartColumn } },
				{ label: m.links.agents, href: `${home}#for-agents`, icon: { lucide: Bot } },
				{ label: m.links.sites, href: `${home}#for-sites`, icon: { lucide: AppWindow } },
				{ label: m.links.issues, href: `${home}#issues`, icon: { lucide: Bug } },
				{ label: m.links.verdicts, href: i18n.href('/verdicts/'), icon: { lucide: ListChecks } }
			]
		},
		{
			title: m.columns.project,
			links: [
				{ label: 'GitHub', href: REPO, icon: { brand: siGithub } },
				{ label: 'npm', href: NPM, icon: { brand: siNpm } },
				{ label: 'crates.io', href: 'https://crates.io/crates/webmcpx', icon: { lucide: Package } },
				{ label: m.links.brand, href: i18n.href('/brand/'), icon: { lucide: Palette } },
				{ label: m.links.trademark, href: `${REPO}/blob/main/TRADEMARK.md`, icon: { lucide: Scale } }
			]
		},
		{
			title: m.columns.webmcp,
			links: [
				{ label: m.links.spec, href: SPEC, icon: { lucide: FileText } },
				{ label: m.links.specIssues, href: SPEC_ISSUES, icon: { lucide: ScrollText } }
			]
		}
	]);

	const external = (href: string) => href.startsWith('http');
</script>

<footer class="mt-8 px-3 pb-3 sm:px-5 sm:pb-5">
	<!-- On ink, the focus ring is paper (the global ring is ink and would vanish here). -->
	<div
		class="overflow-hidden rounded-frame border-2 border-ink bg-ink text-paper [&_:focus-visible]:outline-paper"
	>
		<div class="grid gap-12 px-6 pt-14 sm:px-10 md:grid-cols-[1.3fr_repeat(3,1fr)] md:gap-8">
			<div class="max-w-xs">
				<p class="font-display text-2xl leading-tight font-bold">
					{m.tagline}
				</p>
				<p class="mt-4 text-sm">{m.license}</p>
			</div>
			{#each COLUMNS as col (col.title)}
				<nav aria-label={col.title}>
					<h2 class="font-mono text-xs font-medium tracking-widest uppercase">{col.title}</h2>
					<ul class="mt-5 space-y-3.5">
						{#each col.links as link (link.href)}
							<li>
								<a
									href={link.href}
									class="group inline-flex items-center gap-2.5 font-medium decoration-marker decoration-2 underline-offset-4 hover:underline"
								>
									<span class="grid size-5 place-items-center" aria-hidden="true">
										{#if 'brand' in link.icon}
											<BrandIcon icon={link.icon.brand} size={16} />
										{:else}
											<link.icon.lucide size={17} strokeWidth={2} />
										{/if}
									</span>
									{link.label}
									{#if external(link.href)}
										<ArrowUpRight
											size={13}
											class="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
											aria-hidden="true"
										/>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/each}
		</div>

		<div class="mt-16 px-4 pb-4 sm:px-8 sm:pb-6" aria-hidden="true">
			<!-- The lockup is about 4.9em wide: size it from the panel width so it spans it without cropping. -->
			<Logo
				class="text-[calc((100vw-4.5rem)/4.9)] leading-[0.8] sm:text-[min(17rem,calc((100vw-8rem)/4.9))]"
			/>
		</div>

		<div
			class="mt-8 flex flex-wrap items-start justify-between gap-4 border-t-2 border-paper/20 px-6 py-6 sm:px-10"
		>
			<ul class="space-y-1 text-xs">
				{#each m.notices as n (n)}<li>{n}</li>{/each}
			</ul>
			<!-- Our own badge: a link to a live scan of this site, like the one we offer everyone. -->
			<a
				href="{i18n.href('/')}?scan={encodeURIComponent('https://webmcpx.dev/')}#scan"
				class="shrink-0"
				title={m.badge}
			>
				<!-- Our own artwork (content/badges/flat.svg), not user input. -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html FLAT_BADGE}
			</a>
		</div>
	</div>
</footer>
