// Every code sample on the site. Highlighted at build time (`server/highlight.ts`), so the browser gets
// plain HTML and no highlighter. Outputs are real: copied from the CLI and the tools, not written by hand.

export type Lang = 'html' | 'js' | 'sh' | 'json';

export interface CodeSample {
	lang: Lang;
	code: string;
}

export interface Highlighted extends CodeSample {
	html: string;
}

const SCRIPT_TAG =
	'<script type="module" src="https://cdn.jsdelivr.net/npm/webmcpx/src/auto.js"></' + 'script>';

export const SNIPPETS = {
	scriptTag: { lang: 'html', code: SCRIPT_TAG },
	npm: {
		lang: 'js',
		code: `// npm i webmcpx
import { register } from 'webmcpx';

const { registered, dispose } = await register({
  // Optional: also expose your backend search as \`search_site\`.
  searchSite: async (query, { limit }) =>
    (await fetch(\`/api/search?q=\${query}&n=\${limit}\`)).json(),
});`
	},
	agent: {
		lang: 'sh',
		code: `# Installs the webmcpx skill: your coding agent adds the tools and lints them.
npx skills add webmcpx/webmcpx`
	},
	cli: {
		lang: 'sh',
		code: `cargo install --path crates/webmcpx   # prebuilt binaries come with the first release
webmcpx lint src/`
	},
	agentCall: {
		lang: 'json',
		code: `{ "tool": "search_page", "input": { "query": "deploy timeout", "limit": 1 } }`
	},
	// `webmcpx-bench call <bench docs site> search_page`, reformatted.
	envelope: {
		lang: 'json',
		code: `{
  "ok": true,
  "data": {
    "results": [{
      "heading": "orbit deploy",
      "snippet": "orbit deploy --env production --timeout 180 --strategy blue-green",
      "url": "http://127.0.0.1:4173/sites/docs/#cmd-deploy"
    }]
  }
}`
	},
	lintCommands: {
		lang: 'sh',
		code: `webmcpx lint src/
webmcpx lint --fix               # removes invisible characters
webmcpx lint --format sarif      # also json, github, concise
webmcpx rules                    # every rule; \`webmcpx rule <name>\` explains one`
	},
	lintSource: {
		lang: 'js',
		code: `document.modelContext.registerTool({
  name: "Search Products",
  description: "",
  inputSchema: { type: "object", properties: { q: { type: "string" } } },
  async execute({ q }) {
    return JSON.stringify(await (await fetch(\`/api/search?q=\${q}\`)).json());
  },
});`
	},
	reproduce: {
		lang: 'sh',
		code: `git clone https://github.com/webmcpx/webmcpx
cd webmcpx && just setup
OPENAI_API_KEY=sk-... just bench`
	}
} satisfies Record<string, CodeSample>;

export type SnippetId = keyof typeof SNIPPETS;

/** `webmcpx lint tools.js` on `lintSource`, verbatim (exit code 1). */
export const LINT_OUTPUT = `tools.js:2:9: error[invalid-name] tool name contains ' '; only A-Z, a-z, 0-9, '_', '.' and '-' are allowed
  |   name: "Search Products",
  |         ^^^^^^^^^^^^^^^^^
tools.js:2:9: warning[missing-annotations] \`Search Products\` declares no annotations (readOnlyHint, consequentialHint)
  |   name: "Search Products",
  |         ^^^^^^^^^^^^^^^^^
tools.js:3:16: error[missing-description] \`Search Products\` has an empty description
  |   description: "",
  |                ^^
tools.js:4:48: warning[missing-param-description] parameter \`q\` of \`Search Products\` has no description
  |   inputSchema: { type: "object", properties: { q: { type: "string" } } },
  |                                                ^

2 error(s), 2 warning(s) in 1 tool(s).`;
