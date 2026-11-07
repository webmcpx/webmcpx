<!-- Copies text; announces it to screen readers. Styled for the dark code background. -->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { useI18n } from '#lib/i18n/index.svelte.ts';

	interface Props {
		text: string;
		/** What is copied, for screen readers: "Copy install command" (default: `ui.copyLabel`). */
		label?: string;
		class?: string;
	}

	let { text, label, class: className }: Props = $props();
	const i18n = useI18n();
	const m = $derived(i18n.m.ui);
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
	aria-label={label ?? m.copyLabel}
	class={[
		'inline-flex h-8 items-center gap-1.5 rounded-full border-2 border-on-code/40 px-3 text-xs font-medium text-on-code transition',
		'hover:border-on-code hover:bg-on-code hover:text-code',
		className
	]}
>
	{#if copied}<Check size={14} aria-hidden="true" />{m.copied}{:else}<Copy
			size={14}
			aria-hidden="true"
		/>{m.copy}{/if}
</button>
<span class="sr-only" aria-live="polite">{copied ? m.copied : ''}</span>
