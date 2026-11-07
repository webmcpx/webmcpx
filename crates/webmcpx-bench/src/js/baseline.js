// Baseline browser-agent tools (no WebMCP), in the style of DOM-snapshot agents: a text snapshot with
// numbered refs for interactive elements, plus click and fill by ref.
(() => {
  const INTERACTIVE = "a[href],button,input,select,textarea,summary,[role=button],[role=link],[contenteditable=true]";
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "HEAD"]);
  const squash = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  let refs = [];

  const label = (el) =>
    squash(el.getAttribute("aria-label") || el.labels?.[0]?.textContent || el.textContent ||
      el.getAttribute("placeholder") || el.getAttribute("title") || el.name).slice(0, 80);

  const describe = (el, n) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") {
      const type = el.type ? ` type=${el.type}` : "";
      return `[${n}] ${tag}${type} "${label(el)}" value="${el.value}"`;
    }
    return `[${n}] ${el.getAttribute("role") || (tag === "a" ? "link" : tag)} "${label(el)}"`;
  };

  function snapshot() {
    refs = [];
    const lines = [`Page: ${document.title} (${location.href})`];
    let line = "";
    const flush = () => {
      if (squash(line)) lines.push(squash(line));
      line = "";
    };
    // Text directly inside a `display: contents` element has no element of its own to ask
    // checkVisibility(), and hidden content can still be laid out (content-visibility: hidden, a closed
    // <details>). So check what checkVisibility() would: every ancestor up to the first one with a box
    // (whose own checkVisibility() the walk already passed, covering everything above it).
    const textShown = (text) => {
      if (getComputedStyle(text.parentElement).visibility !== "visible") return false;
      for (let el = text.parentElement; el; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.contentVisibility === "hidden" || el.hidden) return false;
        if (el.tagName === "DETAILS" && !el.open && !text.parentElement.closest("summary")) return false;
        if (style.display !== "contents") return true;
      }
      return true;
    };
    const walk = (node, throughContents = false) => {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!throughContents || textShown(child)) line += ` ${child.textContent}`;
          continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE || SKIP.has(child.tagName)) continue;
        // `display: contents` has no box, so checkVisibility() is false, but its children render: read
        // through it (frameworks such as SvelteKit wrap the whole page in one).
        if (getComputedStyle(child).display === "contents") {
          walk(child, true);
          continue;
        }
        if (!child.checkVisibility()) continue;
        if (child.matches(INTERACTIVE)) {
          flush();
          refs.push(child);
          lines.push(describe(child, refs.length));
          continue;
        }
        const inline = getComputedStyle(child).display.startsWith("inline");
        if (!inline) flush();
        if (/^H[1-6]$/.test(child.tagName)) lines.push(`${"#".repeat(Number(child.tagName[1]))} ${squash(child.textContent)}`);
        else walk(child);
        if (!inline) flush();
      }
    };
    walk(document.body);
    flush();
    return lines.join("\n");
  }

  const target = (n) => {
    const el = refs[n - 1];
    return el?.isConnected ? el : null;
  };
  const settle = () => new Promise((r) => setTimeout(r, 100));

  async function click(n) {
    const el = target(n);
    if (!el) return `Error: ref ${n} not found. Call read_page for fresh refs.`;
    el.scrollIntoView({ block: "center" });
    el.click();
    await settle();
    return `Clicked [${n}].`;
  }

  async function fill(n, value) {
    const el = target(n);
    if (!el) return `Error: ref ${n} not found. Call read_page for fresh refs.`;
    el.focus();
    el.value = String(value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    return `Filled [${n}].`;
  }

  Object.defineProperty(window, "__bench", { value: Object.freeze({ snapshot, click, fill }) });
})();
