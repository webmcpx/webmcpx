<!-- First screen: one question, one input, and the proof that others already answered it. -->
<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Bot from '@lucide/svelte/icons/bot';
	import PenCircle from '#lib/components/ui/PenCircle.svelte';
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
		/** The leaderboard's best case, quoted in the lead with its site and model; null: no run published. */
		best: { saving: number; site: string; model: string } | null;
	}

	let { best }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.hero);
	/** Letters in the headline's longer line from sm up: the text before the mark, or the mark and what follows. */
	const lineLen = $derived.by(() => {
		const [before, after = ''] = m.title.text.split('{mark}');
		return Math.max([...before.trim()].length, [...(m.title.mark + after)].length);
	});
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

		<div class="@container mx-auto max-w-5xl text-center">
			<Reveal>
				<a href={SPEC} class="group inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
					<Stamp tone="marker" size="sm">{m.stamp}</Stamp>
					{fmt(m.draft, { date: DRAFT })}
					<ArrowRight size={14} class="transition group-hover:translate-x-0.5" aria-hidden="true" />
				</a>
			</Reveal>
			<Reveal delay={60}>
				<!-- From sm up the marked part starts the second line ("Deixe seu site / pronto para agentes"): the size
				     shrinks only as much as the longer line needs to fit (about 0.5em per letter; see the style). -->
				<h1
					id="hero-title"
					class="hero-title mx-auto mt-8 font-display text-giant font-bold text-balance"
					style:--line-len={lineLen}
				>
					<Rich text={m.title.text}>
						{#snippet mark()}<br class="max-sm:hidden" /><span class="marker">{m.title.mark}</span>{/snippet}
					</Rich>
				</h1>
			</Reveal>
			<Reveal delay={120}>
				<p class="mx-auto mt-7 max-w-5xl text-lg text-balance text-ink-2 sm:text-xl">
					{#if best}
						<Rich text={fmt(m.lead, { site: best.site, model: best.model })}>
							{#snippet mark()}<span class="marker text-ink"
									>{fmt(m.leadMark, { best: ratio(best.saving) })}</span
								>{/snippet}
						</Rich>
					{:else}{m.leadPlain}{/if}
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
					{/snippet}
				</ScanForm>
			</Reveal>
			<Reveal delay={200}>
				<!-- The sub-CTA: below the scan (the one main action), for people who use agents but run no site. Circled in
					     the highlighter, drawn by hand. -->
				<div class="mt-10 flex justify-center">
					<PenCircle class="px-8 py-4">
						<span class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
							<span class="font-medium text-ink">
								{m.entry.question}
							</span>
							<a
								href="#for-agents"
								class="group inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-marker decoration-[3px] underline-offset-4 hover:decoration-ink"
							>
								<Bot size={16} aria-hidden="true" />{m.entry.agent}<ArrowRight
									size={14}
									class="transition group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</a>
						</span>
					</PenCircle>
				</div>
			</Reveal>
			<div class="mt-10">
				<ScanResult />
			</div>
		</div>
	</div>
</section>

<style>
	@media (min-width: 40rem) {
		.hero-title {
			--per-letter: 0.5;
			font-size: min(var(--text-giant), calc(100cqi / (var(--line-len) * var(--per-letter))));
		}
		/* Cyrillic letters run wider in the display face. */
		.hero-title:lang(ru) {
			--per-letter: 0.58;
		}
	}
</style>
