<!-- The webmcpx mark (a tool slot between brackets) and wordmark. -->
<script lang="ts">
	let { class: className }: { class?: string } = $props();
</script>

<span class={['inline-flex items-center gap-2', className]}>
	<svg viewBox="0 0 32 32" class="size-8" aria-hidden="true">
		<rect x="1.5" y="1.5" width="29" height="29" rx="9" class="fill-marker stroke-ink" stroke-width="3" />
		<path
			d="M11.5 10 8 16l3.5 6M20.5 10 24 16l-3.5 6"
			fill="none"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="stroke-ink"
		/>
		<circle cx="16" cy="16" r="2.4" class="fill-ink" />
	</svg>
	<span class="font-display text-xl font-bold tracking-tight">webmcpx</span>
</span>
