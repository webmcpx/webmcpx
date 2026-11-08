<!--
	What the scan found, as a verdict first (with the site's own icon), then the next step: the script to
	paste when tools are missing, the lint findings when they need work, and the agent-ready badge to embed
	when all is well.
-->
<script lang="ts">
	import Link from '@lucide/svelte/icons/link';
	import Wrench from '@lucide/svelte/icons/wrench';
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-exclamation-point';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { tokens as pageTokens } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';
	import { BADGES, badgeEmbed, errors, errorText, host, shareLink, type BadgeStyle } from './scan.ts';
	import { scanner } from './scanner.svelte.ts';

	const i18n = useI18n();
	const m = $derived(i18n.m.scan);
	/** The steps shown while a scan runs (their text: `scan.steps`). */
	const STEPS = $derived(m.steps);
	/** Each verdict's look; its stamp text is `scan.verdicts.<verdict>`. */
	const VERDICT = {
		ready: { tone: 'good', icon: CircleCheck, fill: 'bg-good-soft' },
		issues: { tone: 'marker', icon: CircleAlert, fill: 'bg-marker' },
		missing: { tone: 'bad', icon: CircleX, fill: 'bg-bad-soft' }
	} as const;
	const error = $derived(
		scanner.error === 'invalid'
			? m.errors.invalid
			: scanner.error
				? errorText(scanner.error.status, scanner.error.detail, scanner.error.retryAfter, m.errors)
				: ''
	);

	/** The install line, highlighted at build time. */

	/** A code sample that is not highlighted (built in the browser), shown in the same CodeBlock. */
	const plain = (code: string): Highlighted => ({
		lang: 'html',
		code,
		html: `<pre class="shiki"><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></pre>`
	});

	let step = $state(0);
	let badge: BadgeStyle = $state('card');
	/** The tool whose description shows in the tooltip, and where (page coordinates, so scrolling keeps it in place). */
	let tip: { text: string; left: number; top: number; above: boolean } | null = $state(null);

	function showTip(e: Event, text: string) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const width = Math.min(320, innerWidth - 32);
		const above = r.bottom + 120 > innerHeight;
		tip = {
			text,
			left: scrollX + Math.max(16, Math.min(r.left, innerWidth - 16 - width)),
			top: scrollY + (above ? r.top - 8 : r.bottom + 8),
			above
		};
	}
	const hideTip = () => (tip = null);
	/** The tooltip lives on <body>, so the card's rounded clipping never cuts it. */
	const portal = (node: HTMLElement) => {
		document.body.append(node);
		return () => node.remove();
	};
	let shared = $state(false);
	let box: HTMLElement | undefined = $state();

	$effect(() => {
		if (scanner.status !== 'loading') return;
		step = 0;
		const t = setInterval(() => (step = Math.min(step + 1, STEPS.length - 1)), 1400);
		return () => clearInterval(t);
	});

	// Bring the result into view when a scan finishes (e.g. started from a logo further down).
	$effect(() => {
		if (scanner.runs === 0) return;
		tick().then(() => {
			const r = box?.getBoundingClientRect();
			// Centered when it fits; otherwise its top (the verdict) comes first.
			if (r && (r.top < 0 || r.bottom > innerHeight)) {
				box?.scrollIntoView({ block: r.height > innerHeight ? 'start' : 'center' });
			}
		});
	});

	async function share(url: string) {
		try {
			await navigator.clipboard.writeText(shareLink(location.origin, url, i18n.href('/')));
			shared = true;
			setTimeout(() => (shared = false), 1600);
		} catch {
			// Clipboard denied; nothing else to do.
		}
	}
</script>

