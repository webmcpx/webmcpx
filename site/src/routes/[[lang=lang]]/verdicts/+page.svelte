<!-- How the scanner decides: the three verdicts, how a scan runs, and where to say a verdict is wrong. -->
<script lang="ts">
	import Meta from '#lib/components/layout/Meta.svelte';
	import Section from '#lib/components/ui/Section.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { ERROR_RULES, RULES_URL, VERDICT_ISSUE_URL } from '#lib/content/verdicts.ts';
	import { useI18n } from '#lib/i18n/index.svelte.ts';
	import Rich from '#lib/i18n/Rich.svelte';

	const i18n = useI18n();
	const m = $derived(i18n.m.verdicts);
	const names = $derived(i18n.m.scan.verdicts);
	const TONES = { ready: 'good', issues: 'marker', missing: 'bad' } as const;
	const linkClass = 'font-medium text-ink underline decoration-marker decoration-2 underline-offset-4';
</script>

<Meta title={i18n.m.meta.verdicts.title} description={i18n.m.meta.verdicts.description} />

<h1 class="sr-only">{m.title}</h1>
<Section id="verdicts" title={m.title} lead={m.lead}>
	<dl class="grid gap-4 md:grid-cols-3">
		{#each ['ready', 'issues', 'missing'] as const as id (id)}
			<div class="rounded-card border-2 border-ink bg-card p-5">
				<dt><Stamp tone={TONES[id]}>{names[id]}</Stamp></dt>
				<dd class="mt-3 text-pretty text-ink-2">
					<Rich text={m.items[id]}
						>{#snippet rules()}{#each ERROR_RULES as rule, i (rule)}{i ? ', ' : ''}<code
									class="font-mono text-sm">{rule}</code
								>{/each}{/snippet}</Rich
					>
				</dd>
			</div>
		{/each}
	</dl>

	<h2 class="mt-14 font-display text-2xl font-bold">{m.how.title}</h2>
	<ol class="mt-4 max-w-3xl list-decimal space-y-2 pl-5 text-pretty text-ink-2">
		{#each m.how.steps as step (step)}<li>{step}</li>{/each}
	</ol>
	<p class="mt-6 max-w-3xl text-ink-2">
		<a class={linkClass} href={RULES_URL}>{m.rules}</a>
	</p>
	<p class="mt-10 max-w-3xl text-lg text-pretty">
		<Rich text={m.disagree}
			>{#snippet link()}<a class={linkClass} href={VERDICT_ISSUE_URL}>{m.disagreeLink}</a>{/snippet}</Rich
		>
	</p>
</Section>
