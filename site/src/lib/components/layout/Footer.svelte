<script lang="ts">
	import { COMMUNITY, DESIGN, NAV, NPM, REPO, SPEC, SPEC_ISSUES } from '#lib/content/site.ts';
	import Logo from './Logo.svelte';

	const COLUMNS = [
		{ title: 'On this page', links: NAV },
		{
			title: 'Project',
			links: [
				{ label: 'GitHub', href: REPO },
				{ label: 'npm package', href: NPM },
				{ label: 'Contributing', href: `${REPO}/blob/main/CONTRIBUTING.md` },
				{ label: 'Design system', href: DESIGN }
			]
		},
		{
			title: 'WebMCP',
			links: [
				{ label: 'Specification draft', href: SPEC },
				{ label: 'Spec issues', href: SPEC_ISSUES },
				{ label: 'webmcp.zone', href: COMMUNITY }
			]
		}
	];
</script>

<footer class="border-t border-border">
	<div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
		<div class="space-y-3 text-sm text-muted">
			<Logo class="text-fg" />
			<p class="max-w-xs">Standard WebMCP tools for any website, and a fast linter for your own.</p>
		</div>
		{#each COLUMNS as col (col.title)}
			<nav aria-label={col.title}>
				<h2 class="text-sm font-medium">{col.title}</h2>
				<ul class="mt-3 space-y-2 text-sm">
					{#each col.links as link (link.href)}
						<li><a href={link.href} class="text-muted transition hover:text-fg">{link.label}</a></li>
					{/each}
				</ul>
			</nav>
		{/each}
	</div>
	<div class="border-t border-border">
		<div class="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-subtle sm:px-6">
			<p>
				MIT OR Apache-2.0. A <a class="underline hover:text-fg" href={COMMUNITY}>webmcp.zone</a> community project.
			</p>
			<p>Not affiliated with the W3C WebMCP Community Group.</p>
		</div>
	</div>
</footer>
