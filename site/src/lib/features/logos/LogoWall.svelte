<!-- Sites that already ship WebMCP. Each logo runs a live scan of that site: proof you can click. -->
<script lang="ts">
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import { INDEX, SITES, VERIFIED_ON } from '#lib/content/sites.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import { scanner } from '#lib/features/scan/scanner.svelte.ts';
</script>

<section aria-labelledby="logos-title" class="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
	<Reveal>
		<h2 id="logos-title" class="font-display text-headline font-bold text-balance">
			<span class="marker">{INDEX.sites}+ sites</span> already speak WebMCP.
		</h2>
		<p class="mt-3 text-ink-2">Click any of them to scan it live.</p>
	</Reveal>
	<Reveal delay={100}>
		<ul class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-9">
			{#each SITES as site (site.url)}
				<li>
					<button
						type="button"
						onclick={() => scanner.run(site.url)}
						class="flex items-center gap-2.5 rounded-lg px-2 py-1 text-ink-2 transition hover:text-ink"
					>
						{#if site.logo.wordmark}
							<SiteLogo logo={site.logo} size={24} />
							<span class="sr-only">{site.name}</span>
						{:else}
							<SiteLogo logo={site.logo} size={22} />
							<span class="font-display text-xl font-bold tracking-tight sm:text-2xl">{site.name}</span>
						{/if}
						<span class="sr-only">: scan this site</span>
					</button>
				</li>
			{/each}
		</ul>
		<p class="mt-8 text-xs text-ink-3">
			Checked with the scanner on {VERIFIED_ON}. Count from the
			<a class="underline" href={INDEX.url}>Known Good index</a> ({INDEX.asOf}). Logos belong to their owners;
			no affiliation.
		</p>
	</Reveal>
</section>
