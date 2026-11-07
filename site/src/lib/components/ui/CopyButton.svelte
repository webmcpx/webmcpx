<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';

	interface Props {
		text: string;
		/** What is copied, for screen readers: "Copy install command". */
		label?: string;
		class?: string;
	}

	let { text, label = 'Copy to clipboard', class: className }: Props = $props();
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1600);
		} catch {
			// Clipboard can be denied (insecure context, permissions); the text stays selectable.
		}
	}
</script>

<button
	type="button"
	onclick={copy}
	aria-label={label}
	class={[
		'inline-grid size-8 place-items-center rounded-lg border border-border bg-surface text-muted transition',
		'hover:border-border-strong hover:text-fg',
		className
	]}
>
	{#if copied}
		<Check size={15} class="text-accent-ink" aria-hidden="true" />
	{:else}
		<Copy size={15} aria-hidden="true" />
	{/if}
</button>
<span class="sr-only" aria-live="polite">{copied ? 'Copied' : ''}</span>
