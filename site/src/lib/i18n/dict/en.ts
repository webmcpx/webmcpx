// English, the source language. Every other `dict/<code>.ts` is typed `Messages` and has the same shape.
//
// For translators:
// - Transcreate, don't translate: keep the meaning and the tone (short, factual, numbers over adjectives).
// - `{name}` is a placeholder: keep it (you may move it), never translate the name inside the braces.
// - Plurals (`p({ one, other })`): give the forms your language has (zero, one, two, few, many, other);
//   `other` is required. `{n}` is the number, already formatted.
// - Never translate: webmcpx, WebMCP, MCP, product and company names, code, tool names (`search_page`),
//   commands (`just serve`), file names (`index.html`), and anything in backticks.
// - "// max N" notes are layout limits (in characters, at 390 px wide unless said otherwise).

import type { Plural } from '../format.ts';

/** A count-dependent message (see `plural()`): keeps every plural category open to other languages. */
const p = (forms: Plural): Plural => forms;

const en = {
	layout: {
		skip: 'Skip to content',
		// The bar offered to visitors whose browser prefers this language, written in this language. Never
		// shown in English itself.
		suggest: {
			// max 40: one line on a phone, beside the action.
			text: 'This site is also in English.',
			// max 20
			action: 'Read in English',
			dismiss: 'Dismiss'
		}
	},

	meta: {
		verdicts: {
			title: 'How scan verdicts work · webmcpx',
			description: 'What each scan verdict means, how a scan runs, and where to say a verdict is wrong.'
		},
		home: {
			// max 60: search results cut longer titles. Leads with "WebMCP" (what people search for).
			title: 'webmcpx: WebMCP for every site and every agent',
			// max 160: search results cut longer descriptions. No benchmark number here: it needs its attribution.
			description:
				'Scan any site for WebMCP tools, make yours agent-ready with one line, and give Claude Code or Codex WebMCP on every site. Open source.'
		},
		brand: {
			// max 60
			title: 'Brand and design system · webmcpx',
			// max 160
			description:
				'The webmcpx brand manual and design system: logo, color, type, components and trademark use.'
		},
		benchmark: {
			// max 60. {model} is a model name (GPT-6.1 Sol).
			title: 'webmcpx benchmark: {model}',
			// max 160
			description: 'With and without WebMCP on {model}: tokens, time, steps and cost per question.'
		}
	},

	header: {
		/** Names the main navigation for screen readers. */
		nav: 'Main',
		home: 'home',
		menu: 'Menu',
		/** Names the language switcher. */
		language: 'Language',
		// Nav labels: max 10 each, ideally one word. The desktop pill holds all seven on one line at 1024 px.
		links: {
			why: 'Why',
			proof: 'Leaderboard',
			// The two audiences: people who run a site, and people who use an agent (two sections).
			sites: 'For sites',
			agents: 'For agents',
			// "vs" = versus: the section comparing WebMCP with MCP.
			vsMcp: 'vs MCP',
			issues: 'Gaps',
			docs: 'Docs'
		}
	},

	footer: {
		// max 70: the footer's big line, 3 lines at 320 px.
		tagline: 'Standard WebMCP tools for any website, and a linter for your own.',
		license: 'MIT license · an independent community project.',
		// Tooltip of our own agent-ready badge, which links to a live scan of this site: max 60.
		badge: 'This site is agent-ready: check it live',
		// Column titles: max 12, shown in small capitals.
		columns: { product: 'Product', project: 'Project', webmcp: 'WebMCP' },
		// Link labels: max 24, one line in a narrow column.
		links: {
			scan: 'Scan your site',
			verdicts: 'How verdicts work',
			proof: 'Leaderboard',
			sites: 'For sites',
			agents: 'For agents',
			issues: 'Gaps',
			brand: 'Brand and design',
			trademark: 'Trademark policy',
			spec: 'Specification draft',
			specIssues: 'Spec issues'
		},
		// Legal notices: keep the names of organizations and trademarks exactly as written.
		notices: [
			'webmcpx is an independent project, not affiliated with or endorsed by LF Projects, the Agentic AI Foundation, Anthropic, W3C, Google or Microsoft.',
			'Model Context Protocol and the MCP logo are trademarks of LF Projects, LLC.',
			'W3C® is a trademark of the World Wide Web Consortium.'
		]
	},

	hero: {
		// Stamp: max 10.
		stamp: 'New',
		// {date} is the draft's date (2026-11-02). max 45: one line beside the stamp at 390 px.
		draft: 'Tracks the WebMCP draft of {date}',
		// The headline: at most 2 lines at 390 px (about 24 characters per line), and the marked part
		// should stay on one line. "Agent-ready" is our key term: the state a site is in once agents can
		// use it through tools; keep it short and use the same word everywhere it appears.
		title: { text: 'Make your site {mark}', mark: 'agent-ready' },
		// max 120: 3 lines on a phone.
		lead: 'In our benchmark, agents used {mark} with WebMCP (best case: {site}, {model}). See what agents get from your site, then fix it with one line.',
		// The part of the lead set in highlighter ({best} is the ratio).
		leadMark: 'up to {best} fewer tokens',
		// Without a published run (no number to quote).
		leadPlain:
			'AI agents are already reading your pages. See what they get, then give them real tools with one line.',
		// {sites} is a row of three site names (buttons that start a scan).
		try: 'Try {sites}',
		// Under the scan, for people who use agents but run no site: a question, then a link.
		entry: { question: 'Not running a site, just using agents?', agent: 'Set up your agent' }
	},

	logos: {
		// max 50. {count} is the highlighted "8,500+ sites".
		title: { text: '{count} already speak WebMCP', count: p({ one: '{n}+ site', other: '{n}+ sites' }) },
		lead: 'Click any of them to scan it live.',
		/** A logo button's name for screen readers. */
		scan: '{site}: scan this site',
		// The small print under the logos. {directory} and {knownGood} are links (their texts below);
		// {date}, {verifiedDate} and {checked} are dates (2026-11-05); {n} a count.
		note: 'Count: live sites in the {directory} ({date}). The stricter {knownGood} saw {n} sites register tools when it ran their pages ({verifiedDate}). Logos checked with the scanner on {checked}; they belong to their owners, no affiliation.',
		directory: 'webmcp.com directory',
		knownGood: 'Known Good index'
	},

	/** Labels of sources that are not proper names (those stay as they are, e.g. "Online-Mind2Web, 2025"). */
	sources: {
		// "Sources" label before the list: max 10, small capitals.
		title: 'Sources',
		draft: 'WebMCP draft',
		explainer: 'WebMCP explainer',
		ours: 'Our benchmark',
		snapshotCost: 'Snapshot cost, measured',
		shopifyCheckout: 'Shopify checkout',
		mcpSpec: 'MCP specification',
		shopifyBoth: 'Shopify on both'
	},

	what: {
		// Kicker: max 20, small capitals.
		kicker: 'What is WebMCP?',
		// For people who use agents but don't build browsers: who is behind it (the spec's editors are from
		// Google and Microsoft), what it fixes and why now. Only sourced facts: it is a W3C Community Group
		// draft, not a W3C Recommendation. No final period.
		title: 'WebMCP is becoming the web’s standard for AI agents. We’re all in',
		lead: 'Engineers from Google and Microsoft are drafting it at the W3C, the body behind the web’s standards, and Chrome and Edge are already testing it. Today Claude Code, Codex and every other agent use your site like a screenshot: they look, guess which button to press and try again. Slow, costly, easy to break. With WebMCP your site tells agents exactly what they can do, like search, read or add to cart, and they just ask. We believe every site will speak it, so we built webmcpx to let yours do it today.',
		// The links under the lead, one per claim: what each source shows, in a few words (max 80; a line
		// of small mono type that wraps). Keep product names, "Online-Mind2Web", "WindTunnel" and the W3C as is.
		sources: {
			mind2web: 'Online-Mind2Web: agents fail about 4 in 10 live tasks',
			snapshot: 'A page snapshot costs 12k to 77k tokens',
			windtunnel: 'WindTunnel: tools vs clicking, timed',
			draft: 'WebMCP draft, W3C Web Machine Learning CG (editors from Google and Microsoft)',
			status: 'Implementation status (Chrome and Edge origin trials)',
			chromeTrial: 'Chrome: WebMCP origin trial',
			chromeStatus: 'Chrome Platform Status',
			edgeTrial: 'Microsoft Edge: WebMCP origin trial',
			edgeExplainer: 'Microsoft Edge explainer',
			method: 'Our benchmark method'
		},
		// Three steps, each a short title (max 32) and one sentence.
		steps: {
			register: {
				title: 'Your site lists its tools',
				text: 'Each one is an action with a name and a short description, like “search products” or “add to cart”: the same things your buttons already do.'
			},
			list: {
				title: 'The agent sees the list',
				text: 'The browser hands it your site’s tools and what each one needs, so it doesn’t read the whole page and guess.'
			},
			call: {
				title: 'The agent uses them',
				text: 'Right in the visitor’s own tab, already signed in: no new server, no extra login.'
			}
		},
		// The bridge from the hand-written tool above to webmcpx: what it takes off your plate. Each claim
		// is what the loader does today (README, "Loader"). No final period on titles.
		webmcpx: {
			// Who we are and why webmcpx exists, right under the logo (facts only: see the footer notices).
			about:
				'An independent, open-source community project, not affiliated with the W3C or any browser maker. We build webmcpx so WebMCP pays off today: sites get good tools without writing them, agents get the same answers for fewer tokens, and every number we publish can be rerun.',
			title: 'Start with webmcpx today, on your site and in your agent',
			lead: 'Everything that keeps WebMCP off most sites today, solved: one line on your site, one command in your agent, and nothing else to worry about.',
			// The side-by-side that decides it: WebMCP by hand vs with webmcpx, one row per objection people
			// raise. Each claim is what webmcpx does today (README, the loader and the bridge). Labels max 32.
			compare: {
				caption: 'WebMCP by hand compared with webmcpx',
				hand: 'WebMCP by hand',
				webmcpx: 'With webmcpx'
			},
			items: {
				support: {
					label: 'Browser support',
					hand: 'Chrome and Edge only, behind a flag or an origin trial. Firefox and Safari: nothing yet.',
					webmcpx:
						'The official W3C polyfill wherever WebMCP is missing: your tools are there today in Chrome, Firefox and Safari.'
				},
				tools: {
					label: 'Tools on every page',
					hand: 'You design and write each one, page by page.',
					webmcpx: 'Search, read and page context on every page from one script tag. No code.'
				},
				actions: {
					label: 'Your own actions',
					hand: 'Schemas, annotations and error handling, written by hand for each one.',
					webmcpx: 'One tool() call, a hook for React, Vue or Svelte, or the forms you already have.'
				},
				agents: {
					label: 'Reaching Claude Code, Codex, Cursor',
					hand: 'Build your own bridge, or wait for each agent to support it.',
					webmcpx:
						'npx webmcpx mcp: each page’s tools, plus the standard ones on any site, even without webmcpx.'
				},
				draft: {
					label: 'Spec changes',
					hand: 'Follow every change to the draft and rewrite your tools.',
					webmcpx: 'We track the W3C draft and move with it: you update one package.'
				},
				correct: {
					label: 'Getting it right',
					hand: 'Result shapes, error codes, output budgets, paging, annotations: all yours to get right.',
					webmcpx:
						'Right by default: one result shape, error codes agents can act on, output budgets, paging and correct annotations.'
				},
				safe: {
					label: 'Safe for agents',
					hand: 'Hidden instructions and invisible characters in tool descriptions or page text: easy to miss, easy to exploit.',
					webmcpx:
						'Standard tools only read, hidden text stays out, invisible characters are stripped, and the linter flags hidden instructions in your tools.'
				},
				testing: {
					label: 'Testing it',
					hand: 'Turn on a Chrome flag, open DevTools and hope.',
					webmcpx:
						'npx webmcpx tools localhost:3000 lists your tools in any browser, no flag; the scanner checks any live URL.'
				},
				proof: {
					label: 'Proof it pays off',
					hand: 'Your guess.',
					// The leaderboard's best case, always named as one: {best} is a ratio (62×), {site} and {model}
					// where it was measured; all from the published runs.
					webmcpx:
						'A public benchmark of WebMCP vs reading the page: up to {best} fewer tokens for the same answers (best case: {site}, {model}). Rerun it with one command.',
					// Without a published run (no numbers to quote).
					webmcpxPlain: 'Every question and every run is public: rerun it with one command.'
				},
				cost: {
					label: 'Cost',
					hand: 'Your time, on every page and every change.',
					webmcpx: 'Free and open source (MIT), about 2.7 KB on load, no account, no server.'
				}
			},
			sites: 'Add it to your site',
			agents: 'Add it to your agent'
		}
	},
	why: {
		// Kicker: max 20, small capitals.
		kicker: 'Why WebMCP?',
		// Says plainly what the section shows (the benefits); no slogans.
		title: 'What your site gains with WebMCP',
		lead: 'WebMCP lets your page hand AI agents typed tools that run in the user’s own tab. Here is what that changes, strongest evidence first.',
		// Card labels: max 14, small capitals.
		today: 'Today',
		with: 'With WebMCP',
		// Each card: a title (max 32, 2 lines in a quarter-width card), the pain today, the gain with WebMCP.
		// Keep every number and claim as is: each one is backed by the source listed with it.
		reasons: {
			finish: {
				title: 'Agents that finish the job',
				pain: 'On live sites, the best agent tested failed about 4 in 10 tasks, mostly on filters, sorting and navigation.',
				gain: 'Agents call a tool with a typed input instead of guessing which button does what.'
			},
			tokens: {
				title: 'A fraction of the tokens',
				pain: 'One page snapshot can cost 12k to 77k tokens, and the agent sends it again at every step.',
				// {best} is a ratio (31×), {bestSite} a site name; both come from the published benchmark.
				gain: 'A call returns just the data it asked for: up to {best} fewer tokens on {bestSite} in our benchmark (best case).'
			},
			speed: {
				// "Seconds, not minutes": an idiom, adapt it.
				title: 'Seconds, not minutes',
				pain: 'Look, think, click, repeat: on hard live tasks, agents ran for up to 44 minutes.',
				gain: 'One call replaces a chain of clicks: a 3.4× faster median in WindTunnel’s benchmark.'
			},
			backend: {
				title: 'No new server. No OAuth',
				pain: 'Giving agents an API usually means a separate backend, duplicated state and an auth flow.',
				gain: 'Tools are your front-end code, running with the session the user already has. Shopify ships it this way.'
			},
			loop: {
				// "In the loop": an idiom (informed and in control), adapt it.
				title: 'The user stays in the loop',
				pain: 'Agents act out of sight, or send the user somewhere else.',
				gain: 'The agent works on the page the user sees, and tools can flag actions that need a confirmation.'
			},
			state: {
				title: 'Same cart, same form',
				pain: 'A backend API can’t see the cart, form or selection open in the user’s tab.',
				gain: 'Tools act on the state the user sees, so the page updates as the agent works.'
			},
			control: {
				title: 'You decide what agents can do',
				pain: 'An agent that reads the page can click anything the user can.',
				gain: 'You publish the actions, their inputs and your own validation.'
			},
			small: {
				title: 'Small to add, safe to ignore',
				pain: 'Agent readiness sounds like a big project.',
				gain: 'A few tool registrations. Browsers without WebMCP skip them, and one header turns them off.'
			}
		},
		// Keep "W3C Community Group draft", "not a W3C standard" and "origin trial" exact in meaning: this
		// line exists so no reason reads as more than it is. ChatGPT, Codex and Chrome are product names.
		status:
			'WebMCP is a W3C Community Group draft (2 November 2026), not a W3C standard. The ChatGPT desktop app’s browser and Codex can call a site’s WebMCP tools; Chrome runs it behind a flag or an origin trial. Annotations are hints a site declares, not guarantees.',
		// The reasons not shown as cards, in one line: {list} is their titles joined by the language's own
		// list format ("A, B and C").
		also: 'Also:'
	},

	proof: {
		// Kicker: max 20.
		kicker: 'Leaderboard',
		// Says plainly what the section shows (the saving per model); no slogans.
		title: 'How much WebMCP saves, model by model',
		lead: "One agent reads, clicks and fills using page snapshots; the other calls the site's WebMCP tools. Pick a model; biggest savings first.",
		/** Names the list of per-model pages (shown without JavaScript). */
		byModel: 'Benchmark by model',
		// Label: max 12, small capitals.
		models: 'Models',
		/** Names the model tabs. */
		model: 'Model',
		/** Names the site tabs. */
		site: 'Site',
		// The model's place on the leaderboard, read aloud on its badge.
		rank: 'Rank {n}',
		// Under the model tabs.
		ranking: 'Ranked by success with WebMCP, then by cost per run.',
		/** A heading for screen readers: the model and who makes it. */
		modelHeading: '{name} ({provider})',
		empty: {
			title: 'No run published yet',
			// {command} is `just bench`, shown as code.
			text: 'Run {command} and this fills in.'
		},
		// The selection rule: must stay next to the results. {results} is a link (the text below), {command}
		// is `just bench`. Plural by {total}.
		selected: p({
			one: 'Selected cases: {shown} of {total} question, where WebMCP used at most half the tokens. {results} are public, or run it yourself with {command}.',
			other:
				'Selected cases: {shown} of {total} questions, where WebMCP used at most half the tokens. {results} are public, or run it yourself with {command}.'
		}),
		results: 'All results',
		none: {
			// {model} is a model id (gpt-6.1-sol).
			title: 'No question met the bar on {model}',
			text: 'Every question and both arms are in the full results above.'
		},
		// Tag on a site tab for our local test sites: max 7, small capitals.
		local: 'local',
		// The two arms of the benchmark: max 16 each (stamps and chart labels).
		arms: { baseline: 'Without WebMCP', webmcp: 'With WebMCP' },
		// Under the big token count: max 10, small capitals.
		tokens: 'tokens',
		// {time} (3.4s), {steps} (4.0) and {cost} ($0.054, the cost of one run) are formatted numbers. max 50.
		stats: '{time} · {steps} steps · {cost} per task',
		/** Shown for a cost the run did not record. */
		na: 'n/a',
		// Stamps: max 14 with {n}, which is "3/3" (solved of runs).
		solved: 'Solved {n}',
		failed: 'Failed {n}',
		// The ratio circle: {value} is the ratio (10×) above; these labels max 14, small capitals.
		fewerTokens: 'fewer tokens',
		moreTokens: 'more tokens',
		// Link to the live site on phones: max 8.
		open: 'Open',
		/** After that link, for screen readers. */
		opens: '(opens {site})',
		rotator: {
			/** Names the rotating questions for screen readers. */
			label: 'Questions',
			/** What screen readers call the rotating block (`aria-roledescription`): one lowercase word. */
			role: 'carousel'
		},
		/** Names the detail tabs under a site's questions. */
		details: 'Details for {site}',
		// Tab labels: short, one or two words (the row wraps on phones); the shorter the better.
		tabs: {
			tokens: 'Tokens',
			duration_ms: 'Time',
			steps: 'Steps',
			cost_usd: 'Cost',
			tools: 'Tools',
			method: 'Method'
		},
		/** Per metric: the chart's name, its unit, and the lowercase form used in table headers. */
		metrics: {
			tokens: { label: 'Tokens', unit: 'tokens per run', column: 'tokens' },
			duration_ms: { label: 'Time', unit: 'seconds per run', column: 'time' },
			steps: { label: 'Steps', unit: 'model turns per run', column: 'steps' },
			cost_usd: { label: 'Cost', unit: 'USD per task', column: 'cost' }
		},
		chart: {
			// Column heads: max 12.
			question: 'Question',
			solved: 'Solved',
			/** Over the bars: "Tokens · tokens per run". */
			head: '{metric} · {unit}',
			/** The screen-reader table's caption. */
			// Next to the legend: every metric is lower-is-better (bars). max 24.
			better: 'Shorter is better',
			caption: '{metric} per question, {unit}; lower is better. Success rate per arm.',
			armMetric: '{arm}: {metric}',
			armSolved: '{arm}: solved',
			/** A row head in the screen-reader table: the site, then the question asked there. */
			row: '{site}: {question}',
			/** The site part of a row head, for our local test sites. */
			localSite: '{site} (local test site)'
		},
		method: {
			// {model} is a model id and {effort} a reasoning level (medium): both stay as they are, and the
			// sentence must start with {model}. Plural by {n}, the runs per question and arm.
			setup: p({
				one: '{model}, reasoning {effort}, headless Chrome. Same prompt and step limit in both arms; {n} run per question and arm.',
				other:
					'{model}, reasoning {effort}, headless Chrome. Same prompt and step limit in both arms; {n} runs per question and arm.'
			}),
			/** The same, for a run without a reasoning level. */
			setupNoEffort: p({
				one: '{model}, headless Chrome. Same prompt and step limit in both arms; {n} run per question and arm.',
				other:
					'{model}, headless Chrome. Same prompt and step limit in both arms; {n} runs per question and arm.'
			}),
			baseline: 'Without WebMCP: a DOM-snapshot agent that reads, clicks and fills.',
			webmcp: 'With WebMCP: only the tools the page registers (its own, or webmcpx’s on our test sites).',
			// "LLM judge": a model grading answers; keep the term.
			graded: 'Graded by facts in the answer and page state. No LLM judge.',
			live: 'A live site: it ships its own WebMCP tools.',
			local: 'A local test site: its tools come from webmcpx.',
			// The code block's title: max 20.
			// What the numbers can and can't say (a skeptic's questions, answered up front).
			scope:
				"30 questions on 6 sites, 27 of them read-only; the biggest savings come from the sites' own search tools.",
			runs: '3 runs per question and arm: 3 of 3 solved is evidence, not proof of 100%.',
			measures:
				"Time is the agent loop after the page loaded; cost is the model's API usage at dated list prices, cache included.",
			failures:
				'Every failed run says why in the results (bot check, answer not from the page, step limit…).',
			reproduce: 'reproduce it'
		},
		tools: {
			/** Names the tools table for screen readers. */
			label: 'WebMCP tools on {site}',
			// Plural by {n}, the number of tools.
			title: p({
				one: 'The {n} WebMCP tool {site} registers',
				other: 'The {n} WebMCP tools {site} registers'
			}),
			// Small capitals, max 60. {date} and {runDate} are dates (2026-11-05).
			fromRun: 'as the agent saw them · {date}',
			fromSnapshot: 'descriptions as registered {date} · benchmark ran {runDate}',
			// Column heads: "Called" max 8 (a narrow column).
			tool: 'Tool',
			description: 'Description',
			called: 'Called',
			notCalled: 'Not called',
			missing: '(not registered when the snapshot was taken)'
		}
	},

	versus: {
		kicker: 'WebMCP vs MCP',
		// Says plainly what the section shows (the difference, and that both are needed).
		title: 'How WebMCP differs from MCP, and why you need both',
		lead: 'WebMCP borrows MCP’s tool model, but it is a browser API, not the MCP protocol. They complement each other.',
		caption: 'WebMCP compared with MCP',
		/** The (hidden) head of the row labels column. */
		aspect: 'Aspect',
		// Row labels: max 22, small capitals in a 20%-wide column. Values: keep code (document.modelContext,
		// tools/list, readOnlyHint...) and protocol names (JSON-RPC, stdio, OAuth) as they are.
		rows: {
			where: {
				label: 'Where tools run',
				webmcp: 'In your page’s JavaScript, in the user’s tab.',
				mcp: 'In a server process, local (stdio) or remote.'
			},
			call: {
				label: 'How agents call them',
				webmcp: 'A browser API, document.modelContext; the browser mediates each call. No JSON-RPC.',
				mcp: 'JSON-RPC 2.0 over stdio or Streamable HTTP.'
			},
			run: {
				label: 'What you run',
				webmcp: 'Your existing front end. No new server.',
				mcp: 'An MCP server you host and operate.'
			},
			auth: {
				label: 'Auth',
				webmcp: 'The session the user is already signed in with. No tokens to issue.',
				mcp: 'OAuth-based authorization for remote servers.'
			},
			discovery: {
				label: 'Discovery',
				webmcp: 'Once the page is open. Nothing to find before a visit.',
				mcp: 'tools/list on a known endpoint, and public registries.'
			},
			lifetime: {
				label: 'Lifetime',
				webmcp: 'As long as the page is open.',
				mcp: 'Always on, with no browser needed.'
			},
			user: {
				label: 'The user',
				webmcp: 'Present, on the same page as the agent.',
				mcp: 'Optional: works headless.'
			},
			covers: {
				label: 'Covers',
				webmcp: 'Tools only, with input and output schemas.',
				mcp: 'Tools, resources and prompts, plus elicitation and extensions.'
			},
			hints: {
				label: 'Hints on tools',
				// The hint names are code: keep them.
				webmcp: 'readOnlyHint, consequentialHint, untrustedContentHint. Same-origin by default.',
				mcp: 'readOnlyHint, destructiveHint, idempotentHint, openWorldHint.'
			},
			status: {
				label: 'Status',
				webmcp: 'W3C Community Group draft. ChatGPT desktop and Codex call it; Chrome: origin trial.',
				mcp: 'A Linux Foundation project, 10,000+ public servers.'
			}
		},
		// Label: max 14, small capitals.
		useBoth: 'Use both',
		verdict:
			'MCP serves agents that never open your site. WebMCP serves agents working in your tab, beside your user. Run both on one backend: Shopify already does.'
	},

	// For people who run a site (the path after a scan): one line on the site. Product and library names
	// (ChatGPT, Codex, Claude Code, Cursor, Playwright, Selenium, Puppeteer, browser-use, CDP, Chrome,
	// Chromium, Firefox, Safari) stay as they are, here and in `agents`.
	fix: {
		// max 40: names the audience, as the nav's "For sites" does.
		title: 'For your site',
		// max 170 (it runs the full content width)
		lead: 'AI agents are already reading your pages. Give them real tools in two steps: ask your coding agent (Claude Code, Codex, Cursor), or do it by hand.',
		alternatives: { npm: 'npm', agent: 'Agent' },
		// Small capitals, max 50.
		facts: '~2.7 KB on load · Rust + WebAssembly · MIT license',
		// The HTML tab's note. {tag} is `</body>`: keep it.
		html: 'Paste it before {tag}. In browsers without WebMCP, it adds the W3C polyfill.',
		standard: {
			title: 'Standard tools: one line',
			lead: 'Search, read and page context on every page. No code.'
		}
	},

	// For people who use agents (no site, no scan needed): one prompt for the agent itself.
	agents: {
		// max 45
		title: 'For your agent',
		// max 260 (it runs the full content width)
		lead: 'Your agent reads every page the expensive way. Give it the page’s tools instead: on the sites we measured, the same answers for a fraction of the tokens. Works on any site, and it is the one MCP every Claude Code and Codex setup should have.',
		// One line, linked to the leaderboard. {low} and {high} are ratios (2.4×, 5.7×): each model's
		// tokens without WebMCP over its tokens with WebMCP, over its whole run. {n} (2 or more) is how many
		// models are on the leaderboard. `best` is used when there is one model, or one did not save.
		saving: {
			range: p({ other: '{low} to {high} fewer tokens across {n} models on the leaderboard.' }),
			best: 'Up to {high} fewer tokens on the leaderboard.',
			// Under that line, the losses: never hidden. {worse} is a count or a range across models ("6",
			// "5–7"), {total} the questions each model ran (35); plural by {total}.
			losses: p({
				other: 'Whole runs: on {worse} of {total} questions per model, WebMCP used more tokens.'
			})
		},
		prompt: 'One prompt: your agent sets itself up, then proves it on webmcpx.dev.',
		// {cmd} and {api} are code: keep them.
		ways: {
			mcp: {
				label: 'Agents with MCP',
				text: 'Claude Code, Codex, Cursor: add {cmd}. It opens pages in its own Chromium, no flag.'
			},
			browser: {
				label: 'Agents that drive a browser',
				text: 'Playwright, Selenium, Puppeteer, browser-use, CDP; Chrome, Firefox, Safari: call {api} in the page. Every site with webmcpx has it.'
			}
		},
		// The big number: "Up to" before a ratio (6.0×), "fewer tokens" after it.
		hype: {
			up: 'Up to',
			fewer: 'fewer tokens',
			same: 'Same answers.',
			bestCase: 'Best case: {site}, {model}'
		},
		worksWith: 'Works with any agent and browser',
		// Under the prompt: what it does (one sentence).
		note: 'One prompt: your agent sets itself up, uses WebMCP first everywhere, and proves it on webmcpx.dev.'
	},

	own: {
		title: 'Your site’s own actions',
		lead: 'Add to cart, book, search your catalog: the functions your buttons already call, as tools agents call directly.',
		notes: {
			agent:
				'Your agent reads what webmcpx does, finds the actions worth exposing in your project, asks you which ones to add, then adds and checks them.',
			form: 'No JavaScript: the WebMCP declarative API. The script tag adds it where the browser doesn’t have it yet.',
			js: 'From npm, or imported from the same CDN as the script tag.',
			hook: 'Registered while the component is mounted, gone when it unmounts.'
		}
	},

	verdicts: {
		title: 'How the scanner decides',
		lead: 'Three verdicts, open rules. If one looks wrong, tell us: that is the feedback that makes it better.',
		// {rules} is a list of lint rule names (code).
		items: {
			ready:
				'The page registers at least one WebMCP tool, the linter finds no errors in them, and the agent-ready score is 70 or more. Warnings, like a long name, don’t block it.',
			issues:
				'The page registers tools, but at least one has a linter error ({rules}, or a size past its hard limit), or the score is under 70.',
			missing:
				'The page registers no WebMCP tool. We show how many tokens an agent reading the page would spend instead.'
		},
		how: {
			title: 'How a scan runs',
			steps: [
				'We open the page in headless Chrome on our server, with no cookies and no login.',
				'Before the page’s scripts run, we add a WebMCP host, so the page registers its tools as it would in an agent’s browser. It also takes the older navigator.modelContext and provideContext, so sites built on them still show their tools.',
				'Once the page has loaded and its tools settle, we read each tool’s name, description, input schema and annotations, and lint them.',
				'Tokens are estimated from the page’s text snapshot: its characters divided by four.',
				'For the score, the same browser fetches the site’s robots.txt, llms.txt, sitemap, Markdown version, Link headers, Agent Skills index and API catalog (3 s each, same origin, no cookies), and only keeps whether each is there.',
				'The score, out of 100: WebMCP 50 (tools 25, no lint errors 15, every tool described 5, every tool annotated 5), agent cost 15 (full with tools; else by the page’s token count), readable 20 and discoverable 15 (5 per check).',
				'A result is reused for 10 minutes; each visitor can start one new scan a minute.'
			]
		},
		rules: 'Every lint rule, with its reasons',
		disagree: 'Think a verdict is wrong? {link}',
		disagreeLink: 'Open an issue with the scan link.'
	},

	issues: {
		kicker: 'From the spec tracker',
		title: 'Spec requests webmcpx already handles',
		// Each card: a title (max 28) and what webmcpx does about it. Keep code (search_page, registerTool(),
		// --fix, modelContext...) as it is; "our policy" marks our own rule, not the draft's.
		items: {
			shared: {
				title: 'Shared tools',
				fix: 'One script tag registers webmcpx’s search_page, fetch_as_markdown and get_page_context; search_site when you pass your search.'
			},
			errors: {
				title: 'Errors agents can act on',
				fix: 'webmcpx tools return expected failures as a result: a stable error code, a retryable flag and a hint.'
			},
			paging: {
				title: 'Paged results',
				fix: 'Every webmcpx tool uses one result shape, with output budgets and truncated + next_cursor paging.'
			},
			frozen: {
				title: 'Frozen modelContext',
				fix: 'webmcpx only calls registerTool(), never assigns. Tested against a frozen modelContext.'
			},
			hidden: {
				title: 'Hidden instructions',
				fix: 'Stripped from page text at runtime; the linter flags and --fix removes them in source.'
			},
			length: {
				title: 'Length limits',
				fix: 'webmcpx lint checks the name rules and flags descriptions past Chrome’s guidance.'
			},
			budget: {
				title: 'Tool budget',
				fix: 'webmcpx lint warns above 20 tools per page and errors above 100 (our policy, not the draft’s).'
			}
		}
	},

	faq: {
		kicker: 'FAQ',
		// Says plainly what the section is; no slogans.
		title: 'Questions about WebMCP',
		// Each answer: two or three short sentences, plain text (also published as FAQPage structured
		// data). Keep code (registerTool(), npx ..., tool()) and names as they are.
		items: {
			what: {
				q: 'What is WebMCP?',
				a: 'A browser API, drafted in the W3C Web Machine Learning Community Group: a page registers tools with document.modelContext.registerTool(), and an AI agent calls them instead of reading screenshots or the page’s HTML. The tools run in the user’s own tab.'
			},
			site: {
				q: 'How do I make my site agent-ready?',
				a: 'Add the webmcpx script tag: every page gets standard tools (search, read, page context) with no other code. Then register your own actions, like search or add to cart, with tool(). Scan your site here to check.'
			},
			agent: {
				q: 'How do I use WebMCP from Claude Code or Codex?',
				a: 'Run claude mcp add webmcpx -- npx -y webmcpx mcp (Codex: codex mcp add webmcpx -- npx -y webmcpx mcp). Your agent then opens pages in its own Chromium and gets each page’s WebMCP tools plus the standard ones, on any site.'
			},
			browsers: {
				q: 'Does it work in Firefox and Safari?',
				a: 'Yes. Where a browser has no WebMCP of its own, webmcpx loads the W3C WebMCP polyfill, on HTTPS pages. Chrome, Firefox and Safari all see the same tools.'
			},
			standard: {
				q: 'Is WebMCP a W3C standard?',
				a: 'Not yet. It is a draft of the W3C Web Machine Learning Community Group (2 November 2026). Chrome and Edge run it in origin trials, Mozilla is neutral and WebKit has objections. webmcpx tracks the draft and loads the W3C polyfill, so your tools work now and move with the spec.'
			},
			safe: {
				q: 'Is it safe to let agents call my site’s tools?',
				a: 'The tools run in the user’s own tab, with the user’s own permissions, and can do nothing the page could not already do. webmcpx’s standard tools only read what the page shows, with invisible characters stripped. Mark your own tools that change things with consequentialHint so agents can ask the user first, and let the linter flag hidden instructions in tool descriptions.'
			},
			mcp: {
				q: 'Is WebMCP the same as MCP?',
				a: 'No. WebMCP borrows MCP’s tool model, but it is a browser API, not the MCP protocol: the tools live in the page and run in the user’s tab. They complement each other, and the webmcpx MCP server connects the two.'
			}
		}
	},
	scan: {
		/** Names the scan form for screen readers. */
		form: 'Scan a site',
		address: "Your site's address",
		// The input's placeholder: a made-up domain, max 16.
		placeholder: 'yoursite.com',
		// Buttons: max 12.
		submit: 'Scan my site',
		scanning: 'Scanning…',
		// Shown one after the other while a scan runs: max 32 each.
		steps: [
			'Opening the page…',
			'Looking for WebMCP tools…',
			'Reading it like an agent…',
			'Linting the tools…'
		],
		// Verdict stamps: max 12 each. "Agent-ready" is the key term (see hero.title).
		verdicts: { ready: 'Agent-ready', issues: 'Almost', missing: 'Not agent-ready' },
		failed: "Couldn't scan that.",
		result: {
			// {tokens} is the highlighted token count (the text below). Plural by the count; {n} is shown short (12k).
			missing: 'No WebMCP tools. Agents have to read about {tokens} of this page and guess.',
			tokens: p({ one: '{n} token', other: '{n} tokens' }),
			// {tools} is the tool count (toolCount); plural by {n}, the number of lint errors.
			issues: p({
				one: '{tools}, but {n} lint error agents will trip on.',
				other: '{tools}, but {n} lint errors agents will trip on.'
			}),
			toolCount: p({ one: '{n} tool', other: '{n} tools' }),
			// Tools with no lint errors, but under the agent-ready score: {tools} is the tool count.
			basics: '{tools} and no lint errors, but a few agent basics are missing.',
			// A report from the scanner's cache: {time} counts down (m:ss) to when a scan runs fresh again.
			cache: {
				label: 'Cached result.',
				expires: 'Expires in {time}.',
				expired: 'This cached result has expired.',
				rescan: 'Scan again'
			},
			// The agent-ready score: {score} is 0 to 100, {min} the score an agent-ready site needs (70).
			score: {
				title: 'Agent-ready score',
				of: '{score}/100',
				need: 'Agent-ready from {min}, with WebMCP tools and no lint errors.',
				groups: { webmcp: 'WebMCP', cost: 'Agent cost', readable: 'Readable', discoverable: 'Discoverable' },
				// Each check: a short label (max 24) and, when it misses, how to fix it (one sentence).
				items: {
					tools: {
						label: 'WebMCP tools',
						fix: 'Add one script tag: every page gets search, read and page context.'
					},
					lint: {
						label: 'No lint errors',
						fix: 'Fix the findings below (npx webmcpx lint finds them in your source).'
					},
					descriptions: {
						label: 'Every tool described',
						fix: 'Give each tool a description agents can act on.'
					},
					annotations: {
						label: 'Every tool annotated',
						fix: 'Mark each tool readOnlyHint, or consequentialHint when it changes something.'
					},
					cost: {
						label: 'Cheap for agents',
						fix: 'Agents read the whole page: tools let them ask for just what they need.',
						// What was measured: {tokens} is the token count ("324 tokens"); `tools` when the page has tools.
						read: 'About {tokens} to read this page.',
						tools: 'Agents call its tools instead of reading the page.'
					},
					llms_txt: {
						label: 'llms.txt',
						fix: 'Publish /llms.txt: what your site is and where agents find the rest.'
					},
					markdown: {
						label: 'Markdown version',
						fix: 'Serve the page as Markdown (Accept: text/markdown) or link one with rel="alternate".'
					},
					robots: {
						label: 'Open to AI agents',
						fix: 'Your robots.txt shuts AI agents out (Disallow: / for them).'
					},
					sitemap: { label: 'Sitemap', fix: 'Publish /sitemap.xml, or a Sitemap: line in robots.txt.' },
					link_headers: {
						label: 'Link headers',
						fix: 'Add Link response headers that point agents to llms.txt and your docs (RFC 8288).'
					},
					agent_skills: { label: 'Agent Skills index', fix: 'Publish /.well-known/agent-skills/index.json.' },
					api_catalog: { label: 'API catalog', fix: 'List your APIs in /.well-known/api-catalog (RFC 9727).' }
				}
			},
			// "Nice." is a short, warm aside; adapt it.
			ready: p({
				one: '{n} tool agents can call directly. Nice.',
				other: '{n} tools agents can call directly. Nice.'
			}),
			// Scanning webmcpx.dev itself: "We'd better be." is a wink (we make the tool); adapt it.
			readySelf: p({
				one: '{n} tool agents can call directly. We’d better be.',
				other: '{n} tools agents can call directly. We’d better be.'
			}),
			/** Names the list of tool chips. */
			tools: 'Tools found',
			more: '+{n} more',
			/** Names the list of lint findings. */
			findings: 'Lint findings',
			// Under the WebMCP checks of a site without tools, jumps to the install steps; keep WebMCP: max 18.
			fix: 'Fix WebMCP',
			lint: 'Find every issue in your source, with fixes:',
			// A code block's title: max 12.
			terminal: 'terminal',
			badge: 'Your site earned the agent-ready badge',
			badgeNote:
				'The SVG is in the code, so nothing loads from us. It links to a live scan of your site, so anyone can check it.',
			badgeStyle: 'Badge style',
			// Titles over the two embed codes (HTML for sites, Markdown for READMEs), and over the page's tools.
			badgeHtml: 'HTML',
			badgeMarkdown: 'Or Markdown',
			toolsTitle: 'WebMCP tools on this page',
			// The badge's tooltip in the code people paste on their site: max 60.
			badgeTitle: 'Agent-ready: check it live with webmcpx',
			// Button: max 18.
			share: 'Share',
			shared: 'Link copied',
			// Saves the result card as a PDF through the print dialog: max 18.
			save: 'Save PDF',
			// Downloads the result's share image (PNG): max 18.
			savePng: 'Save PNG',
			// Printed under the card in the PDF: {date} is the day, {link} re-runs the scan.
			printed: 'Scanned by webmcpx.dev on {date}. Scan again: {link}'
		},
		// Badge styles: the name (max 8) and where it fits (max 22).
		badges: {
			card: { name: 'Card', fits: 'Light pages' },
			flat: { name: 'Flat', fits: 'Footers' },
			dark: { name: 'Dark', fits: 'Dark pages' }
		},
		errors: {
			// The examples are domains: keep them.
			invalid: 'Type a site like notion.com or https://example.com/docs.',
			// `just serve` is a command: keep it.
			offline: 'The scanner is offline. Run it locally with `just serve`.',
			noScanner: 'This copy of the site has no scanner. Run it locally with `just serve`.',
			// {s} is a number of seconds.
			busy: 'The scanner is busy. Try again in {s} s.',
			busyLater: 'The scanner is busy. Try again in a minute.',
			// The visitor's own previous scan has not ended (one scan at a time).
			running: 'Your previous scan is still running. Wait for it to finish, then scan again.',
			timeout: 'The page took too long to answer.',
			badAddress: "That address can't be scanned.",
			unreadable: "The page couldn't be read.",
			/** One of the two above, then the server's own reason (in English). */
			withDetail: '{lead} ({detail})',
			// {status} is an HTTP status code (500).
			other: 'Scan failed ({status}).'
		}
	},

	brand: {
		// Kicker: max 30, small capitals.
		kicker: 'Brand manual · design system',
		// "Paper, ink and a junction": the three things the brand is made of (the mark is the "Junction").
		title: 'Paper, ink and a junction',
		lead: 'A page declares its tools; the browser sits in between; page and agent meet without one replacing the other. The mark draws that meeting. Everything below is rendered from the code that ships.',
		name: {
			kicker: '01 · Name',
			// The name stays lowercase in every language: keep "webmcpx" and the point about lowercase.
			title: 'webmcpx, always lowercase',
			rules: [
				'Always lowercase: webmcpx, also at the start of a sentence (rewrite the sentence instead).',
				'In code and commands, set it in Geist Mono.',
				'WebMCP is the browser API, spelled as the draft spells it.',
				'webmcpx is not WebMCP itself and never claims the name WebMCP.'
			]
		},
		logo: {
			kicker: '02 · Logo',
			title: 'Three marks, one idea',
			lead: 'Use the Junction everywhere you can. The Card is the badge and app icon (32px and up); the Page with slot is the alternate.',
			// The marks' names (use the same names in logo.lead) and roles.
			marks: {
				junction: { name: 'Junction', role: 'Primary mark' },
				card: { name: 'Card', role: 'Badge and app icon, 32px and up' },
				'page-slot': { name: 'Page with slot', role: 'Alternate' }
			},
			// Each downloadable file: a label (max 10) and its use.
			assets: {
				mark: { label: 'Mark', use: 'One color (currentColor). Docs, READMEs, slides.' },
				inverse: { label: 'Inverse', use: 'Paper on an ink square.' },
				favicon: { label: 'Favicon', use: '16–32px. Follows light and dark mode.' },
				appIcon: { label: 'App icon', use: 'Color, for 512px exports.' },
				avatar: { label: 'Avatar', use: '20% padding: safe in a circle crop.' }
			},
			/** A file's line: {label} is in bold (assetLabel), then its use. */
			asset: '{label} {use}',
			assetLabel: '{label}.',
			/** A download link's name: "Download Junction Mark SVG". */
			download: 'Download {mark} {asset} SVG'
		},
		construction: {
			kicker: '03 · Construction',
			title: 'A 24-unit grid, a 2-unit gap',
			lead: 'Two filled chevrons, mirror images. Arms 4.5 units at the ends, apexes cut flat over 2 units, and a 2-unit gap between them that never closes: that gap is the browser.',
			/** The grid drawing's text alternative. */
			grid: 'The Junction drawn on its 24-unit grid',
			clearSpace: 'Clear space',
			clearSpaceText:
				'Keep free space around the mark equal to half its height, and around the lockup equal to the height of the x.',
			minSize: 'Minimum size',
			minSizeText: 'The mark down to 16px only as the favicon variant. The lockup at least 24px tall.'
		},
		color: {
			kicker: '04 · Color',
			title: 'Paper and ink, one highlighter',
			// tokens.css is a file name: keep it.
			lead: "Values are read from tokens.css. Pick the artwork for the background it lands on, not for the reader's theme.",
			// What each color token is for: max 40 (a small swatch card).
			uses: {
				paper: 'Page background',
				'paper-2': 'Sunken panels, tracks',
				card: 'Cards and inputs on paper',
				ink: 'Text, outlines, shadows, primary buttons',
				'ink-2': 'Secondary text',
				'ink-3': 'Captions and labels',
				hairline: 'Thin dividers',
				marker: 'Highlighter: the one accent',
				good: 'Ready, passed (text)',
				'good-soft': 'Ready, passed (fill)',
				bad: 'Missing, failed (text)',
				'bad-soft': 'Missing, failed (fill)',
				code: 'Code block background',
				'on-code': 'Text on code blocks'
			},
			pairs: 'Approved text pairs',
			pairsNote: 'WCAG 2.2 AA asks 4.5:1 for body text; a test enforces it.',
			pairsText: 'Text on background',
			pairsContrast: 'Contrast',
			/** {text} and {bg} are token names (ink, paper): keep them. */
			pair: '{text} on {bg}',
			yellow: 'Yellow is a background, never a figure',
			// {ratio} is a contrast ratio (1.10:1); {word} is the highlighted example (the text below).
			yellowText:
				'Highlighter yellow on paper measures {ratio}: it cannot carry a shape or text. Use it behind ink: a {word}, a chip, an app icon.',
			yellowWord: 'highlighted word'
		},
		type: {
			kicker: '05 · Type',
			// Font names: keep them.
			title: 'Bricolage, Geist, Geist Mono',
			// Each style: font name (keep) and role, and a sample in that style. The giant sample must fit
			// one line at 390 px (max 12); reuse your word for "agent-ready" (see hero.title).
			styles: {
				giant: { name: 'Bricolage Grotesque · giant', sample: 'Agent-ready' },
				headline: { name: 'Bricolage Grotesque · headline', sample: 'Same agent. Same question.' },
				body: { name: 'Geist · body', sample: 'Short sentences you can check. One idea each.' },
				// The sample is code: keep it.
				mono: { name: 'Geist Mono · code and labels', sample: 'document.modelContext.registerTool()' }
			}
		},
		components: {
			kicker: '06 · Components',
			title: '2px outlines, hard shadows',
			// The path and "tailwind-variants" are code: keep them.
			lead: 'src/lib/components/ui. Variants are tailwind-variants recipes; the shapes come from the same tokens.',
			// "Button", "Stamp" etc. are component names (code): keep them; translate the rest.
			buttons: 'Button · variant × size',
			stamps: 'Stamp · tone',
			card: 'Card',
			interactive: 'Interactive card (hover)',
			empty: 'Empty state',
			tabs: 'Tabs',
			/** Names the example tab list. */
			tabsLabel: 'Example',
			// Example tab labels: max 8.
			tabsItems: { one: 'First', two: 'Second' },
			tabsPanel: 'Panel for {label}. Use the arrow keys.',
			codeBlock: 'CodeBlock (highlighted at build time)'
		},
		misuse: {
			kicker: '07 · Misuse',
			title: 'Don’t',
			items: {
				stretch: 'Don’t stretch or squash it',
				rotate: 'Don’t rotate it',
				outline: 'Don’t add outlines or strokes',
				yellow: 'Don’t draw it in yellow',
				shadow: 'Don’t add shadows or effects to the mark',
				touch: 'Don’t close the gap between the chevrons'
			}
		},
		trademark: {
			kicker: '08 · Trademarks',
			// "Don't look official": the point is to never imply endorsement; adapt the phrasing.
			title: 'Use the name freely. Don’t look official',
			// TRADEMARK.md is a file name: keep it.
			lead: 'The code is MIT licensed; the name and the marks are not covered by that license. The full policy is in TRADEMARK.md.',
			sayIt: 'Say it like this',
			never: 'Never',
			// Approved and forbidden phrasings: in your language, give the phrasing people would actually write
			// there, with the same legal meaning (see TRADEMARK.md). Keep the organization names exact.
			ok: [
				'Implements the WebMCP Draft Community Group Report of the W3C Web Machine Learning Community Group (not a W3C Standard).',
				'Built with webmcpx. Compatible with webmcpx.',
				'Works in Chrome with the WebMCP flag enabled.'
			],
			no: ['The official WebMCP library', 'W3C WebMCP standard', 'MCP certified', 'webmcpx for Chrome'],
			voice: 'Voice',
			voiceText: 'Short sentences you can check. Numbers over adjectives.',
			wordsUse: 'Words we use',
			wordsAvoid: 'Words we avoid',
			// Stamps: max 36 each.
			use: [
				'declares',
				'exposes',
				'calls',
				'measured',
				'tracks the Community Group draft',
				'works with webmcpx'
			],
			avoid: ['official', 'W3C standard', 'W3C-compliant', 'MCP certified', 'revolutionary', 'magic'],
			notices: 'Notices',
			// Button: max 22; TRADEMARK.md is a file name.
			read: 'Read TRADEMARK.md'
		}
	},

	benchmarkPage: {
		back: 'Back to the landing'
	},

	ui: {
		// Copy button: max 8 (a small button on code blocks).
		copy: 'Copy',
		copied: 'Copied',
		/** The copy button's name for screen readers when nothing names what it copies. */
		copyLabel: 'Copy to clipboard',
		/** "Copy index.html": {title} is the code block's title. */
		copyNamed: 'Copy {title}',
		/** Names a scrollable code block: "index.html code". */
		code: '{title} code',
		// Code block titles (max 12, small mono type): text to paste into an AI agent, and a shell command.
		prompt: 'prompt',
		terminal: 'terminal'
	}
};

export default en;
export type Messages = typeof en;
