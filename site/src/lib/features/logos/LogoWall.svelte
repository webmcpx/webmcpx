<!-- Sites that already ship WebMCP. Each logo runs a live scan of that site: proof you can click. -->
<script lang="ts">
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import { DIRECTORY, SITES, VERIFIED, VERIFIED_ON } from '#lib/content/sites.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { scanner } from '#lib/features/scan/scanner.svelte.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	// Up to the scan first, then scan: started together, the result box's own scroll-into-view
	// (on a new run) cuts the smooth scroll short. So wait for it to end (or 1 s, where
	// `scrollend` is missing), and the scan's progress is in view from the start.
	function scanSite(url: string) {
		if (scrollY === 0) return scanner.run(url);
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		let started = false;
		const start = () => {
			if (started) return;
			started = true;
			removeEventListener('scrollend', start);
			scanner.run(url);
		};
		addEventListener('scrollend', start);
		setTimeout(start, smooth ? 1000 : 0);
		scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
	}

	const i18n = useI18n();
	const m = $derived(i18n.m.logos);
</script>

<section aria-labelledby="logos-title" class="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
	<Reveal>
		<h2 id="logos-title" class="font-display text-headline font-bold text-balance">
			<Rich text={m.title.text}>
				{#snippet count()}<span class="marker">{i18n.plural(DIRECTORY.sites, m.title.count)}</span>{/snippet}
			</Rich>
		</h2>
		<p class="mt-3 text-ink-2">{m.lead}</p>
	</Reveal>
	<Reveal delay={100}>
		<ul class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-9">
			{#each SITES as site (site.url)}
				<li>
					<button
						type="button"
						onclick={() => scanSite(site.url)}
						aria-label={fmt(m.scan, { site: site.name })}
						class="flex items-center gap-2.5 rounded-lg px-2 py-1 text-ink-2 transition hover:text-ink"
					>
						{#if site.logo.wordmark}
							<SiteLogo logo={site.logo} size={24} />
						{:else}
							<SiteLogo logo={site.logo} size={22} />
							<span class="font-display text-xl font-bold tracking-tight sm:text-2xl">{site.name}</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
		<p class="mt-8 text-xs text-ink-3">
			<Rich
				text={fmt(m.note, {
					date: DIRECTORY.asOf,
					n: i18n.number(VERIFIED.sites),
					verifiedDate: VERIFIED.asOf,
					checked: VERIFIED_ON
				})}
			>
				{#snippet directory()}<a class="underline" href={DIRECTORY.url}>{m.directory}</a>{/snippet}
				{#snippet knownGood()}<a class="underline" href={VERIFIED.url}>{m.knownGood}</a>{/snippet}
			</Rich>
		</p>
	</Reveal>
</section>
