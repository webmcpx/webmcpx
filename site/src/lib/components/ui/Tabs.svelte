<!--
	Accessible tabs (WAI-ARIA tabs pattern): arrow keys, Home and End move between tabs; only the active
	tab is in the tab order. The active tab is bindable: `<Tabs {items} bind:value>`.
-->
<script lang="ts" generics="T extends { id: string; label: string }">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		value?: string;
		/** Names the tab list for screen readers. */
		label: string;
		tab?: Snippet<[T]>;
		panel: Snippet<[T]>;
		class?: string;
		listClass?: string;
	}

	let {
		items,
		value = $bindable(items[0]?.id),
		label,
		tab,
		panel,
		class: className,
		listClass
	}: Props = $props();

	const uid = $props.id();
	const buttons: HTMLButtonElement[] = $state([]);
	const active = $derived(items.find((i) => i.id === value) ?? items[0]);

	function onkeydown(e: KeyboardEvent, index: number) {
		const last = items.length - 1;
		const next =
			e.key === 'ArrowRight'
				? index === last
					? 0
					: index + 1
				: e.key === 'ArrowLeft'
					? index === 0
						? last
						: index - 1
					: e.key === 'Home'
						? 0
						: e.key === 'End'
							? last
							: null;
		if (next === null) return;
		e.preventDefault();
		value = items[next].id;
		buttons[next]?.focus();
	}
</script>

<div class={className}>
	<div role="tablist" aria-label={label} class={['flex gap-1 overflow-x-auto', listClass]}>
		{#each items as item, i (item.id)}
			{@const selected = item.id === active?.id}
			<button
				bind:this={buttons[i]}
				type="button"
				role="tab"
				id="{uid}-tab-{item.id}"
				aria-selected={selected}
				aria-controls="{uid}-panel"
				tabindex={selected ? 0 : -1}
				onclick={() => (value = item.id)}
				onkeydown={(e) => onkeydown(e, i)}
				class={[
					'inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition [&_svg]:size-4',
					selected
						? 'bg-surface-2 text-fg shadow-[inset_0_0_0_1px_var(--border-strong)]'
						: 'text-muted hover:text-fg'
				]}
			>
				{#if tab}{@render tab(item)}{:else}{item.label}{/if}
			</button>
		{/each}
	</div>
	{#if active}
		<div
			role="tabpanel"
			id="{uid}-panel"
			aria-labelledby="{uid}-tab-{active.id}"
			tabindex="-1"
			class="outline-none"
		>
			{@render panel(active)}
		</div>
	{/if}
</div>
