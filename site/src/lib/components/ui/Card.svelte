<!-- An outlined paper card with a hard shadow. -->
<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	export const card = tv({
		base: 'relative rounded-card border-2 border-ink bg-card',
		variants: {
			shadow: { none: '', md: 'shadow-hard', lg: 'shadow-hard-lg' },
			interactive: {
				true: 'transition-[translate,box-shadow] duration-200 ease-out-expo hover:-translate-y-1 hover:shadow-hard-lg'
			},
			padding: { none: '', md: 'p-5', lg: 'p-6 sm:p-8' }
		},
		defaultVariants: { shadow: 'md', padding: 'md' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		shadow?: 'none' | 'md' | 'lg';
		interactive?: boolean;
		padding?: 'none' | 'md' | 'lg';
		children: Snippet;
	}

	let { shadow, interactive = false, padding, class: className, children, ...rest }: Props = $props();
</script>

<div class={card({ shadow, interactive, padding, class: className as string | undefined })} {...rest}>
	{@render children()}
</div>
