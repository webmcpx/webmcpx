<!-- A small rubber-stamp label: verdicts, "live", counts. -->
<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const stamp = tv({
		base: 'inline-flex items-center gap-1.5 rounded-full border-2 border-ink font-mono font-semibold tracking-wide whitespace-nowrap uppercase [&_svg]:size-[1.1em]',
		variants: {
			tone: {
				plain: 'bg-card text-ink',
				marker: 'bg-marker text-ink',
				good: 'bg-good-soft text-ink',
				bad: 'bg-bad-soft text-ink',
				ink: 'bg-ink text-paper'
			},
			size: {
				sm: 'px-2 py-0.5 text-[10px]',
				md: 'px-2.5 py-0.5 text-[11px]',
				lg: 'px-3 py-1 text-xs'
			},
			tilt: { true: '-rotate-2' }
		},
		defaultVariants: { tone: 'plain', size: 'md' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props extends VariantProps<typeof stamp> {
		class?: string;
		children: Snippet;
	}

	let { tone, size, tilt, class: className, children }: Props = $props();
</script>

<span class={stamp({ tone, size, tilt, class: className })}>{@render children()}</span>
