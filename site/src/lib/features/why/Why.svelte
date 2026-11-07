<!--
	Why WebMCP: the pains it removes, only the ones that matter, each stated as the WebMCP draft
	(Draft Community Group Report, 2 November 2026) or our benchmark backs it. The saving is computed from the
	published run, never typed.
-->
<script lang="ts">
	import Coins from '@lucide/svelte/icons/coins';
	import Server from '@lucide/svelte/icons/server-off';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Target from '@lucide/svelte/icons/crosshair';
	import type { Component } from 'svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import { ratio } from '#lib/features/benchmark/bench.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	interface Props {
		/** The largest token saving among the showcased questions (e.g. 96.8). */
		bestSaving: number;
		/** On which site that saving was measured. */
		bestSite: string;
	}

	let { bestSaving, bestSite }: Props = $props();

	const reasons: { icon: Component; title: string; pain: string; gain: string }[] = $derived([
		{
			icon: Target,
			title: 'Agents stop guessing',
			pain: 'Agents read pages and click like a person would. Every redesign, popup or A/B test breaks them.',
			gain: 'The site declares its tools: a name, a description in plain words and an input schema. Agents call them instead of reverse-engineering the UI.'
		},
		{
			icon: Coins,
			title: 'A fraction of the tokens',
			pain: 'Reading a page means sending all of it to the model, step after step, on every visit.',
			gain: `One call returns just the answer: up to ${ratio(bestSaving)} fewer tokens on ${bestSite} in our benchmark, and faster.`
		},
		{
			icon: ShieldCheck,
			title: 'The site stays in charge',
			pain: 'With scraping, the site has no say in what an agent does or how it reads the result.',
			gain: 'The site chooses what agents can do, and tools say whether they only read or change something, so agents and browsers can ask the user first.'
		},
		{
			icon: Server,
			title: 'No server to build',
			pain: 'Giving agents a real API usually means a separate backend, auth and keys to run and secure.',
			gain: 'Tools are JavaScript functions in the page, running with the user’s session, mediated by the browser. Nothing new to host.'
		}
	]);
</script>

<Section
	id="why"
	kicker="Why WebMCP?"
	title="Stop making agents scrape your site."
	lead="WebMCP lets a page hand agents real tools. That changes four things."
>
	<ul class="grid gap-4 md:grid-cols-2">
		{#each reasons as r, i (r.title)}
			<li class="min-w-0">
				<Reveal delay={(i % 2) * 80} class="h-full">
					<div class="flex h-full flex-col rounded-card border-2 border-ink bg-card p-6 shadow-hard sm:p-7">
						<span
							class="grid size-11 place-items-center rounded-xl border-2 border-ink bg-marker"
							aria-hidden="true"
						>
							<r.icon size={22} strokeWidth={2} />
						</span>
						<h3 class="mt-5 font-display text-2xl font-bold tracking-tight">{r.title}</h3>
						<p class="mt-4 font-mono text-[11px] tracking-widest text-ink-3 uppercase">Today</p>
						<p class="mt-1 text-pretty text-ink-2">{r.pain}</p>
						<p class="mt-4 font-mono text-[11px] tracking-widest text-ink-3 uppercase">With WebMCP</p>
						<p class="mt-1 text-pretty">{r.gain}</p>
					</div>
				</Reveal>
			</li>
		{/each}
	</ul>
</Section>
