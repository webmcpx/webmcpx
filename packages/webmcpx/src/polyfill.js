// Installs the W3C WebMCP polyfill (https://github.com/w3c-oss/webmcp-polyfill) where the page has no
// WebMCP, so an agent that drives the browser itself (Playwright, Selenium, Puppeteer, CDP; Firefox,
// WebKit, Chromium without the flag) finds the tools at document.modelContext. Never over a native one,
// not even a legacy navigator.modelContext. The drop-in (auto.js) loads it on its own; from npm,
// `import "webmcpx/polyfill"` before register() or tool().
import { installWebMCP } from "@w3c/webmcp-polyfill";

const doc = globalThis.document;
if (doc && globalThis.isSecureContext && !("modelContext" in doc) && !globalThis.navigator?.modelContext) {
  try {
    installWebMCP();
  } catch {
    // A realm that forbids it (a frozen Document prototype) stays as it was: a page without WebMCP.
  }
}
