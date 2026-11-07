<!-- The webmcpx mark (a tool slot between brackets) and wordmark. -->
<script lang="ts">
	let { class: className }: { class?: string } = $props();
</script>

<span class={['inline-flex items-center gap-2.5 font-semibold tracking-tight', className]}>
	<svg viewBox="0 0 32 32" class="size-7" aria-hidden="true">
		<rect width="32" height="32" rx="9" class="fill-accent" />
		<path
			d="M11 9.5 7.5 16l3.5 6.5M21 9.5l3.5 6.5-3.5 6.5"
			fill="none"
			stroke-width="2.4"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="stroke-on-accent"
		/>
		<circle cx="16" cy="16" r="2.6" class="fill-on-accent" />
	</svg>
	<span class="font-mono text-[15px]">webmcpx</span>
</span>
