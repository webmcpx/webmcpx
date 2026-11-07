<!-- A link styled as a button when `href` is set, otherwise a <button>. -->
<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const button = tv({
		base: [
			'inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap select-none',
			'transition duration-200 ease-out-expo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
			'[&_svg]:size-4 [&_svg]:shrink-0'
		],
		variants: {
			variant: {
				primary: 'bg-accent text-on-accent shadow-glow hover:brightness-110',
				secondary: 'border border-border-strong bg-surface text-fg hover:border-subtle hover:bg-surface-2',
				ghost: 'text-muted hover:bg-surface-2 hover:text-fg'
			},
			size: {
				sm: 'h-8 px-3 text-sm',
				md: 'h-10 px-4 text-sm',
				lg: 'h-12 px-6 text-base',
				icon: 'size-9'
			}
		},
		defaultVariants: { variant: 'secondary', size: 'md' }
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
