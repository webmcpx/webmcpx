#!/usr/bin/env node
// npx webmcpx: WebMCP for any agent, in any Chromium, today.
//   webmcpx mcp                      MCP server: your agent calls the tools of any page it opens
//   webmcpx tools <url>              list a page's WebMCP tools (great on localhost)
//   webmcpx call <url> <tool> [json] call one and print the result
import { parseArgs } from "node:util";
import { describe, named, serve } from "../agent/mcp.js";
import { Session, failed, mcpResult } from "../agent/session.js";

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = paint(1);
const dim = paint(2);
const green = paint(32);
const yellow = paint(33);

const HELP = `${bold("webmcpx")}: WebMCP for any agent, in any Chromium, today.

${bold("Give your agent the tools of every page it opens")}
  Claude Code   claude mcp add webmcpx -- npx -y webmcpx mcp
  Codex         codex mcp add webmcpx -- npx -y webmcpx mcp
  Cursor, VS Code, Windsurf (mcp.json):
                { "mcpServers": { "webmcpx": { "command": "npx", "args": ["-y", "webmcpx", "mcp"] } } }

${bold("Check your own site's tools")} ${dim("(no Chrome flags)")}
  npx webmcpx tools localhost:3000
  npx webmcpx call localhost:3000 search_page '{"query": "pricing"}'

${bold("Commands")}
  mcp                         MCP server over stdio
  tools <url>                 list the page's WebMCP tools
  call <url> <tool> [json]    call one tool and print its result

${bold("Options")}
  --headed                    show the browser window
  --browser <path>            Chrome, Chromium, Edge or Brave to use (or WEBMCPX_CHROME)
  --cdp <url>                 use a browser you started with --remote-debugging-port

Every page gets search_page, fetch_as_markdown and get_page_context, plus the site's own tools.
The linter is the Rust CLI: cargo install webmcpx. Docs: https://webmcpx.dev`;

const usage = (message) => {
  console.error(`${message}\n\nRun "npx webmcpx --help" for usage.`);
  process.exit(2);
};

function parse(argv) {
  try {
    return parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        headed: { type: "boolean" },
        browser: { type: "string" },
        cdp: { type: "string" },
        help: { type: "boolean", short: "h" },
        version: { type: "boolean", short: "v" },
      },
    });
  } catch (e) {
    return usage(e.message);
  }
}

const firstLine = (s, max = 72) => {
  const line = String(s ?? "").split("\n")[0];
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
};

function printTools(page) {
  if (page.tools === null) return console.log(describe(page));
  const own = page.tools.filter((t) => !t.standard);
  const standard = page.tools.filter((t) => t.standard);
  const width = Math.max(0, ...page.tools.map((t) => t.name.length)) + 2;
  const row = (t) => {
    const a = t.annotations ?? {};
    const tag = a.readOnlyHint ? dim("read-only ") : a.consequentialHint ? yellow("acts      ") : "          ";
    return `  ${bold(t.name.padEnd(width))}${tag}${dim(firstLine(t.description))}`;
  };
  console.log(`${bold(page.title || page.url)} ${dim(page.url)}\n`);
  if (own.length) {
    console.log(green(`✓ ${own.length} WebMCP tool${own.length === 1 ? "" : "s"} registered by the site`));
    for (const t of own) console.log(row(t));
  } else {
    console.log(yellow("○ The site registers no WebMCP tools of its own.") + dim(" Add them: https://webmcpx.dev/#fix"));
  }
  if (standard.length) {
    console.log(`\n${dim("+ standard tools webmcpx adds to every page")}`);
    for (const t of standard) console.log(row(t));
  }
  console.log(dim(`\nTry one: npx webmcpx call ${page.url} search_page '{"query": "..."}'`));
}

async function main() {
  const { values, positionals } = parse(process.argv.slice(2));
  const [command, ...rest] = positionals;
  if (values.version) {
    const { readFileSync } = await import("node:fs");
    return console.log(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version);
  }
  if (values.help || !command || command === "help") return console.log(HELP);
  const options = { headed: values.headed, browser: values.browser, cdp: values.cdp };

  if (command === "mcp") return serve(options);
  if (command === "lint") usage("The linter is the Rust CLI: cargo install webmcpx, then webmcpx lint <dir>.");
  if (command !== "tools" && command !== "call") usage(`Unknown command "${command}".`);

  const [url, name, json] = rest;
  if (!url) usage(`Give a URL: npx webmcpx ${command} localhost:3000`);
  if (command === "call" && !name) usage("Give a tool name: npx webmcpx call <url> <tool> [json]");
  let input = {};
  if (json) {
    try {
      input = JSON.parse(json);
    } catch {
      usage(`The input is not JSON: ${json}`);
    }
  }

  const session = new Session(options);
  try {
    const page = await session.goto(url);
    if (command === "tools") return printTools(page);
    const entries = named(page.tools ?? []);
    const tool = (entries.find((e) => e.tool.name === name) ?? entries.find((e) => e.name === name))?.tool;
    if (!tool) {
      console.error(`webmcpx: ${page.url} has no tool named "${name}". Run: npx webmcpx tools ${url}`);
      process.exitCode = 2;
      return;
    }
    const out = await session.call(tool, input);
    const mcp = mcpResult(out);
    let pretty = out;
    try {
      pretty = mcp
        ? mcp.content.map((c) => (c.type === "text" ? c.text : JSON.stringify(c))).join("\n")
        : JSON.stringify(JSON.parse(out), null, 2);
    } catch {
      // not JSON: print as is
    }
    console.log(pretty);
    if (failed(out)) process.exitCode = 1;
  } finally {
    session.close();
  }
}

main().catch((e) => {
  console.error(`webmcpx: ${e.message}`);
  process.exit(1);
});
