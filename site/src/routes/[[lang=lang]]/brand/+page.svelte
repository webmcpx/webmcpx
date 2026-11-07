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
	import { JUNCTION, JUNCTION_FAVICON, MARKS, MISUSE } from '#lib/content/brand.ts';
	import { REPO } from '#lib/content/site.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.brand);

	const variants = Object.keys(button.variants.variant) as (keyof typeof button.variants.variant)[];
	const sizes = Object.keys(button.variants.size) as (keyof typeof button.variants.size)[];
	const tones = Object.keys(stamp.variants.tone) as (keyof typeof stamp.variants.tone)[];
	/** The type styles (name and sample: `brand.type.styles.<id>`). */
	const TYPE = [
		{ id: 'giant', cls: 'font-display text-giant font-bold' },
		{ id: 'headline', cls: 'font-display text-headline font-bold' },
		{ id: 'body', cls: 'text-lg text-ink-2' },
		{ id: 'mono', cls: 'font-mono text-sm' }
	] as const;
	const tabs = $derived((['one', 'two'] as const).map((id) => ({ id, label: m.components.tabsItems[id] })));
	const ratio = (r: number) => `${r.toFixed(2)}:1`;
	const grid = Array.from({ length: 25 }, (_, i) => i);
</script>

<svelte:head>
	<title>{i18n.m.meta.brand.title}</title>
	<meta name="description" content={i18n.m.meta.brand.description} />
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
		{m.kicker}
	</p>
	<h1 id="brand-title" class="font-display text-display font-bold text-balance">
		{m.title}
	</h1>
	<p class="mt-5 max-w-2xl text-lg text-pretty text-ink-2">
		{m.lead}
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

