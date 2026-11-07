<script lang="ts">
	import data from '#lib/content/bench.json';
	import Benchmark from '#lib/features/benchmark/Benchmark.svelte';
	import { parse } from '#lib/features/benchmark/bench.ts';
	import GetStarted from '#lib/features/cta/GetStarted.svelte';
	import Hero from '#lib/features/hero/Hero.svelte';
	import HowItWorks from '#lib/features/how/HowItWorks.svelte';
	import Issues from '#lib/features/issues/Issues.svelte';
	import Lint from '#lib/features/lint/Lint.svelte';
	import Playground from '#lib/features/playground/Playground.svelte';
	import type { PageProps } from './$types';

	let { data: page }: PageProps = $props();
	const code = $derived(page.code);
	const results = parse(data);
</script>

<svelte:head>
	<title>webmcpx: standard WebMCP tools, measured</title>
	<meta
		name="description"
		content="One script tag gives any site standard WebMCP tools. A reproducible benchmark shows what agents save. Built in Rust, open source."
	/>
</svelte:head>

<Hero snippets={{ scriptTag: code.scriptTag, npm: code.npm, agent: code.agent, cli: code.cli }} />
<Benchmark {results} reproduce={code.reproduce} />
<HowItWorks
	scriptTag={code.scriptTag}
	agentCall={code.agentCall}
	envelope={code.envelope}
	lintCommands={code.lintCommands}
/>
<Issues />
<Playground />
<Lint source={code.lintSource} commands={code.lintCommands} />
<GetStarted scriptTag={code.scriptTag} />
