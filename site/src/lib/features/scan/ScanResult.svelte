<!--
	What the scan found, as a verdict first (with the site's own icon), then the next step: the script to
	paste when tools are missing, the lint findings when they need work, and the agent-ready badge to embed
	when all is well.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Clock from '@lucide/svelte/icons/clock';
	import Link from '@lucide/svelte/icons/link';
	import FileDown from '@lucide/svelte/icons/file-down';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import Wrench from '@lucide/svelte/icons/wrench';
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-exclamation-point';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { tokens as pageTokens } from '#lib/features/benchmark/bench.ts';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';
	import {
		BADGES,
		badgeEmbed,
		badgeMarkdown,
		errors,
		errorText,
		host,
		READY_SCORE,
		SCORE_COLUMNS,
		shareLink,
		type BadgeStyle
	} from './scan.ts';
	import { scanner } from './scanner.svelte.ts';
	import { highlightLite } from './highlight-lite.ts';

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
		scanner.error === 'invalid' ? m.errors.invalid : scanner.error ? errorText(scanner.error, m.errors) : ''
	);

	/** The install line, highlighted at build time. */

	/** A code sample that is not highlighted (built in the browser), shown in the same CodeBlock. */

	let step = $state(0);
	let badge: BadgeStyle = $state('flat');
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

	/** A cached report: when its copy expires (this clock), and the seconds left, ticking once a second. */
	let expiresAt = $state<number | null>(null);
	let now = $state(Date.now());
	$effect(() => {
		const left = scanner.report?.cached?.expires_in_s;
		expiresAt = left == null ? null : Date.now() + left * 1000;
		now = Date.now();
		if (expiresAt == null) return;
		const timer = setInterval(() => {
			now = Date.now();
			if (expiresAt != null && now >= expiresAt) clearInterval(timer);
		}, 1000);
		return () => clearInterval(timer);
	});
	const secondsLeft = $derived(expiresAt == null ? null : Math.max(0, Math.ceil((expiresAt - now) / 1000)));
	const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
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

	/**
	 * Save PDF: the browser's print dialog (every browser offers "Save as PDF"), with only the result card
	 * on the page (`data-printing`, see base.css) and the file named after the site.
	 */
	function savePdf(site: string) {
		const root = document.documentElement;
		const title = document.title;
		document.title = `webmcpx scan · ${site}`;
		root.dataset.printing = '';
		addEventListener(
			'afterprint',
			() => {
				delete root.dataset.printing;
				document.title = title;
			},
			{ once: true }
		);
		print();
	}

	async function share(url: string) {
		const link = shareLink(location.origin, url, i18n.href('/'));
		// On a phone, the system share sheet (WhatsApp, X, Instagram...); on a computer, the link copied.
		if (navigator.share && matchMedia('(pointer: coarse)').matches) {
			try {
				await navigator.share({ title: `${host(url)} · webmcpx`, url: link });
				return;
			} catch (e) {
				// Closed by the reader: nothing to do. Refused (no gesture, policy): copy instead.
				if (e instanceof DOMException && e.name === 'AbortError') return;
			}
		}
		try {
			await navigator.clipboard.writeText(link);
			shared = true;
			setTimeout(() => (shared = false), 1600);
		} catch {
			// Clipboard denied; nothing else to do.
		}
	}
</script>

