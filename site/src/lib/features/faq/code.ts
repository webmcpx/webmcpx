// The FAQ's answers are plain text (they are also published as structured data). Code in them (commands,
// API calls) is kept as written in every language, so it is found by pattern and shown as code.
const CODE =
	/((?:claude|codex) mcp add webmcpx -- npx -y webmcpx mcp|document\.modelContext\.registerTool\(\)|\btool\(\))/;

export interface Part {
	text: string;
	code: boolean;
}

/** The answer split into text and code parts, in order (odd parts of the split are the matches). */
export const codeParts = (text: string): Part[] =>
	text
		.split(CODE)
		.map((t, i) => ({ text: t, code: i % 2 === 1 }))
		.filter((p) => p.text);
