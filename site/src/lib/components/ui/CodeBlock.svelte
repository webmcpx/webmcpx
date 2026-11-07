<script lang="ts">
	let { code, label = 'Copy' }: { code: string; label?: string } = $props();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="group relative">
	<pre
		class="overflow-x-auto rounded-xl bg-zinc-900 p-4 pr-20 font-mono text-sm leading-relaxed text-zinc-100 dark:bg-zinc-900/80 dark:ring-1 dark:ring-zinc-800"><code>{code}</code></pre>
	<button
		type="button"
		onclick={copy}
		class="absolute top-3 right-3 rounded-md bg-zinc-700 px-2 py-1 shadow-[-12px_0_12px_var(--color-zinc-900)] text-xs text-zinc-100 hover:bg-zinc-600"
	>
		{copied ? 'Copied' : label}
	</button>
</div>
