// Baseline browser-agent tools (no WebMCP), in the style of DOM-snapshot agents (Playwright MCP,
// browser-use): a text snapshot with numbered refs for interactive elements, where links show their
// destination and selects their options, plus click and fill by ref. Navigation and paging through a
// long snapshot are done by the harness (arm.rs).
(() => {
  const INTERACTIVE = "a[href],button,input,select,textarea,summary,[role=button],[role=link],[contenteditable=true]";
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "SVG", "HEAD"]);
  const squash = (s) => (s ?? "").replace(/\s+/g, " ").trim();
  let refs = [];

  const label = (el) =>
    squash(el.getAttribute("aria-label") || el.labels?.[0]?.textContent || el.textContent ||
      el.getAttribute("placeholder") || el.getAttribute("title") || el.name).slice(0, 200);
  // Where a link goes, relative to this site when it stays on it (shorter, and what an agent navigates to).
  const destination = (el) => {
    try {
      const url = new URL(el.href, location.href);
      return (url.origin === location.origin ? url.pathname + url.search + url.hash : url.href).slice(0, 300);
    } catch {
      return "";
    }
  };

  const describe = (el, n) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "select") {
      // Each option as seen, with its value when it differs (fill takes either).
      const options = [...el.options].slice(0, 50).map((o) => {
        const text = squash(o.textContent);
        return text + (o.value !== text ? ` (value=${o.value})` : "") + (o.disabled ? " (disabled)" : "");
      });
      return `[${n}] select "${label(el)}" value="${el.value}" options: ${options.join(" | ")}`;
    }
    if (tag === "input" || tag === "textarea") {
      const type = el.type ? ` type=${el.type}` : "";
      return `[${n}] ${tag}${type} "${label(el)}" value="${el.value}"`;
    }
    const href = tag === "a" && el.href ? ` -> ${destination(el)}` : "";
    return `[${n}] ${el.getAttribute("role") || (tag === "a" ? "link" : tag)} "${label(el)}"${href}`;
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
    // A select takes an option's value or its visible label, like choosing it in the UI.
    const option = el.tagName === "SELECT" && [...el.options].find((o) => o.value === String(value) || squash(o.textContent) === squash(String(value)));
    el.value = option ? option.value : String(value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
    return `Filled [${n}].`;
  }

  Object.defineProperty(window, "__bench", { value: Object.freeze({ snapshot, click, fill }) });
})();
