<script lang="ts">
	import { COMMUNITY, DESIGN, NPM, REPO, SPEC } from '#lib/content/site.ts';

	const LINKS = [
		{ label: 'GitHub', href: REPO },
		{ label: 'npm', href: NPM },
		{ label: 'WebMCP spec', href: SPEC },
		{ label: 'webmcp.zone', href: COMMUNITY },
		{ label: 'Design system', href: DESIGN }
	];
</script>

<footer
	class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3"
>
	<p>MIT OR Apache-2.0 · community project · not affiliated with the W3C WebMCP group</p>
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
</footer>