<div bind:this={box} aria-live="polite" class="mx-auto w-full max-w-2xl scroll-mt-24">
	{#if scanner.status === 'loading'}
		<Card padding="lg" class="flex items-center gap-5 text-left">
			<span class="grid size-12 shrink-0 place-items-center rounded-xl border-2 border-ink bg-paper-2">
				<LoaderCircle class="animate-spin" aria-hidden="true" />
			</span>
			<div>
				<p class="font-display text-xl font-bold">{host(scanner.input)}</p>
				<p class="text-ink-2">{STEPS[Math.min(step, STEPS.length - 1)]}</p>
			</div>
		</Card>
	{:else if scanner.status === 'error'}
		<Card padding="md" shadow="none" class="border-dashed text-left">
			<p class="font-display font-bold">{m.failed}</p>
			<p class="mt-1 text-sm text-ink-2">{error}</p>
		</Card>
	{:else if scanner.status === 'done' && scanner.report}
		{@const r = scanner.report}
		{@const v = VERDICT[r.verdict]}
		<Card padding="none" shadow="lg" class="overflow-hidden text-left">
			<div class="flex items-start gap-4 p-5 sm:p-7">
				<span
					class="hidden size-12 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-ink sm:grid {r.favicon
						? 'bg-card'
						: v.fill}"
				>
					{#if r.favicon}
						<!-- A data: URI fetched by the scanner: the visitor's browser never contacts the scanned site. -->
						<img src={r.favicon} alt="" width="28" height="28" class="size-7 object-contain" />
					{:else}
						<v.icon aria-hidden="true" />
					{/if}
				</span>
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-3">
						<p class="truncate font-display text-2xl font-bold tracking-tight">{host(r.final_url)}</p>
						<Stamp tone={v.tone} size="lg">{m.verdicts[r.verdict]}</Stamp>
						<a
							href={i18n.href('/verdicts/')}
							class="text-sm text-ink-3 underline decoration-ink/30 underline-offset-4 hover:text-ink"
							>{i18n.m.footer.links.verdicts}</a
						>
					</div>
					<p class="mt-2 text-ink-2">
						{#if r.verdict === 'missing'}
							<Rich text={m.result.missing}>
								{#snippet tokens()}<strong class="text-ink"
										>{i18n.plural(r.page_tokens, m.result.tokens, { n: pageTokens(r.page_tokens) })}</strong
									>{/snippet}
							</Rich>
						{:else if r.verdict === 'issues'}
							{i18n.plural(errors(r), m.result.issues, {
								tools: i18n.plural(r.tools.length, m.result.toolCount)
							})}
						{:else}
							{i18n.plural(
								r.tools.length,
								host(r.final_url) === 'webmcpx.dev' ? m.result.readySelf : m.result.ready
							)}
						{/if}
					</p>
				</div>
			</div>

			{#if r.tools.length}
				<div class="border-t-2 border-ink bg-paper-2 px-5 py-4 sm:px-7">
					<ul class="flex flex-wrap gap-2" aria-label={m.result.tools}>
						{#each r.tools.slice(0, 10) as t, i (i)}
							<li>
								<!-- Hover, focus or tap shows the description; screen readers get it as part of the name. -->
								<button
									type="button"
									onclick={(e) => showTip(e, t.description)}
									class="inline-block cursor-help rounded-full border-2 border-ink bg-card px-2.5 py-0.5 font-mono text-xs outline-offset-2 hover:bg-marker focus-visible:bg-marker"
									onpointerenter={(e) => showTip(e, t.description)}
									onpointerleave={hideTip}
									onfocus={(e) => showTip(e, t.description)}
									onblur={hideTip}>{t.name}<span class="sr-only">: {t.description}</span></button
								>
							</li>
						{/each}
						{#if r.tools.length > 10}<li class="px-1 py-0.5 text-xs text-ink-3">
								{fmt(m.result.more, { n: i18n.number(r.tools.length - 10) })}
							</li>{/if}
					</ul>
					{#if r.diagnostics.length}
						<ul class="mt-4 space-y-1.5 text-sm" aria-label={m.result.findings}>
							{#each r.diagnostics.slice(0, 3) as d, i (i)}
								<li class="flex gap-2">
									<span
										class={[
											'font-mono text-xs font-bold',
											d.severity === 'error' ? 'text-bad' : 'text-ink-3'
										]}>{d.rule}</span
									>
									<span class="min-w-0 truncate text-ink-2">{d.message}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			{#if r.verdict === 'missing'}
				<!-- The fix lives in one place, the #for-sites section; the result only points there. -->
			{:else if r.verdict === 'issues'}
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="mb-3 font-medium">{m.result.lint}</p>
					<CodeBlock
						snippet={plain('cargo install webmcpx   # needs Rust\nwebmcpx lint src/')}
						title={m.result.terminal}
						class="shadow-none"
					/>
				</div>
			{:else}
				{@const embed = badgeEmbed(location.origin, r.url, badge, m.result.badgeTitle, i18n.href('/'))}
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="font-medium">{m.result.badge}</p>
					<p class="mt-1 text-sm text-ink-3">{m.result.badgeNote}</p>
					<fieldset class="mt-4 grid gap-3 sm:grid-cols-2">
						<legend class="sr-only">{m.result.badgeStyle}</legend>
						{#each BADGES as b (b.id)}
							<label
								class="flex cursor-pointer flex-col overflow-hidden rounded-card border-2 border-hairline transition hover:border-ink has-checked:border-ink has-checked:shadow-hard-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
							>
								<input type="radio" name="badge-style" value={b.id} bind:group={badge} class="sr-only" />
								<!-- Our own artwork (content/badges/), the same markup the embed code carries. -->
								<span
									class={[
										'grid h-20 place-items-center px-3 [&_svg]:max-w-full',
										b.id === 'dark' ? 'bg-ink' : 'bg-paper'
									]}
									aria-hidden="true"
								>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html b.svg}
								</span>
								<span class="flex items-baseline justify-between gap-2 border-t-2 border-inherit px-3 py-2">
									<span class="font-medium">{m.badges[b.id].name}</span>
									<span class="text-xs text-ink-3">{m.badges[b.id].fits}</span>
								</span>
							</label>
						{/each}
					</fieldset>
					<CodeBlock
						snippet={plain(embed)}
						title={badge === 'readme' ? 'README.md' : 'badge.html'}
						class="mt-4 shadow-none"
					/>
				</div>
			{/if}

			<div class="flex flex-wrap gap-3 border-t-2 border-ink p-5 sm:px-7">
				{#if r.verdict === 'missing'}
					<Button href="#for-sites" size="sm"><Wrench aria-hidden="true" />{m.result.fix}</Button>
				{/if}
				<Button variant="outline" size="sm" onclick={() => share(r.url)}>
					<Link aria-hidden="true" />{shared ? m.result.shared : m.result.share}
				</Button>
			</div>
		</Card>
	{/if}
</div>

{#if tip}
	<div
		{@attach portal}
		aria-hidden="true"
		class="pointer-events-none absolute z-50 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border-2 border-ink bg-ink px-3 py-2 text-sm wrap-anywhere text-paper shadow-hard-sm"
		style:left="{tip.left}px"
		style:top="{tip.top}px"
		style:translate={tip.above ? '0 -100%' : undefined}
	>
		{tip.text}
	</div>
{/if}
