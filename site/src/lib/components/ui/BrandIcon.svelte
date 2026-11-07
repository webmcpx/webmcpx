<!-- A brand logo from simple-icons (Lucide has no brand icons). Decorative unless `title` is set. -->
<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	interface Props {
		icon: SimpleIcon;
		size?: number;
		title?: string;
		class?: string;
	}

	let { icon, size = 18, title, class: className }: Props = $props();
</script>

<svg
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="currentColor"
	class={className}
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title}
>
	<path d={icon.path} />
</svg>
