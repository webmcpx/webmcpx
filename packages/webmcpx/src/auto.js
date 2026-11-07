// Drop-in: <script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.2/src/auto.js"></script>
// Registers the standard tools, and turns every <form toolname> into a tool (that code loads only
// on pages that have one).
import { register } from "./loader.js";

register();
const doc = globalThis.document;
const forms = () => import("./tool.js").then((m) => m.forms());
if (doc?.querySelector("form[toolname]")) forms();
else if (doc) {
  const watch = new MutationObserver(() => doc.querySelector("form[toolname]") && (watch.disconnect(), forms()));
  watch.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["toolname"] });
}
