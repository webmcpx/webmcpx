<script lang="ts">
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Stamp from '#lib/components/ui/Stamp.svelte';
	import { HOME, REPO } from '#lib/content/site.ts';
	import Logo from './Logo.svelte';

	const NAV = [
		{ label: 'Benchmark', href: `${HOME}#proof` },
		{ label: 'Install', href: `${HOME}#fix` },
		{ label: 'Issues', href: `${HOME}#issues` },
		{ label: 'Docs', href: `${REPO}#readme` }
	];
</script>

<header class="absolute inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-5">
	<nav aria-label="Main" class="mx-auto flex h-16 items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
		<div class="flex items-center gap-3">
			<a href={HOME} class="rounded-lg"><Logo /><span class="sr-only">home</span></a>
			<Stamp size="sm" class="hidden sm:inline-flex">v0.1</Stamp>
		</div>
		<ul class="hidden items-center gap-1 md:flex">
			{#each NAV as item (item.href)}
				<li>
					<a
						href={item.href}
						class="rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:bg-paper-2 hover:text-ink"
						>{item.label}</a
					>
				</li>
			{/each}
		</ul>
		<Button href={REPO} variant="outline" size="sm"><BrandIcon icon={siGithub} size={16} />GitHub</Button>
	</nav>
</header>
