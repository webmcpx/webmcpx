// The WebMCP tools behind each question: what the agent could call (name and description, the text it
// reads to pick a tool) and what it did call. Runs from schema 4 record the tools the agent was given;
// older runs fall back to a dated snapshot (`just bench-tools`), labelled as such on the page.

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
	/** The calls of the first successful attempt with WebMCP (or the first attempt), in order. */
	calls: { name: string; arguments: string }[];
}

const runDate = (r: Results) => new Date(r.started_at * 1000).toISOString().slice(0, 10);

export function toolsFor(results: Results, snapshot: Snapshot): Record<string, QuestionTools> {
	const out: Record<string, QuestionTools> = {};
	for (const task of Object.keys(results.summary.tasks)) {
		const runs = results.runs.filter((r): r is RunInfo => r.task === task && r.arm === 'webmcp');
		const recorded = runs.find((r) => r.tools?.length)?.tools;
		const listed = recorded ?? snapshot.tasks[task] ?? [];
		const example = runs.find((r) => r.success) ?? runs[0];
		const calls = (example?.tool_calls ?? []).map(({ name, arguments: args }) => ({ name, arguments: args }));
		const called = [...new Set(runs.flatMap((r) => r.tool_calls.map((c) => c.name)))];
		const tools = [
			...called.flatMap((name) => listed.filter((t) => t.name === name)),
			...listed.filter((t) => !called.includes(t.name)).sort((a, b) => a.name.localeCompare(b.name))
		].map((t) => ({ ...t, called: called.includes(t.name) }));
		out[task] = {
			source: recorded ? 'run' : 'snapshot',
			date: recorded ? runDate(results) : snapshot.captured_on,
			runDate: runDate(results),
			tools,
			calls
		};
	}
	return out;
}
