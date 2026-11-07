<!-- A large icon on a tinted, softly lit tile: the visual anchor of feature and issue cards. -->
<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon: Component<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
		size?: 'md' | 'lg';
	}

	let { icon: Icon, size = 'md' }: Props = $props();
</script>

<span
	aria-hidden="true"
	class={[
		'relative inline-grid shrink-0 place-items-center rounded-2xl border border-accent/25 bg-linear-to-b from-accent-soft to-transparent text-accent-ink',
		'shadow-[inset_0_1px_0_0_var(--accent-soft)]',
		size === 'lg' ? 'size-16' : 'size-12'
	]}
>
	<Icon size={size === 'lg' ? 32 : 24} strokeWidth={1.6} aria-hidden={true} />
</span>
