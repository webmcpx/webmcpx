// The WebMCP tools behind each question: what the agent could call (name and description, the text it
// reads to pick a tool) and what it did call. Tools and calls always come from the same attempt (the
// first successful one with WebMCP, else the first). Runs from schema 4 record the tools the agent was
// given; older runs fall back to a dated snapshot (`just bench-tools`), labelled as such on the page.

import type { Results, RunInfo } from './bench.ts';

export interface ToolInfo {
	name: string;
	description: string;
}

export interface Snapshot {
	captured_on: string;
	tasks: Record<string, ToolInfo[]>;
}

export interface QuestionTools {
	/** `run`: exactly what the agent was given; `snapshot`: registered on `date`, after the run. */
	source: 'run' | 'snapshot';
	/** When these descriptions were read: the run's date, or the snapshot's. */
	date: string;
	/** When the benchmark ran (differs from `date` for snapshots). */
	runDate: string;
	/** Called tools first (in call order), then the rest by name. */
	tools: (ToolInfo & { called: boolean })[];
	/** The calls of that same attempt, in order. */
	calls: { name: string; arguments: string }[];
}

const runDate = (r: Results) => new Date(r.started_at * 1000).toISOString().slice(0, 10);

/** Called tools first, in call order; a called tool missing from the list (snapshot drift) is kept. */
function order(listed: ToolInfo[], calledNames: string[]): (ToolInfo & { called: boolean })[] {
	const called = [...new Set(calledNames)];
	return [
		...called.map((name) => listed.find((t) => t.name === name) ?? { name, description: '' }),
		...listed.filter((t) => !called.includes(t.name)).sort((a, b) => a.name.localeCompare(b.name))
	].map((t) => ({ ...t, called: called.includes(t.name) }));
}

export function toolsFor(results: Results, snapshot: Snapshot): Record<string, QuestionTools> {
	const out: Record<string, QuestionTools> = {};
	for (const task of Object.keys(results.summary.tasks)) {
		const runs = results.runs.filter((r): r is RunInfo => r.task === task && r.arm === 'webmcp');
		const example = runs.find((r) => r.success) ?? runs[0];
		const recorded = example?.tools?.length ? example.tools : undefined;
		const calls = (example?.tool_calls ?? []).map(({ name, arguments: args }) => ({ name, arguments: args }));
		out[task] = {
			source: recorded ? 'run' : 'snapshot',
			date: recorded ? runDate(results) : snapshot.captured_on,
			runDate: runDate(results),
			tools: order(
				recorded ?? snapshot.tasks[task] ?? [],
				calls.map((c) => c.name)
			),
			calls
		};
	}
	return out;
}

/** One site's tools over all its questions: the list of the first, called if any question called it. */
export function siteTools(questions: QuestionTools[]): QuestionTools | null {
	const first = questions.find((q) => q.tools.length);
	if (!first) return null;
	const calls = questions.flatMap((q) => q.calls);
	const listed = questions
		.flatMap((q) => q.tools)
		.filter((t, i, all) => all.findIndex((u) => u.name === t.name) === i);
	return {
		...first,
		tools: order(
			listed,
			calls.map((c) => c.name)
		),
		calls
	};
}
