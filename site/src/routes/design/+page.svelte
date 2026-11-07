<!--
	The living style guide: every token and component variant, rendered from the real code. Not linked from
	search engines; it exists for contributors and coding agents.
-->
<script lang="ts">
	import Blocks from '@lucide/svelte/icons/blocks';
	import Palette from '@lucide/svelte/icons/palette';
	import Badge, { badge } from '#lib/components/ui/Badge.svelte';
	import Button, { button } from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import IconTile from '#lib/components/ui/IconTile.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import { COLORS } from '#lib/styles/tokens.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const variants = Object.keys(button.variants.variant) as (keyof typeof button.variants.variant)[];
	const sizes = (Object.keys(button.variants.size) as (keyof typeof button.variants.size)[]).filter(
		(s) => s !== 'icon'
	);
	const tones = Object.keys(badge.variants.tone) as (keyof typeof badge.variants.tone)[];
	const TYPE = [
		{ cls: 'text-display font-semibold', name: 'text-display', sample: 'Agent-ready' },
		{ cls: 'text-headline font-semibold', name: 'text-headline', sample: 'Section headline' },
		{ cls: 'text-xl font-semibold', name: 'text-xl', sample: 'Card title' },
		{
			cls: 'text-base text-muted',
			name: 'text-base text-muted',
			sample: 'Body copy for leads and descriptions.'
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

<Section
	id="colors"
	eyebrow="Design system"
	icon={Palette}
	title="Tokens"
	lead="Semantic roles only: the default Tailwind palette is removed, so every class here maps to a variable in src/lib/styles/tokens.css. Toggle the theme to see both."
>
	<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
		{#each COLORS as c (c.name)}
			<li class="overflow-hidden rounded-xl border border-border">
				<div class="h-16 border-b border-border" style:background="var(--{c.name})"></div>
				<div class="p-3">
					<p class="font-mono text-xs">{c.name}</p>
					<p class="mt-1 text-xs text-subtle">{c.use}</p>
				</div>
			</li>
		{/each}
	</ul>

	<h3 class="mt-16 mb-6 text-xl font-semibold">Type</h3>
	<div class="space-y-6">
		{#each TYPE as t (t.name)}
			<div class="grid gap-2 border-t border-border pt-4 sm:grid-cols-[12rem_1fr] [&>*]:min-w-0">
				<code class="font-mono text-xs text-subtle">{t.name}</code>
				<p class={t.cls}>{t.sample}</p>
			</div>
		{/each}
	</div>
</Section>

<Section
	id="components"
	eyebrow="Components"
	icon={Blocks}
	title="Primitives"
	lead="src/lib/components/ui. Variants are tailwind-variants recipes exported next to each component."
>
	<div class="space-y-12">
		<div>
			<h3 class="mb-4 font-mono text-sm text-subtle">Button · variant × size</h3>
			<div class="space-y-3">
				{#each variants as variant (variant)}
					<div class="flex flex-wrap items-center gap-3">
						{#each sizes as size (size)}
							<Button {variant} {size}>{variant} {size}</Button>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-subtle">Badge · tone</h3>
			<div class="flex flex-wrap gap-3">
				{#each tones as tone (tone)}
					<Badge {tone}>{tone}</Badge>
					<Badge {tone} size="sm">{tone}</Badge>
				{/each}
			</div>
		</div>
		<div class="grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
			<Card padding="lg">
				<IconTile icon={Blocks} size="lg" />
				<p class="mt-4 font-medium">Card with IconTile</p>
			</Card>
			<Card padding="lg" interactive>
				<IconTile icon={Palette} />
				<p class="mt-4 font-medium">Interactive card (hover me)</p>
			</Card>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-subtle">Tabs</h3>
			<Tabs items={tabs} label="Example">
				{#snippet panel(item)}
					<p class="mt-3 text-sm text-muted">Panel for {item.label}. Use the arrow keys.</p>
				{/snippet}
			</Tabs>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-subtle">CodeBlock (highlighted at build time)</h3>
			<CodeBlock snippet={data.sample} title="app.js" />
		</div>
	</div>
</Section>
