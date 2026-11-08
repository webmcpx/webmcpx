<!--
	Draws a site's logo from `content/logos.ts` in currentColor. Square marks render at `size`; wordmarks
	keep their aspect ratio at `size` tall. Decorative unless `title` is set (the label usually sits next
	to it, or is given as sr-only text by the caller).
-->
<script lang="ts">
	import type { Logo } from '#lib/content/logos.ts';

	interface Props {
		logo: Logo;
		/** Height in px. */
		size?: number;
		title?: string;
		class?: string;
	}

	let { logo, size = 20, title, class: className }: Props = $props();

	const uid = $props.id();
	const [, , w, h] = $derived(logo.viewBox.split(' ').map(Number));
</script>

<svg
	viewBox={logo.viewBox}
	height={size}
	width={Math.round((size * w) / h)}
	fill="currentColor"
	class={['shrink-0', className]}
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title}
>
	{#if logo.cutouts || logo.holes}
		<defs>
			<mask id="{uid}-cut" maskUnits="userSpaceOnUse">
				<rect x="-1e4" y="-1e4" width="2e4" height="2e4" fill="white" />
				{#each logo.cutouts as c, i (i)}
					<path
						d={c.d}
						fill="none"
						stroke="black"
						stroke-width={c.width}
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/each}
				{#each logo.holes ?? [] as h, i (i)}
					<path d={h.d} fill={h.keep ? 'white' : 'black'} />
				{/each}
			</mask>
		</defs>
	{/if}
	<g mask={logo.cutouts || logo.holes ? `url(#${uid}-cut)` : undefined}>
		{#each logo.paths as p, i (i)}
			<path d={p.d} fill-rule={p.evenodd ? 'evenodd' : undefined} />
		{/each}
		{#each logo.strokes ?? [] as s, i (i)}
			<path
				d={s.d}
				fill="none"
				stroke="currentColor"
				stroke-width={s.width}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/each}
	</g>
</svg>
