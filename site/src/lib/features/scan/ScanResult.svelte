<!-- What the scan found, as a verdict first: ready, almost, or not yet, then the next step. -->
<script lang="ts">
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Link from '@lucide/svelte/icons/link';
	import { tick } from 'svelte';
	import CircleAlert from '@lucide/svelte/icons/circle-exclamation-point';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { tokens } from '#lib/features/benchmark/bench.ts';
	import { errors, host, shareLink } from './scan.ts';
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

	let step = $state(0);
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
					class="hidden size-12 shrink-0 place-items-center rounded-xl border-2 border-ink sm:grid {v.fill}"
				>
					<v.icon aria-hidden="true" />
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
							<li class="rounded-full border-2 border-ink bg-card px-2.5 py-0.5 font-mono text-xs">
								{t.name}
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

			<div class="flex flex-wrap gap-3 border-t-2 border-ink p-5 sm:px-7">
				{#if r.verdict !== 'ready'}
					<Button href="#fix" size="sm"><ArrowDown aria-hidden="true" />Fix it with one line</Button>
				{/if}
				<Button variant="outline" size="sm" onclick={() => share(r.url)}>
					<Link aria-hidden="true" />{shared ? 'Link copied' : 'Share result'}
				</Button>
			</div>
		</Card>
	{/if}
</div>
