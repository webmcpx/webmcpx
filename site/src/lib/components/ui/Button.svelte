<!--
	Chunky pill button with a hard offset shadow that "presses" on click. A link when `href` is set,
	otherwise a <button>.
-->
<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const button = tv({
		base: [
			'inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-semibold whitespace-nowrap select-none',
			'shadow-hard transition-[translate,box-shadow] duration-150 ease-out-expo',
			'hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-lg',
			'active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
			'disabled:pointer-events-none disabled:opacity-60',
			'[&_svg]:size-[1.1em] [&_svg]:shrink-0'
		],
		variants: {
			variant: {
				solid: 'bg-ink text-paper',
				outline: 'bg-card text-ink',
				/** The highlighter yellow: the one action we want taken. */
				marker: 'bg-marker text-ink'
			},
			size: {
				sm: 'h-9 px-4 text-sm',
				md: 'h-11 px-5 text-sm',
				lg: 'h-13 px-7 text-base'
			}
		},
		defaultVariants: { variant: 'solid', size: 'md' }
	});

	export type ButtonVariants = VariantProps<typeof button>;
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = ButtonVariants &
		((HTMLAnchorAttributes & { href: string }) | (HTMLButtonAttributes & { href?: undefined }));

	let { variant, size, class: className, children, ...rest }: Props = $props();
	const classes = $derived(button({ variant, size, class: className as string | undefined }));
</script>

{#if rest.href !== undefined}
	<a class={classes} {...rest as HTMLAnchorAttributes}>{@render children?.()}</a>
{:else}
	<button type="button" class={classes} {...rest as HTMLButtonAttributes}>{@render children?.()}</button>
{/if}
