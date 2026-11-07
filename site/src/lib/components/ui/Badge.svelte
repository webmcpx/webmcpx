<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const badge = tv({
		base: 'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap [&_svg]:size-3.5',
		variants: {
			tone: {
				neutral: 'border border-border bg-surface text-muted',
				accent: 'bg-accent-soft text-accent-ink',
				outline: 'border border-accent/40 text-accent-ink'
			},
			size: {
				sm: 'px-2 py-0.5 text-[11px] tracking-wide uppercase',
				md: 'px-3 py-1 text-xs'
			}
		},
		defaultVariants: { tone: 'neutral', size: 'md' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props extends VariantProps<typeof badge> {
		class?: string;
		children: Snippet;
	}

	let { tone, size, class: className, children }: Props = $props();
</script>

<span class={badge({ tone, size, class: className })}>{@render children()}</span>
