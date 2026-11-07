<script lang="ts">
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Button from '#lib/components/ui/Button.svelte';
	import { theme } from '#lib/theme.svelte.ts';

	const next = $derived(theme.current === 'dark' ? 'light' : 'dark');
</script>

<Button variant="ghost" size="icon" onclick={() => theme.toggle()} aria-label="Switch to {next} theme">
	{#if theme.current === 'dark'}<Sun aria-hidden="true" />{:else}<Moon aria-hidden="true" />{/if}
</Button>
