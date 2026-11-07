<!--
	What the scan found, as a verdict first (with the site's own icon), then the next step: the script to
	paste when tools are missing, the lint findings when they need work, and the agent-ready badge to embed
	when all is well.
-->
<script lang="ts">
	import Link from '@lucide/svelte/icons/link';
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
	import { tokens } from '#lib/features/benchmark/bench.ts';
	import { BADGES, badgeEmbed, errors, host, shareLink, type BadgeStyle } from './scan.ts';
	import { scanner } from './scanner.svelte.ts';

	const STEPS = [
		'Opening the page…',
		'Looking for WebMCP tools…',
		'Reading it like an agent…',
		'Linting the tools…'
	];
	const VERDICT = {
		ready: { stamp: 'Agent-ready', tone: 'good', icon: CircleCheck, fill: 'bg-good-soft' },
		issues: { stamp: 'Almost', tone: 'marker', icon: CircleAlert, fill: 'bg-marker' },
		missing: { stamp: 'Not yet', tone: 'bad', icon: CircleX, fill: 'bg-bad-soft' }
	} as const;

	/** The install line, highlighted at build time. */
	let { scriptTag }: { scriptTag: Highlighted } = $props();

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
			if (r && (r.top < 0 || r.bottom > innerHeight)) box?.scrollIntoView({ block: 'center' });
		});
	});

	async function share(url: string) {
		try {
			await navigator.clipboard.writeText(shareLink(location.origin, url));
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
				<p class="text-ink-2">{STEPS[step]}</p>
			</div>
		</Card>
	{:else if scanner.status === 'error'}
		<Card padding="md" shadow="none" class="border-dashed text-left">
			<p class="font-display font-bold">Couldn't scan that.</p>
			<p class="mt-1 text-sm text-ink-2">{scanner.error}</p>
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
						<Stamp tone={v.tone} size="lg">{v.stamp}</Stamp>
					</div>
					<p class="mt-2 text-ink-2">
						{#if r.verdict === 'missing'}
							No WebMCP tools. Agents have to read about <strong class="text-ink"
								>{tokens(r.page_tokens)} tokens</strong
							>
							of this page and guess.
						{:else if r.verdict === 'issues'}
							{r.tools.length} tools, but {errors(r)} lint {errors(r) === 1 ? 'error' : 'errors'} agents will trip
							on.
						{:else}
							{r.tools.length} tools agents can call directly. Nice.
						{/if}
					</p>
				</div>
			</div>

			{#if r.tools.length}
				<div class="border-t-2 border-ink bg-paper-2 px-5 py-4 sm:px-7">
					<ul class="flex flex-wrap gap-2" aria-label="Tools found">
						{#each r.tools.slice(0, 10) as t (t.name)}
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
								+{r.tools.length - 10} more
							</li>{/if}
					</ul>
					{#if r.diagnostics.length}
						<ul class="mt-4 space-y-1.5 text-sm" aria-label="Lint findings">
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
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="mb-3 font-medium">Fix it with one line. Paste it before &lt;/body&gt;:</p>
					<CodeBlock snippet={scriptTag} title="index.html" class="shadow-none" />
				</div>
			{:else if r.verdict === 'issues'}
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="mb-3 font-medium">Find every issue in your source, with fixes:</p>
					<CodeBlock snippet={plain('webmcpx lint src/')} title="terminal" class="shadow-none" />
				</div>
			{:else}
				{@const embed = badgeEmbed(location.origin, r.url, badge)}
				<div class="border-t-2 border-ink p-5 sm:px-7">
					<p class="font-medium">Show it. Pick a badge and paste it on your site:</p>
					<p class="mt-1 text-sm text-ink-3">
						The SVG is in the code, so nothing loads from us. It links to a live scan of your site, so anyone
						can check it.
					</p>
					<fieldset class="mt-4 grid gap-3 sm:grid-cols-3">
						<legend class="sr-only">Badge style</legend>
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
									<span class="font-medium">{b.name}</span>
									<span class="text-xs text-ink-3">{b.fits}</span>
								</span>
							</label>
						{/each}
					</fieldset>
					<CodeBlock snippet={plain(embed)} title="badge.html" class="mt-4 shadow-none" />
				</div>
			{/if}

			<div class="flex flex-wrap gap-3 border-t-2 border-ink p-5 sm:px-7">
				<Button variant="outline" size="sm" onclick={() => share(r.url)}>
					<Link aria-hidden="true" />{shared ? 'Link copied' : 'Share result'}
				</Button>
			</div>
		</Card>
	{/if}
</div>

{#if tip}
	<div
		{@attach portal}
		aria-hidden="true"
		class="pointer-events-none absolute z-50 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border-2 border-ink bg-ink px-3 py-2 text-sm text-paper shadow-hard-sm"
		style:left="{tip.left}px"
		style:top="{tip.top}px"
		style:translate={tip.above ? '0 -100%' : undefined}
	>
		{tip.text}
	</div>
{/if}
