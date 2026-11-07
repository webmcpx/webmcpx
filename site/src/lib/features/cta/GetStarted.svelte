<script lang="ts">
	import BookOpen from '@lucide/svelte/icons/book-open';
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import CodeBlock from '#lib/components/ui/CodeBlock.svelte';
	import { REPO } from '#lib/content/site.ts';
	import type { Highlighted } from '#lib/content/snippets.ts';
	import Reveal from '#lib/motion/Reveal.svelte';

	let { scriptTag }: { scriptTag: Highlighted } = $props();
</script>

<section
	id="get-started"
	aria-labelledby="get-started-title"
	class="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6"
>
	<Reveal>
		<div
			class="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center shadow-glow sm:px-12 sm:py-20"
		>
			<div
				aria-hidden="true"
				class="absolute inset-x-0 -bottom-48 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-accent-soft blur-3xl"
			></div>
			<h2 id="get-started-title" class="text-headline font-semibold text-balance">
				Make your site agent-ready.
			</h2>
			<p class="mx-auto mt-4 max-w-xl text-pretty text-muted">
				Paste one line before <code class="font-mono text-fg">&lt;/body&gt;</code>. Where WebMCP is missing,
				it does nothing.
			</p>
			<div class="mx-auto mt-8 max-w-3xl">
				<CodeBlock snippet={scriptTag} title="index.html" class="text-left" />
			</div>
			<div class="mt-8 flex flex-wrap justify-center gap-3">
				<Button href="{REPO}#readme" variant="primary" size="lg"
					><BookOpen aria-hidden="true" />Read the docs</Button
				>
				<Button href={REPO} size="lg"><BrandIcon icon={siGithub} />View on GitHub</Button>
			</div>
		</div>
	</Reveal>
</section>
