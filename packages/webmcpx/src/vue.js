// Vue 3: `useTool(definition)` registers the tool for the component's life. Pass a getter or a ref to
// re-register when the definition changes.
import { toValue, watchEffect } from "vue";
import { tool } from "./tool.js";

export function useTool(definition) {
  watchEffect((onCleanup) => onCleanup(tool(toValue(definition)).dispose));
}