<Section id="name" kicker={m.name.kicker} title={m.name.title}>
	<ul class="grid gap-3 md:grid-cols-2">
		{#each m.name.rules as rule (rule)}
			<li class="flex gap-3 rounded-card border-2 border-hairline bg-card p-4 text-ink-2">
				<Check size={18} class="mt-0.5 shrink-0 text-good" aria-hidden="true" />{rule}
			</li>
		{/each}
	</ul>
</Section>

<Section id="logo" kicker={m.logo.kicker} title={m.logo.title} lead={m.logo.lead}>
	<div class="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
		{#each MARKS as mark (mark.id)}
			{@const text = m.logo.marks[mark.id]}
			<Card padding="none" class="overflow-hidden">
				<div class="grid grid-cols-2">
					<div class="grid aspect-square place-items-center bg-paper">
						<SiteLogo logo={mark.logo} size={72} />
					</div>
					<div class="grid aspect-square place-items-center bg-ink text-paper">
						<SiteLogo logo={mark.logo} size={72} />
					</div>
				</div>
				<div class="border-t-2 border-ink p-5">
					<h3 class="font-display text-xl font-bold">{text.name}</h3>
					<p class="text-sm text-ink-3">{text.role}</p>
					<ul class="mt-4 space-y-2 text-sm">
						{#each mark.assets as a (a.file)}
							{@const asset = m.logo.assets[a.id]}
							<li class="flex items-start justify-between gap-3">
								<span class="min-w-0 text-ink-2"
									><Rich text={fmt(m.logo.asset, { use: asset.use })}
										>{#snippet label()}<strong class="text-ink"
												>{fmt(m.logo.assetLabel, { label: asset.label })}</strong
											>{/snippet}</Rich
									></span
								>
								<a
									href={a.file}
									download
									class="inline-flex shrink-0 items-center gap-1 font-mono text-xs underline decoration-marker decoration-2 underline-offset-4 hover:decoration-ink"
									aria-label={fmt(m.logo.download, { mark: text.name, asset: asset.label })}
									><Download size={13} aria-hidden="true" />SVG</a
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
	kicker={m.construction.kicker}
	title={m.construction.title}
	lead={m.construction.lead}
>
	<div class="grid gap-8 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg" class="grid place-items-center">
			<svg viewBox="-1 -1 26 26" class="w-full max-w-md" aria-labelledby="grid-title" role="img">
				<title id="grid-title">{m.construction.grid}</title>
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
				<h3 class="font-display text-xl font-bold">{m.construction.clearSpace}</h3>
				<p class="mt-2 text-ink-2">
					{m.construction.clearSpaceText}
				</p>
				<div class="mt-4 inline-grid place-items-center border-2 border-dashed border-ink-3 p-8">
					<div class="outline-2 outline-ink/20 outline-dashed">{@render junction('size-16')}</div>
				</div>
			</div>
			<div>
				<h3 class="font-display text-xl font-bold">{m.construction.minSize}</h3>
				<p class="mt-2 text-ink-2">
					{m.construction.minSizeText}
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

<Section id="color" kicker={m.color.kicker} title={m.color.title} lead={m.color.lead}>
	<ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
		{#each data.colors as c (c.name)}
			<li class="overflow-hidden rounded-card border-2 border-ink bg-card">
				<div class="h-16 border-b-2 border-ink" style:background="var(--{c.name})"></div>
				<div class="p-3">
					<p class="font-mono text-xs font-semibold">{c.name}</p>
					<p class="font-mono text-xs text-ink-2">{c.hex}</p>
					<p class="mt-1 text-xs text-ink-3">{m.color.uses[c.name]}</p>
				</div>
			</li>
		{/each}
	</ul>
	<div class="mt-10 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">{m.color.pairs}</h3>
			<p class="mt-1 text-sm text-ink-3">{m.color.pairsNote}</p>
			<table class="mt-4 w-full text-left text-sm">
				<thead class="text-xs text-ink-3"
					><tr
						><th class="pb-2 font-normal">{m.color.pairsText}</th><th class="pb-2 text-right font-normal"
							>{m.color.pairsContrast}</th
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
									style:background="var(--{p.bg})">{fmt(m.color.pair, { text: p.text, bg: p.bg })}</span
								></td
							>
							<td class="py-2 text-right font-mono text-xs tabular-nums">{ratio(p.ratio)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Card>
		<Card padding="lg" class="self-start">
			<h3 class="font-display text-xl font-bold">{m.color.yellow}</h3>
			<p class="mt-2 text-ink-2">
				<Rich text={fmt(m.color.yellowText, { ratio: ratio(data.yellowOnPaper) })}>
					{#snippet word()}<span class="marker">{m.color.yellowWord}</span>{/snippet}
				</Rich>
			</p>
		</Card>
	</div>
</Section>

<Section id="type" kicker={m.type.kicker} title={m.type.title}>
	<div class="space-y-6">
		{#each TYPE as t (t.id)}
			<div class="grid gap-2 border-t-2 border-hairline pt-4 sm:grid-cols-[16rem_1fr] [&>*]:min-w-0">
				<p class="font-mono text-xs text-ink-3">{m.type.styles[t.id].name}</p>
				<p class={t.cls}>{m.type.styles[t.id].sample}</p>
			</div>
		{/each}
	</div>
</Section>

<Section id="components" kicker={m.components.kicker} title={m.components.title} lead={m.components.lead}>
	<div class="space-y-12">
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">{m.components.buttons}</h3>
			<div class="space-y-4">
				{#each variants as variant (variant)}
					<div class="flex flex-wrap items-center gap-4">
						{#each sizes as size (size)}<Button {variant} {size}>{variant} {size}</Button>{/each}
					</div>
				{/each}
			</div>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">{m.components.stamps}</h3>
			<div class="flex flex-wrap items-center gap-3">
				{#each tones as tone (tone)}<Stamp {tone}>{tone}</Stamp>{/each}
			</div>
		</div>
		<div class="grid gap-6 md:grid-cols-3 [&>*]:min-w-0">
			<Card padding="lg">{m.components.card}</Card>
			<Card padding="lg" shadow="lg" interactive>{m.components.interactive}</Card>
			<Card padding="lg" shadow="none" class="border-dashed">{m.components.empty}</Card>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">{m.components.tabs}</h3>
			<Tabs items={tabs} label={m.components.tabsLabel}>
				{#snippet panel(item)}<p class="mt-3 text-sm text-ink-2">
						{fmt(m.components.tabsPanel, { label: item.label })}
					</p>{/snippet}
			</Tabs>
		</div>
		<div>
			<h3 class="mb-4 font-mono text-sm text-ink-3">{m.components.codeBlock}</h3>
			<CodeBlock snippet={data.sample} title="index.html" />
		</div>
	</div>
</Section>

<Section id="misuse" kicker={m.misuse.kicker} title={m.misuse.title}>
	<ul class="grid grid-cols-2 gap-4 md:grid-cols-3">
		{#each MISUSE as id (id)}
			<li class="rounded-card border-2 border-hairline bg-card p-5">
				<div class="grid h-28 place-items-center" aria-hidden="true">
					{#if id === 'stretch'}{@render junction('h-12 w-32', true)}
					{:else if id === 'rotate'}{@render junction('size-16 rotate-45')}
					{:else if id === 'outline'}
						<svg viewBox={JUNCTION.viewBox} class="size-16 fill-none stroke-ink" stroke-width="1">
							{#each JUNCTION.paths as p, i (i)}<path d={p.d} />{/each}
						</svg>
					{:else if id === 'yellow'}{@render junction('size-16 text-marker')}
					{:else if id === 'shadow'}{@render junction('size-16 drop-shadow-[3px_3px_0_var(--marker)]')}
					{:else}
						<svg viewBox={JUNCTION.viewBox} fill="currentColor" class="size-16">
							<path d="M2 4H6.5L12 12L6.5 20H2L7 12Z" /><path d="M22 4H17.5L12 12L17.5 20H22L17 12Z" />
						</svg>
					{/if}
				</div>
				<p class="mt-3 flex items-center gap-2 text-sm">
					<X size={16} class="shrink-0 text-bad" aria-hidden="true" />{m.misuse.items[id]}
				</p>
			</li>
		{/each}
	</ul>
</Section>

<Section id="trademark" kicker={m.trademark.kicker} title={m.trademark.title} lead={m.trademark.lead}>
	<div class="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">{m.trademark.sayIt}</h3>
			<ul class="mt-4 space-y-3 text-sm">
				{#each m.trademark.ok as p (p)}<li class="flex gap-2">
						<Check size={16} class="mt-0.5 shrink-0 text-good" aria-hidden="true" />{p}
					</li>{/each}
			</ul>
			<h3 class="mt-8 font-display text-xl font-bold">{m.trademark.never}</h3>
			<ul class="mt-4 space-y-3 text-sm">
				{#each m.trademark.no as p (p)}<li class="flex gap-2">
						<X size={16} class="mt-0.5 shrink-0 text-bad" aria-hidden="true" />{p}
					</li>{/each}
			</ul>
		</Card>
		<Card padding="lg">
			<h3 class="font-display text-xl font-bold">{m.trademark.voice}</h3>
			<p class="mt-2 text-sm text-ink-2">{m.trademark.voiceText}</p>
			<p class="mt-4 font-mono text-xs text-ink-3 uppercase">{m.trademark.wordsUse}</p>
			<p class="mt-2 flex flex-wrap gap-2">
				{#each m.trademark.use as w (w)}<Stamp tone="good" size="sm">{w}</Stamp>{/each}
			</p>
			<p class="mt-4 font-mono text-xs text-ink-3 uppercase">{m.trademark.wordsAvoid}</p>
			<p class="mt-2 flex flex-wrap gap-2">
				{#each m.trademark.avoid as w (w)}<Stamp tone="bad" size="sm">{w}</Stamp>{/each}
			</p>
			<p class="mt-8 font-mono text-xs text-ink-3 uppercase">{m.trademark.notices}</p>
			<ul class="mt-2 space-y-2 text-xs text-ink-2">
				{#each i18n.m.footer.notices as n (n)}<li>{n}</li>{/each}
			</ul>
			<div class="mt-6">
				<Button href="{REPO}/blob/main/TRADEMARK.md" variant="outline" size="sm">{m.trademark.read}</Button>
			</div>
		</Card>
	</div>
</Section>
