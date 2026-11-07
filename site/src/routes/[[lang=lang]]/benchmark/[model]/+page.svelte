<!-- The benchmark for one model, for readers without JavaScript (the landing's switcher links here). -->
<script lang="ts">
	import Meta from '#lib/components/layout/Meta.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { modelLook } from '#lib/content/models.ts';
	import Proof from '#lib/features/proof/Proof.svelte';
	import { fmt, useI18n } from '#lib/i18n/index.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const i18n = useI18n();
	const name = $derived(modelLook(data.run.results.model).name);
</script>

<Meta
	title={fmt(i18n.m.meta.benchmark.title, { model: name })}
	description={fmt(i18n.m.meta.benchmark.description, { model: name })}
/>

<div class="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
	<a
		href="{i18n.href('/')}#proof"
		class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
	>
		<ArrowLeft size={16} aria-hidden="true" />{i18n.m.benchmarkPage.back}
	</a>
</div>
<h1 class="sr-only">{fmt(i18n.m.meta.benchmark.title, { model: name })}</h1>
<Proof runs={[data.run]} models={data.models} reproduce={data.reproduce} />
