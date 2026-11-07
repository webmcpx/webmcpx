<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { siGithub } from 'simple-icons';
	import Badge from '#lib/components/ui/Badge.svelte';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { REPO, SPEC } from '#lib/content/site.ts';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';
	import InstallTabs from './InstallTabs.svelte';

	interface Props {
		snippets: { scriptTag: Highlighted; npm: Highlighted; agent: Highlighted; cli: Highlighted };
	}

	let { snippets }: Props = $props();
</script>

<section aria-labelledby="hero-title" class="relative isolate overflow-hidden">
	<!-- Decoration: a faint grid that fades out, and a soft accent glow behind the headline. -->
	<div
		aria-hidden="true"
		class="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[size:56px_56px] opacity-60"
	></div>
	<div
		aria-hidden="true"
		class="glow absolute top-[-18rem] left-1/2 -z-10 h-[36rem] w-[min(64rem,140vw)] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
	></div>

	<div class="mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
		<Reveal>
			<a href={SPEC} class="inline-block transition hover:opacity-80">
				<Badge tone="outline">
					<Sparkles aria-hidden="true" />Tracks the WebMCP draft of 2026-11-02
				</Badge>
			</a>
		</Reveal>
		<Reveal delay={60}>
			<h1 id="hero-title" class="mx-auto mt-8 max-w-4xl text-display font-semibold text-balance">
				Make any site
				<span
					class="bg-linear-to-br from-accent to-accent-ink bg-clip-text whitespace-nowrap text-transparent"
					>agent-ready</span
				>
				with one line.
			</h1>
		</Reveal>
		<Reveal delay={120}>
			<p class="mx-auto mt-7 max-w-2xl text-lg text-pretty text-muted sm:text-xl">
				webmcpx registers standard WebMCP tools, so agents search and read your pages instead of scraping
				them. About 2.7 KB on page load, built in Rust, with a linter for the tools you write yourself.
			</p>
		</Reveal>
		<Reveal delay={180} class="mt-9 flex flex-wrap justify-center gap-3">
			<Button href="#get-started" variant="primary" size="lg"
				>Get started<ArrowRight aria-hidden="true" /></Button
			>
			<Button href={REPO} size="lg"><BrandIcon icon={siGithub} />Star on GitHub</Button>
		</Reveal>
		<Reveal delay={240} class="mx-auto mt-14 max-w-3xl">
			<InstallTabs {...snippets} />
		</Reveal>
	</div>
</section>

<style>
	@media (prefers-reduced-motion: no-preference) {
		.glow {
			animation: breathe 9s ease-in-out infinite alternate;
		}
	}

	@keyframes breathe {
		from {
			opacity: 0.55;
			scale: 0.92 1;
		}
		to {
			opacity: 1;
			scale: 1.05 1;
		}
	}
</style>
