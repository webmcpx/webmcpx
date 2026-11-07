<!--
	Brand manual and design system, one page: the name, the marks and their files, construction, clear space,
	color (from the real tokens), type, components, misuse, and trademark wording. Built from the research in
	reports/Marca e logo do webmcpx.md; marks in site/static/brand-assets.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Download from '@lucide/svelte/icons/download';
	import X from '@lucide/svelte/icons/x';
	import Logo from '#lib/components/layout/Logo.svelte';
	import Button, { button } from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import SiteLogo from '#lib/components/ui/SiteLogo.svelte';
	import Stamp, { stamp } from '#lib/components/ui/Stamp.svelte';
	import Tabs from '#lib/components/ui/Tabs.svelte';
	import {
		JUNCTION,
		JUNCTION_FAVICON,
		MARKS,
		MISUSE,
		NAMING,
		NOTICES,
		PHRASES,
		VOICE
	} from '#lib/content/brand.ts';
	import { REPO } from '#lib/content/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const variants = Object.keys(button.variants.variant) as (keyof typeof button.variants.variant)[];
	const sizes = Object.keys(button.variants.size) as (keyof typeof button.variants.size)[];
	const tones = Object.keys(stamp.variants.tone) as (keyof typeof stamp.variants.tone)[];
	const TYPE = [
		{ cls: 'font-display text-giant font-bold', name: 'Bricolage Grotesque · giant', sample: 'Agent-ready' },
		{
			cls: 'font-display text-headline font-bold',
			name: 'Bricolage Grotesque · headline',
			sample: 'Same agent. Same question.'
		},
		{
			cls: 'text-lg text-ink-2',
			name: 'Geist · body',
			sample: 'Short sentences you can check. One idea each.'
		},
		{
			cls: 'font-mono text-sm',
			name: 'Geist Mono · code and labels',
			sample: 'document.modelContext.registerTool()'
		}
	];
	const tabs = [
		{ id: 'one', label: 'First' },
		{ id: 'two', label: 'Second' }
	];
	const ratio = (r: number) => `${r.toFixed(2)}:1`;
	const grid = Array.from({ length: 25 }, (_, i) => i);
</script>

<svelte:head>
	<title>Brand and design system · webmcpx</title>
	<meta
		name="description"
		content="The webmcpx brand manual and design system: logo, color, type, components and trademark use."
	/>
</svelte:head>

