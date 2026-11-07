<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	export const card = tv({
		base: 'relative rounded-2xl border border-border bg-surface',
		variants: {
			interactive: {
				true: 'transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-glow'
			},
			padding: { none: '', md: 'p-5', lg: 'p-6 sm:p-8' }
		},
		defaultVariants: { padding: 'md' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		interactive?: boolean;
		padding?: 'none' | 'md' | 'lg';
		children: Snippet;
	}

	let { interactive = false, padding, class: className, children, ...rest }: Props = $props();
</script>

<div class={card({ interactive, padding, class: className as string | undefined })} {...rest}>
	{@render children()}
</div>
