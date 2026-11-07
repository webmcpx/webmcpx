<!--
	The living style guide: every token and component variant, rendered from the real code. Not indexed;
	it exists for contributors and coding agents.
-->
<script lang="ts">
	import Button, { button } from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp, { stamp } from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import { COLORS } from '#lib/styles/tokens.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const variants = Object.keys(button.variants.variant) as (keyof typeof button.variants.variant)[];
	const sizes = Object.keys(button.variants.size) as (keyof typeof button.variants.size)[];
	const tones = Object.keys(stamp.variants.tone) as (keyof typeof stamp.variants.tone)[];
	const TYPE = [
		{
			cls: 'font-display text-giant font-bold',
			name: 'font-display text-giant',
			sample: 'Giant'
		},
		{
			cls: 'font-display text-display font-bold',
			name: 'font-display text-display',
			sample: 'Display'
		},
		{
			cls: 'font-display text-headline font-bold',
			name: 'font-display text-headline',
			sample: 'Headline'
		},
		{
			cls: 'text-lg text-ink-2',
			name: 'font-sans text-lg text-ink-2',
			sample: 'Body copy: short, plain, one idea.'
		},
		{ cls: 'font-mono text-sm', name: 'font-mono text-sm', sample: 'search_page({ query })' }
	];
	const tabs = [
		{ id: 'one', label: 'First' },
		{ id: 'two', label: 'Second' }
	];
</script>

<svelte:head>
	<title>Design system · webmcpx</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="pt-20"></div>
<Section
	id="colors"
	kicker="Design system"
	title="Paper and ink"
	lead="src/lib/styles/tokens.css. No other colors exist."
>
	<ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
		{#each COLORS as c (c.name)}
			<li class="overflow-hidden rounded-card border-2 border-ink bg-card">
				<div class="h-16 border-b-2 border-ink" style:background="var(--{c.name})"></div>
				<div class="p-3">
					<p class="font-mono text-xs font-semibold">{c.name}</p>
					<p class="mt-1 text-xs text-ink-3">{c.use}</p>
				</div>
			</li>
		{/each}
	</ul>

	<h3 class="mt-16 mb-6 font-display text-2xl font-bold">Type</h3>
	<div class="space-y-6">
		{#each TYPE as t (t.name)}
			<div class="grid gap-2 border-t-2 border-hairline pt-4 sm:grid-cols-[14rem_1fr] [&>*]:min-w-0">
				<code class="font-mono text-xs text-ink-3">{t.name}</code>
				<p class={t.cls}>{t.sample}</p>
			</div>
		{/each}
		<div class="grid gap-2 border-t-2 border-hairline pt-4 sm:grid-cols-[14rem_1fr] [&>*]:min-w-0">
			<code class="font-mono text-xs text-ink-3">marker</code>
			<p class="font-display text-headline font-bold">
				<span class="marker">Highlighted</span> word
			</p>
		</div>
	</div>
</Section>

<Section
	id="components"
	kicker="Components"
	title="Primitives"
	lead="src/lib/components. Variants are tailwind-variants recipes."
>
	<div class="space-y-12">
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">Button · variant × size</h3>
			<div class="space-y-4">
				{#each variants as variant (variant)}
					<div class="flex flex-wrap items-center gap-4">
						{#each sizes as size (size)}<Button {variant} {size}>{variant} {size}</Button>{/each}
					</div>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">Stamp · tone</h3>
			<div class="flex flex-wrap items-center gap-3">
				{#each tones as tone (tone)}<Stamp {tone}>{tone}</Stamp>{/each}
				<Stamp tone="good" size="lg">Agent-ready</Stamp>
			</div>
		</div>
		<div class="grid gap-6 md:grid-cols-3 [&>*]:min-w-0">
			<Card padding="lg">Card</Card>
			<Card padding="lg" shadow="lg" interactive>Interactive card (hover)</Card>
			<Card padding="lg" shadow="none" class="border-dashed">Empty state</Card>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">Tabs</h3>
			<Tabs items={tabs} label="Example">
				{#snippet panel(item)}<p class="mt-3 text-sm text-ink-2">
						Panel for {item.label}. Use the arrow keys.
					</p>{/snippet}
			</Tabs>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">CodeBlock (highlighted at build time)</h3>
			<CodeBlock snippet={data.sample} title="index.html" />
		</div>
	</div>
</Section>
