// Svelte 3, 4 and 5: `useTool(definition)` in a component's script registers the tool while it is
// mounted. (In Svelte 5 you can also write `$effect(() => tool(definition).dispose)`.)
import { onMount } from "svelte";
import { tool } from "./tool.js";

export function useTool(definition) {
  onMount(() => tool(definition).dispose);
}
