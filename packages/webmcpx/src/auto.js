// Drop-in: <script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx@0.2/dist/auto.js"></script>
// Standard tools, plus <form toolname> as tools (that code loads only where such a form exists).
// Where the page has no WebMCP (Firefox, Safari, Chromium without the flag), the W3C polyfill loads
// first, as its own file, so an agent driving the browser finds the tools at document.modelContext.
// Pages with native WebMCP never fetch it.
import { register } from "./loader.js";

const doc = globalThis.document;
const missing = doc && globalThis.isSecureContext && !("modelContext" in doc) && !globalThis.navigator?.modelContext;
(missing ? import("./polyfill.js").catch(() => {}) : Promise.resolve()).then(() => {
  register();
  const forms = () => import("./tool.js").then((m) => m.forms());
  if (doc?.querySelector("form[toolname]")) forms();
  else if (doc) {
    const watch = new MutationObserver(() => doc.querySelector("form[toolname]") && (watch.disconnect(), forms()));
    watch.observe(doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["toolname"] });
  }
});