{#snippet junction(cls: string, stretch = false)}
	<svg
		viewBox={JUNCTION.viewBox}
		fill="currentColor"
		class={cls}
		aria-hidden="true"
		preserveAspectRatio={stretch ? 'none' : undefined}
	>
		{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
	</svg>
{/snippet}

<div class="pt-24"></div>
<section aria-labelledby="brand-title" class="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
	<p class="mb-4 font-mono text-xs font-medium tracking-widest text-ink-3 uppercase">
		Brand manual · design system
	</p>
	<h1 id="brand-title" class="font-display text-display font-bold text-balance">
		Paper, ink and a junction.
	</h1>
	<p class="mt-5 max-w-2xl text-lg text-pretty text-ink-2">
		A page declares its tools; the browser sits in between; page and agent meet without one replacing the
		other. The mark draws that meeting. Everything below is rendered from the code that ships.
	</p>
	<div class="mt-10 grid gap-4 sm:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg" class="grid min-h-48 place-items-center"><Logo class="text-6xl" /></Card>
		<div
			class="grid min-h-48 place-items-center rounded-card border-2 border-ink bg-ink text-paper shadow-hard"
		>
			<Logo class="text-6xl" />
		</div>
	</div>
</section>

<Section id="name" kicker="01 · Name" title="webmcpx, always lowercase">
	<ul class="grid gap-3 md:grid-cols-2">
		{#each NAMING as rule (rule)}
			<li class="flex gap-3 rounded-card border-2 border-hairline bg-card p-4 text-ink-2">
				<Check size={18} class="mt-0.5 shrink-0 text-good" aria-hidden="true" />{rule}
			</li>
		{/each}
	</ul>
</Section>

<Section
	id="logo"
	kicker="02 · Logo"
	title="Three marks, one idea"
	lead="Use the Junction everywhere you can. The Card is the badge and app icon (32px and up); the Page with slot is the alternate."
>
	<div class="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
		{#each MARKS as m (m.id)}
			<Card padding="none" class="overflow-hidden">
				<div class="grid grid-cols-2">
					<div class="grid aspect-square place-items-center bg-paper">
						<SiteLogo logo={m.logo} size={72} />
					</div>
					<div class="grid aspect-square place-items-center bg-ink text-paper">
						<SiteLogo logo={m.logo} size={72} />
					</div>
				</div>
				<div class="border-t-2 border-ink p-5">
					<h3 class="font-display text-xl font-bold">{m.name}</h3>
					<p class="text-sm text-ink-3">{m.role}</p>
					<ul class="mt-4 space-y-2 text-sm">
						{#each m.assets as a (a.file)}
							<li class="flex items-start justify-between gap-3">
								<span class="min-w-0 text-ink-2"><strong class="text-ink">{a.label}.</strong> {a.use}</span>
								<a
									href={a.file}
									download
									class="inline-flex shrink-0 items-center gap-1 font-mono text-xs underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
									aria-label="Download {m.name} {a.label} SVG"><Download size={13} aria-hidden="true" />SVG</a
								>
							</li>
						{/each}
					</ul>
				</div>
			</Card>
		{/each}
	</div>
</Section>

<Section
	id="construction"
	kicker="03 · Construction"
	title="A 24-unit grid, a 2-unit gap"
	lead="Two filled chevrons, mirror images. Arms 4.5 units at the ends, apexes cut flat over 2 units, and a 2-unit gap between them that never closes: that gap is the browser."
>
	<div class="grid gap-8 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg" class="grid place-items-center">
			<svg viewBox="-1 -1 26 26" class="w-full max-w-md" aria-labelledby="grid-title" role="img">
				<title id="grid-title">The Junction drawn on its 24-unit grid</title>
				{#each grid as i (i)}
					<line x1={i} y1="0" x2={i} y2="24" class="stroke-hairline" stroke-width="0.05" />
					<line x1="0" y1={i} x2="24" y2={i} class="stroke-hairline" stroke-width="0.05" />
				{/each}
				<g class="fill-ink"
					>{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}</g
				>
				<rect x="11" y="11" width="2" height="2" class="fill-marker" />
			</svg>
		</Card>
		<div class="space-y-6">
			<div>
				<h3 class="font-display text-xl font-bold">Clear space</h3>
				<p class="mt-2 text-ink-2">
					Keep free space around the mark equal to half its height, and around the lockup equal to the height
					of the x.
				</p>
				<div class="mt-4 inline-grid place-items-center border-2 border-dashed border-ink-3 p-8">
					<div class="outline-2 outline-ink/20 outline-dashed">{@render junction('size-16')}</div>
				</div>
			</div>
			<div>
				<h3 class="font-display text-xl font-bold">Minimum size</h3>
				<p class="mt-2 text-ink-2">
					The mark down to 16px only as the favicon variant. The lockup at least 24px tall.
				</p>
				<div class="mt-4 flex items-end gap-6">
					<SiteLogo logo={JUNCTION_FAVICON} size={16} />
					<SiteLogo logo={JUNCTION_FAVICON} size={32} />
					<Logo class="text-[24px]" />
				</div>
			</div>
		</div>
	</div>
</Section>

<Section
	id="color"
	kicker="04 · Color"
	title="Paper and ink, one highlighter"
	lead="Values are read from tokens.css. Pick the artwork for the background it lands on, not for the reader's theme."
>
	<ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
		{#each data.colors as c (c.name)}
			<li class="overflow-hidden rounded-card border-2 border-ink bg-card">
				<div class="h-16 border-b-2 border-ink" style:background="var(--{c.name})"></div>
				<div class="p-3">
					<p class="font-mono text-xs font-semibold">{c.name}</p>
					<p class="font-mono text-xs text-ink-2">{c.hex}</p>
					<p class="mt-1 text-xs text-ink-3">{c.use}</p>
				</div>
			</li>
		{/each}
	</ul>
	<div class="mt-10 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">Approved text pairs</h3>
			<p class="mt-1 text-sm text-ink-3">WCAG 2.2 AA asks 4.5:1 for body text; a test enforces it.</p>
			<table class="mt-4 w-full text-left text-sm">
				<thead class="text-xs text-ink-3"
					><tr
						><th class="pb-2 font-normal">Text on background</th><th class="pb-2 text-right font-normal"
							>Contrast</th
						></tr
					></thead
				>
				<tbody>
					{#each data.pairs as p (p.text + p.bg)}
						<tr class="border-t border-hairline">
							<td class="py-2"
								><span
									class="rounded px-2 py-0.5 font-mono text-xs"
									style:color="var(--{p.text})"
									style:background="var(--{p.bg})">{p.text} on {p.bg}</span
								></td
							>
							<td class="py-2 text-right font-mono text-xs tabular-nums">{ratio(p.ratio)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card>
		<Card padding="lg" class="self-start">
			<h3 class="font-display text-xl font-bold">Yellow is a background, never a figure</h3>
			<p class="mt-2 text-ink-2">
				Highlighter yellow on paper measures {ratio(data.yellowOnPaper)}: it cannot carry a shape or text. Use
				it behind ink: a
				<span class="marker">highlighted word</span>, a chip, an app icon.
			</p>
		</Card>
	</div>
</Section>

<Section id="type" kicker="05 · Type" title="Bricolage, Geist, Geist Mono">
	<div class="space-y-6">
		{#each TYPE as t (t.name)}
			<div class="grid gap-2 border-t-2 border-hairline pt-4 sm:grid-cols-[16rem_1fr] [&>*]:min-w-0">
				<p class="font-mono text-xs text-ink-3">{t.name}</p>
				<p class={t.cls}>{t.sample}</p>
			</div>
		{/each}
	</div>
</Section>

<Section
	id="components"
	kicker="06 · Components"
	title="2px outlines, hard shadows"
	lead="src/lib/components/ui. Variants are tailwind-variants recipes; the shapes come from the same tokens."
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

<Section id="misuse" kicker="07 · Misuse" title="Don’t">
	<ul class="grid grid-cols-2 gap-4 md:grid-cols-3">
		{#each MISUSE as m (m.id)}
			<li class="rounded-card border-2 border-hairline bg-card p-5">
				<div class="grid h-28 place-items-center" aria-hidden="true">
					{#if m.id === 'stretch'}{@render junction('h-12 w-32', true)}
					{:else if m.id === 'rotate'}{@render junction('size-16 rotate-45')}
					{:else if m.id === 'outline'}
						<svg viewBox={JUNCTION.viewBox} class="size-16 fill-none stroke-ink" stroke-width="1">
							{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
						</svg>
					{:else if m.id === 'yellow'}{@render junction('size-16 text-marker')}
					{:else if m.id === 'shadow'}{@render junction('size-16 drop-shadow-[3px_3px_0_var(--marker)]')}
					{:else}
						<svg viewBox={JUNCTION.viewBox} fill="currentColor" class="size-16">
							<path d="M2 4H6.5L12 12L6.5 20H2L7 12Z" /><path d="M22 4H17.5L12 12L17.5 20H22L17 12Z" />
						</svg>
					{/if}
				</div>
				<p class="mt-3 flex items-center gap-2 text-sm">
					<X size={16} class="shrink-0 text-bad" aria-hidden="true" />{m.label}
				</p>
			</li>
		{/each}
	</ul>
</Section>

<Section
	id="trademark"
	kicker="08 · Trademarks"
	title="Use the name freely. Don’t look official."
	lead="The code is MIT or Apache-2.0; the name and the marks are not covered by that license. The full policy is in TRADEMARK.md."
>
	<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">Say it like this</h3>
			<ul class="mt-4 space-y-3 text-sm">
				{#each PHRASES.ok as p (p)}<li class="flex gap-2">
						<Check size={16} class="mt-0.5 shrink-0 text-good" aria-hidden="true" />{p}
					</li>{/each}
			</ul>
			<h3 class="mt-8 font-display text-xl font-bold">Never</h3>
			<ul class="mt-4 space-y-3 text-sm">
				{#each PHRASES.no as p (p)}<li class="flex gap-2">
						<X size={16} class="mt-0.5 shrink-0 text-bad" aria-hidden="true" />{p}
					</li>{/each}
			</ul>
		</Card>
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">Voice</h3>
			<p class="mt-2 text-sm text-ink-2">Short sentences you can check. Numbers over adjectives.</p>
			<p class="mt-4 font-mono text-xs text-ink-3 uppercase">Words we use</p>
			<p class="mt-2 flex flex-wrap gap-2">
				{#each VOICE.use as w (w)}<Stamp tone="good" size="sm">{w}</Stamp>{/each}
			</p>
			<p class="mt-4 font-mono text-xs text-ink-3 uppercase">Words we avoid</p>
			<p class="mt-2 flex flex-wrap gap-2">
				{#each VOICE.avoid as w (w)}<Stamp tone="bad" size="sm">{w}</Stamp>{/each}
			</p>
			<p class="mt-8 font-mono text-xs text-ink-3 uppercase">Notices</p>
			<ul class="mt-2 space-y-2 text-xs text-ink-2">
				{#each NOTICES as n (n)}<li>{n}</li>{/each}
			</ul>
			<div class="mt-6">
				<Button href="{REPO}/blob/main/TRADEMARK.md" variant="outline" size="sm">Read TRADEMARK.md</Button>
			</div>
		</Card>
	</div>
</Section>
