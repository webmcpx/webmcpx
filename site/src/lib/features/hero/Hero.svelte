<!-- First screen: one question, one input, and the proof that others already answered it. -->
<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Bot from '@lucide/svelte/icons/bot';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { SITES } from '#lib/content/sites.ts';
	import { SPEC } from '#lib/content/site.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import ScanForm from '#lib/features/scan/ScanForm.svelte';
	import ScanResult from '#lib/features/scan/ScanResult.svelte';
	import { ratio } from '#lib/features/benchmark/bench.ts';
	import { scanner } from '#lib/features/scan/scanner.svelte.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	interface Props {
		/** The leaderboard's best-case saving (a ratio), quoted in the lead; null: no run published. */
		best: number | null;
	}

	let { best }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.hero);
	// Three sites that ship WebMCP, then ours: scanning the scanner's own site had better say agent-ready.
	const TRY = [{ name: 'webmcpx', url: 'https://webmcpx.dev/' }, ...SITES.slice(0, 3)];
	/** The date of the WebMCP draft this release tracks. */
	const DRAFT = '2026-11-02';
</script>

<section id="scan" aria-labelledby="hero-title" class="scroll-mt-4 px-3 pt-3 sm:px-5 sm:pt-5">
	<div
		class="relative isolate overflow-hidden rounded-frame border-2 border-ink bg-paper px-4 pt-28 pb-14 sm:pt-36 sm:pb-20"
	>
		<!-- Ruled-paper texture: quiet, structural, prints nothing for screen readers. -->
		<div
			aria-hidden="true"
			class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_bottom,var(--hairline)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[size:64px_64px] opacity-70"
		></div>

		<div class="mx-auto max-w-5xl text-center">
			<Reveal>
				<a href={SPEC} class="group inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
					<Stamp tone="marker" size="sm">{m.stamp}</Stamp>
					{fmt(m.draft, { date: DRAFT })}
					<ArrowRight size={14} class="transition group-hover:translate-x-0.5" aria-hidden="true" />
				</a>
			</Reveal>
			<Reveal delay={60}>
				<h1 id="hero-title" class="mx-auto mt-8 max-w-4xl font-display text-giant font-bold text-balance">
					<Rich text={m.title.text}>
						{#snippet mark()}<span class="marker">{m.title.mark}</span>{/snippet}
					</Rich>
				</h1>
			</Reveal>
			<Reveal delay={120}>
				<p class="mx-auto mt-7 max-w-xl text-lg text-pretty text-ink-2 sm:text-xl">
					{best ? fmt(m.lead, { best: ratio(best) }) : m.leadPlain}
				</p>
			</Reveal>
			<Reveal delay={180} class="mt-8">
				<ScanForm fromQuery focusOnLoad>
					{#snippet hint()}
						<p class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink-3">
							<Rich text={m.try}>
								{#snippet sites()}
									{#each TRY as s (s.url)}
										<button
											type="button"
											class="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
											onclick={() => scanner.run(s.url)}>{s.name}</button
										>
									{/each}
								{/snippet}
							</Rich>
						</p>
						<!-- The scan is the one action here; people with no site get a quiet way to theirs. -->
						<p class="mt-3 text-sm text-ink-3">
							{m.entry.question}
							<a
								href="#for-agents"
								class="ml-1 inline-flex items-center gap-1 font-medium text-ink underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
								><Bot size={14} aria-hidden="true" />{m.entry.agent}</a
							>
						</p>
					{/snippet}
				</ScanForm>
			</Reveal>
			<div class="mt-10">
				<ScanResult />
			</div>
		</div>
	</div>
</section>
