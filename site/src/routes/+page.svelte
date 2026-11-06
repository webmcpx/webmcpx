<script lang="ts">
	import Benchmark from '#lib/components/Benchmark.svelte';
	import Code from '#lib/components/Code.svelte';
	import Playground from '#lib/components/Playground.svelte';
	import Section from '#lib/components/Section.svelte';
	import data from '#lib/bench.json';
	import { ISSUES, issueUrl } from '#lib/issues.ts';
	import { parse } from '#lib/bench.ts';

	const REPO = 'https://github.com/webmcpx/webmcpx';
	const SNIPPET = '<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx/src/auto.js"></' + 'script>';
	const NAV = [
		['Benchmark', '#benchmark'],
		['Issues', '#issues'],
		['Playground', '#playground'],
		['Lint', '#lint']
	];
</script>

<header
	class="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/80"
>
	<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
		<a href="/" class="font-mono text-sm font-bold">webmcpx</a>
		<div class="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
			{#each NAV as [label, href] (href)}
				<a {href} class="hidden hover:text-zinc-900 sm:inline dark:hover:text-zinc-100">{label}</a>
			{/each}
			<a href={REPO} class="font-medium text-zinc-900 dark:text-zinc-100">GitHub</a>
		</div>
	</nav>
</header>

<main>
	<section class="mx-auto max-w-5xl px-4 pt-16 pb-8 sm:px-6 sm:pt-24">
		<p class="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
			Open source · Rust + WebAssembly · tracks the WebMCP draft
		</p>
		<h1 class="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
			Make any site agent-ready with one line.
		</h1>
		<p class="mt-6 max-w-2xl text-lg text-pretty text-zinc-600 dark:text-zinc-400">
			webmcpx registers standard WebMCP tools so agents search and read your pages instead of scraping
			them. About 2.7 KB on page load. A linter catches the mistakes the spec tracker keeps reporting.
		</p>
		<div class="mt-8 max-w-3xl">
			<Code code={SNIPPET} />
		</div>
		<div class="mt-6 flex flex-wrap gap-3 text-sm">
			<a href="#benchmark" class="rounded-lg bg-accent px-4 py-2 font-medium text-zinc-950 hover:brightness-95">
				See the benchmark
			</a>
			<a
				href={REPO}
				class="rounded-lg border border-zinc-300 px-4 py-2 font-medium hover:border-zinc-400 dark:border-zinc-700"
			>
				Read the code
			</a>
		</div>
	</section>

	<Benchmark results={parse(data)} />

	<Section id="issues" eyebrow="From the spec tracker" title="What developers asked for, built and tested.">
		<p class="mb-6 max-w-3xl text-zinc-600 dark:text-zinc-400">
			The WebMCP group keeps its tracker for the spec itself, so tooling ideas land elsewhere. This is that
			elsewhere.
		</p>
		<ul class="divide-y divide-zinc-200 dark:divide-zinc-800">
			{#each ISSUES as issue (issue.number)}
				<li class="grid gap-1 py-4 sm:grid-cols-[6rem_1fr_1fr] sm:gap-6">
					{#if issue.number}
						<a class="font-mono text-sm text-accent-ink hover:underline dark:text-accent" href={issueUrl(issue.number)}>
							#{issue.number}
						</a>
					{/if}
					<p class="text-sm text-zinc-600 dark:text-zinc-400">{issue.pain}</p>
					<p class="text-sm">{issue.fix}</p>
				</li>
			{/each}
		</ul>
	</Section>

	<Playground />

	<Section id="lint" eyebrow="Lint" title="Check your own tools before agents do.">
		<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
			<p class="text-zinc-600 dark:text-zinc-400">
				<code class="font-mono">webmcpx lint</code> finds <code class="font-mono">registerTool()</code> calls
				in JS and TS, and WebMCP manifests, then checks names, descriptions, schemas, annotations, hidden
				characters and the per-page tool budget. JSON and SARIF output for CI and agents.
			</p>
			<Code code={'webmcpx lint src/\nwebmcpx lint --fix\nwebmcpx lint --format sarif > webmcp.sarif'} />
		</div>
	</Section>
</main>

<footer class="border-t border-zinc-200 dark:border-zinc-800">
	<div class="mx-auto flex max-w-5xl flex-wrap justify-between gap-2 px-4 py-8 text-sm text-zinc-500 sm:px-6">
		<p>MIT OR Apache-2.0. A <a class="underline" href="https://webmcp.zone">webmcp.zone</a> community project.</p>
		<p>Not affiliated with the W3C WebMCP Community Group.</p>
	</div>
</footer>
