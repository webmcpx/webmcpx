<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>webmcpx: standard WebMCP tools, measured</title>
	<meta
		name="description"
		content="One script tag gives any site standard WebMCP tools. A reproducible benchmark shows what agents save. Built in Rust, open source."
	/>
</svelte:head>

<div class="min-h-screen bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
	{@render children()}
</div>