<div bind:this={box} aria-live="polite" class="mx-auto w-full max-w-3xl scroll-mt-24">
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
		<!-- data-print-area: Save PDF prints this card alone (see base.css). -->
		<Card padding="none" shadow="lg" class="overflow-hidden text-left" data-print-area>
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
										>{i18n.plural(r.page_tokens, m.result.tokens, {
											n: pageTokens(r.page_tokens, i18n.intl)
										})}</strong
									>{/snippet}
							</Rich>
						{:else if r.verdict === 'issues' && !errors(r)}
							{fmt(m.result.basics, { tools: i18n.plural(r.tools.length, m.result.toolCount) })}
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
					{#if secondsLeft != null}
						<!-- From the scanner's cache: say so, and count down to when a scan runs fresh again. -->
						<p
							class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3"
							data-testid="cached"
						>
							<Clock class="size-4 shrink-0" aria-hidden="true" />
							{#if secondsLeft > 0}
								<span
									>{m.result.cache.label}
									<span class="tabular-nums">{fmt(m.result.cache.expires, { time: clock(secondsLeft) })}</span
									></span
								>
							{:else}
								<span>{m.result.cache.expired}</span>
								<button
									type="button"
									class="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
									onclick={() => scanner.run(r.url)}>{m.result.cache.rescan}</button
								>
							{/if}
						</p>
					{/if}
				</div>
			</div>

			{#if r.score_items?.length}
				{@const items = new Map(r.score_items.map((i) => [i.id, i]))}
				<!-- The agent-ready score: the number, the bar to clear, then every check by group, with how to fix what misses. -->
				<section class="border-t-2 border-ink px-5 py-5 sm:px-7" aria-labelledby="score-title">
					<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
						<h3 id="score-title" class="font-mono text-xs tracking-wider text-ink-2 uppercase">
							{m.result.score.title}
						</h3>
						<p class="font-display text-4xl leading-none font-bold tabular-nums">
							<span class={r.score >= READY_SCORE ? 'marker' : undefined}
								>{fmt(m.result.score.of, { score: i18n.number(r.score) })}</span
							>
						</p>
						<p class="text-sm text-ink-3">
							{fmt(m.result.score.need, { min: i18n.number(READY_SCORE) })}
						</p>
					</div>
					<!-- Two columns that stack their groups (no gap beside the one-check Agent cost group). -->
					<div class="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
						{#each SCORE_COLUMNS as column, c (c)}
							<div class="space-y-5">
								{#each column as g (g.id)}
									<div>
										<p class="font-mono text-[11px] tracking-wider text-ink-3 uppercase">
											{m.result.score.groups[g.id]}
										</p>
										<ul class="mt-2 space-y-2">
											{#each g.items as id (id)}
												{@const it = items.get(id)}
												{#if it}
													{@const ok = it.points === it.max}
													<li class="flex gap-2.5 text-sm">
														<span
															class={[
																'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink',
																ok ? 'bg-marker' : 'bg-card'
															]}
															aria-hidden="true"
															>{#if ok}<Check size={11} strokeWidth={3} />{:else}<X
																	size={11}
																	strokeWidth={3}
																/>{/if}</span
														>
														<span class="min-w-0 flex-1">
															<span class="flex items-baseline justify-between gap-3">
																<span class={ok ? 'font-medium' : 'font-medium text-ink-2'}
																	>{m.result.score.items[id].label}</span
																>
																<span class="font-mono text-xs text-ink-3 tabular-nums"
																	>{i18n.number(it.points)}/{i18n.number(it.max)}</span
																>
															</span>
															{#if id === 'cost'}
																<!-- What the cost check measured: the tokens to read the page, or that tools spare it. -->
																<span class="mt-0.5 block text-xs text-pretty text-ink-3"
																	>{r.tools.length
																		? m.result.score.items.cost.tools
																		: fmt(m.result.score.items.cost.read, {
																				tokens: i18n.plural(r.page_tokens, m.result.tokens, {
																					n: pageTokens(r.page_tokens, i18n.intl)
																				})
																			})}</span
																>
															{/if}
															{#if !ok}<span class="mt-0.5 block text-xs text-pretty text-ink-3"
																	>{m.result.score.items[id].fix}</span
																>{/if}
														</span>
													</li>
												{/if}
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if r.tools.length}
				<div class="border-t-2 border-ink bg-paper-2 px-5 py-4 sm:px-7">
					<p class="mb-3 font-mono text-[11px] tracking-wider text-ink-3 uppercase">{m.result.toolsTitle}</p>
					<ul class="flex flex-wrap items-center gap-2" aria-label={m.result.tools}>
						{#each r.tools.slice(0, 3) as t, i (i)}
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
						{#if r.tools.length > 3}<li class="px-1 py-0.5 text-xs text-ink-3">
								{fmt(m.result.more, { n: i18n.number(r.tools.length - 3) })}
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
						snippet={highlightLite('npx webmcpx lint src/', 'sh')}
						title={m.result.terminal}
						class="shadow-none"
					/>
				</div>
			{:else}
				{@const embed = badgeEmbed(location.origin, r.url, badge, m.result.badgeTitle, i18n.href('/'))}
				{@const markdown = badgeMarkdown(location.origin, r.url, badge, m.result.badgeTitle, i18n.href('/'))}
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="font-medium">{m.result.badge}</p>
					<!-- Just the badges, our own artwork (content/badges/); the picked one gets a ring, its name and fit are
					     its label for screen readers and its tooltip. -->
					<fieldset class="mt-4 flex flex-wrap items-center gap-3">
						<legend class="sr-only">{m.result.badgeStyle}</legend>
						{#each BADGES as b (b.id)}
							<label
								title={m.badges[b.id].fits}
								class="cursor-pointer rounded-xl p-2 ring-2 ring-transparent transition hover:ring-hairline has-checked:ring-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink [&_svg]:block"
							>
								<input type="radio" name="badge-style" value={b.id} bind:group={badge} class="sr-only" />
								<span class="sr-only">{m.badges[b.id].name}: {m.badges[b.id].fits}</span>
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<span aria-hidden="true">{@html b.svg}</span>
							</label>
						{/each}
					</fieldset>
					<!-- HTML for sites (the SVG inline, nothing loaded from us); Markdown for READMEs (an image we serve). -->
					<p class="mt-5 mb-2 text-sm font-medium">{m.result.badgeHtml}</p>
					<CodeBlock snippet={highlightLite(embed, 'html')} title="badge.html" class="shadow-none" compact />
					<p class="mt-4 mb-2 text-sm font-medium">{m.result.badgeMarkdown}</p>
					<CodeBlock snippet={highlightLite(markdown, 'md')} title="README.md" class="shadow-none" compact />
				</div>
			{/if}

			<!-- Only in the PDF: when, where, and the link that re-runs the scan. -->
			<p
				class="hidden border-t-2 border-ink px-5 py-3 text-xs [overflow-wrap:anywhere] text-ink-3 sm:px-7 print:block"
			>
				{fmt(m.result.printed, {
					date: new Date().toLocaleDateString(i18n.intl, { dateStyle: 'long' }),
					link: shareLink('https://webmcpx.dev', r.url, i18n.href('/'))
				})}
			</p>
			<div class="flex flex-wrap gap-3 border-t-2 border-ink p-5 sm:px-7" data-print-hide>
				{#if r.verdict === 'missing'}
					<Button href="#for-sites" variant="marker" size="sm"
						><Wrench aria-hidden="true" />{m.result.fix}</Button
					>
				{/if}
				<Button variant="outline" size="sm" onclick={() => share(r.url)}>
					<Link aria-hidden="true" />{shared ? m.result.shared : m.result.share}
				</Button>
				<Button variant="outline" size="sm" onclick={() => savePdf(host(r.final_url))}>
					<FileDown aria-hidden="true" />{m.result.save}
				</Button>
				<!-- The scanner's post image (1600×900, 16:9 for X and other feeds; same origin, so `download` names the file). -->
				<Button
					variant="outline"
					size="sm"
					href={`/og/scan.png?url=${encodeURIComponent(r.url)}&size=post${i18n.code === 'en' ? '' : `&lang=${i18n.code}`}`}
					download={`webmcpx-scan-${host(r.final_url)}.png`}
				>
					<ImageDown aria-hidden="true" />{m.result.savePng}
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
