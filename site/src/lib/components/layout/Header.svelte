<script lang="ts">
	import { siGithub } from 'simple-icons';
	import BrandIcon from '#lib/components/ui/BrandIcon.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { HOME, NAV, REPO } from '#lib/content/site.ts';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let scrolled = $state(false);
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 8)} />

<header
	class={[
		'sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300',
		scrolled ? 'border-border bg-bg/75' : 'border-transparent bg-transparent'
	]}
>
	<nav aria-label="Main" class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href={HOME} class="rounded-lg"><Logo /><span class="sr-only">home</span></a>
		<ul class="hidden items-center gap-1 text-sm md:flex">
			{#each NAV as item (item.href)}
				<li>
					<a
						href={item.href}
						class="rounded-lg px-3 py-2 text-muted transition hover:bg-surface-2 hover:text-fg"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
		<div class="flex items-center gap-1">
			<ThemeToggle />
			<Button href={REPO} size="sm" class="ml-1"><BrandIcon icon={siGithub} size={16} />GitHub</Button>
		</div>
	</nav>
</header>
