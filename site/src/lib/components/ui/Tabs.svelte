<!--
	Accessible tabs (WAI-ARIA tabs pattern): arrow keys, Home and End move between tabs; only the active
	tab is in the tab order. The active tab is bindable: `<Tabs {items} bind:value>`.
	Progressive: every panel is in the HTML. Inactive ones are hidden by base.css only when JavaScript runs
	(`[data-js]`, set before first paint), so without JavaScript all panels are readable, stacked.
	`lazy` renders only the active panel instead (for heavy panels); without JavaScript only the first shows.
-->
<script lang="ts" generics="T extends { id: string; label: string }">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		value?: string;
		/** Names the tab list for screen readers. */
		label: string;
		tab?: Snippet<[T]>;
		/** Renders one panel; `active` is false for panels hidden behind another tab. */
		panel: Snippet<[T, boolean]>;
		class?: string;
		listClass?: string;
		/** Replaces the default tab look (size, colors); style the selected tab with `aria-selected:`. */
		tabClass?: string;
		/** Render only the active panel; the tab list is hidden without JavaScript, where it could not switch. */
		lazy?: boolean;
	}

	let {
		items,
		value = $bindable(items[0]?.id),
		label,
		tab,
		panel,
		class: className,
		listClass,
		tabClass,
		lazy = false
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
	<div role="tablist" aria-label={label} class={['flex gap-1 overflow-x-auto', lazy && 'js-only', listClass]}>
		{#each items as item, i (item.id)}
			{@const selected = item.id === active?.id}
			<button
				bind:this={buttons[i]}
				type="button"
				role="tab"
				id="{uid}-tab-{item.id}"
				aria-selected={selected}
				aria-controls="{uid}-panel-{item.id}"
				tabindex={selected ? 0 : -1}
				onclick={() => (value = item.id)}
				onkeydown={(e) => onkeydown(e, i)}
				class={[
					'relative inline-flex shrink-0 items-center gap-2 rounded-full border-2 font-medium transition',
					tabClass ??
						'h-9 border-transparent px-4 text-sm text-ink-2 hover:border-ink hover:text-ink aria-selected:border-ink aria-selected:bg-ink aria-selected:text-paper [&_svg]:size-4'
				]}
			>
				{#if tab}{@render tab(item)}{:else}{item.label}{/if}
			</button>
		{/each}
	</div>
	{#each items as item (item.id)}
		{@const on = item.id === active?.id}
		<div
			role="tabpanel"
			id="{uid}-panel-{item.id}"
			aria-labelledby="{uid}-tab-{item.id}"
			tabindex="-1"
			data-inactive={on ? undefined : ''}
			class="outline-none"
		>
			{#if on || !lazy}{@render panel(item, on)}{/if}
		</div>
	{/each}
</div>
