<!-- First screen: one question, one input, and the proof that others already answered it. -->
<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { SITES } from '#lib/content/sites.ts';
	import { SPEC } from '#lib/content/site.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import ScanForm from '#lib/features/scan/ScanForm.svelte';
	import ScanResult from '#lib/features/scan/ScanResult.svelte';
	import { scanner } from '#lib/features/scan/scanner.svelte.ts';
	import type { Highlighted } from '#lib/content/snippets.ts';

	let { scriptTag }: { scriptTag: Highlighted } = $props();

	const TRY = SITES.slice(0, 3);
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
					<Stamp tone="marker" size="sm">New</Stamp>
					Tracks the WebMCP draft of 2026-11-02
					<ArrowRight size={14} class="transition group-hover:translate-x-0.5" aria-hidden="true" />
				</a>
			</Reveal>
			<Reveal delay={60}>
				<h1 id="hero-title" class="mx-auto mt-8 max-w-4xl font-display text-giant font-bold text-balance">
					Make your site <span class="marker">agent-ready</span>.
				</h1>
			</Reveal>
			<Reveal delay={120}>
				<p class="mx-auto mt-7 max-w-xl text-lg text-pretty text-ink-2 sm:text-xl">
					AI agents are already reading your pages. See what they get, then give them real tools with one
					line.
				</p>
			</Reveal>
			<Reveal delay={180} class="mt-10">
				<ScanForm fromQuery focusOnLoad>
					{#snippet hint()}
						<p class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-ink-3">
							Try
							{#each TRY as s (s.url)}
								<button
									type="button"
									class="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
									onclick={() => scanner.run(s.url)}>{s.name}</button
								>
							{/each}
						</p>
					{/snippet}
				</ScanForm>
			</Reveal>
			<div class="mt-10">
				<ScanResult {scriptTag} />
			</div>
		</div>
	</div>
</section>
