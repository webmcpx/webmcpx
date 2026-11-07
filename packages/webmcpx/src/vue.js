// Vue 2.7 and 3: `useTool(definition)` registers the tool for the component's life. Pass a getter or a
// ref to re-register when the definition changes.
import { unref, watchEffect } from "vue";
import { tool } from "./tool.js";

export function useTool(definition) {
  watchEffect((onCleanup) => {
    const current = typeof definition === "function" ? definition() : unref(definition);
    onCleanup(tool(current).dispose);
  });
}
