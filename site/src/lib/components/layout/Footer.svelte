<script lang="ts">
	import { NOTICES } from '#lib/content/brand.ts';
	import { BRAND, COMMUNITY, NPM, REPO, SPEC } from '#lib/content/site.ts';

	const LINKS = [
		{ label: 'GitHub', href: REPO },
		{ label: 'npm', href: NPM },
		{ label: 'WebMCP spec', href: SPEC },
		{ label: 'webmcp.zone', href: COMMUNITY },
		{ label: 'Brand and design', href: BRAND }
	];
</script>

<footer
	class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3"
>
	<p>MIT OR Apache-2.0 · an independent community project</p>
	<nav aria-label="Footer">
		<ul class="flex flex-wrap gap-x-5 gap-y-1">
			{#each LINKS as l (l.href)}
				<li>
					<a href={l.href} class="font-semibold underline-offset-4 hover:text-ink hover:underline"
						>{l.label}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
	<ul class="w-full space-y-1 border-t border-hairline pt-4 text-xs">
		{#each NOTICES as n (n)}<li>{n}</li>{/each}
	</ul>
</footer>
