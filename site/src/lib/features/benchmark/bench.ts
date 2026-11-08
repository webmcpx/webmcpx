// Types and view helpers for the benchmark results file written by `crates/webmcpx-bench`
// (`report.rs`, schema_version 3 or 4; 4 adds the tools each run was given). The summary is computed in Rust; this module only formats it.

export type Arm = 'baseline' | 'webmcp';

export interface ArmSummary {
	runs: number;
	success_rate: number;
	tokens: number;
	input_tokens: number;
	output_tokens: number;
	steps: number;
	tool_calls: number;
	duration_ms: number;
	cost_usd: number | null;
}

/** Where a task ran and what it asked, as recorded with the run. */
export interface TaskInfo {
	prompt: string;
	/** Local fixture directory under bench/sites. */
	site?: string;
	/** Live page on the public web. */
	url?: string;
}

/** One attempt, as far as the page reads it. */
export interface RunInfo {
	task: string;
	arm: Arm;
	success: boolean;
	/** Schema 4: the tools (name, description) the agent was given. */
	tools?: { name: string; description: string }[];
	tool_calls: { name: string; arguments: string }[];
}

export interface Results {
	schema_version: 3 | 4 | 5;
	model: string;
	reasoning_effort: string | null;
	price_per_mtok: { input: number; cached_input: number; output: number } | null;
	started_at: number;
	tasks: Record<string, TaskInfo>;
	runs: RunInfo[];
	summary: {
		arms: Partial<Record<Arm, ArmSummary>>;
		tasks: Record<string, Partial<Record<Arm, ArmSummary>>>;
	};
}

export interface Headline {
	baseline: ArmSummary;
	webmcp: ArmSummary;
}

/** Both arms' totals, or null until both arms ran. */
export function headline(r: Results): Headline | null {
	const { baseline, webmcp } = r.summary.arms;
	return baseline && webmcp ? { baseline, webmcp } : null;
}

export const percent = (x: number) => `${Math.round(x * 100)}%`;
export const tokens = (x: number) =>
	x >= 10_000 ? `${(x / 1000).toFixed(0)}k` : x >= 1000 ? `${(x / 1000).toFixed(1)}k` : `${Math.round(x)}`;
export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
export const ratio = (x: number) => `${x >= 10 ? x.toFixed(0) : x.toFixed(1)}×`;
/** A tile for webmcp vs baseline that names the direction: "2.5× fewer tokens" or "1.4× slower". */
export function compare(baseline: number, webmcp: number, better: string, worse: string) {
	return webmcp <= baseline
		? { value: ratio(baseline / Math.max(webmcp, Number.MIN_VALUE)), label: better }
		: { value: ratio(webmcp / Math.max(baseline, Number.MIN_VALUE)), label: worse };
}

/** Cost per 1,000 tasks, easier to read than fractions of a cent. */
export const perThousand = (usd: number | null) => (usd == null ? 'n/a' : `$${(usd * 1000).toFixed(2)}`);

/** One model's published run as the landing gets it: runs stripped, sites selected (see sites.ts). */
export interface ModelRun {
	results: Results;
	sites: import('./sites.ts').BenchSite[];
	/** Per question: the site's WebMCP tools and the calls the agent made. */
	tools: Record<string, import('./tools.ts').QuestionTools>;
	/** Questions in the whole run, of which `sites` shows a selection. */
	totalQuestions: number;
	/** Place on the leaderboard (1 = best), the same on every page that shows this run. */
	rank: number;
}

/** Accepts the JSON written by the harness; fails the build on an unknown schema. */
export function parse(data: unknown): Results {
	const version = (data as { schema_version?: unknown } | null)?.schema_version;
	if (version !== 3 && version !== 4 && version !== 5)
		throw new Error(`bench.json: unsupported schema_version ${String(version)}`);
	return data as Results;
}

/**
 * The leaderboard order, as agent leaderboards rank (HAL, Aider): task success with WebMCP first, then
 * the lower cost per run (a run without a recorded cost ranks after those with one), then the id.
 */
export function leaderboard<T extends { results: Results }>(runs: T[]): T[] {
	// A run without a WebMCP arm ranks last.
	const key = (r: T) => r.results.summary.arms.webmcp ?? { success_rate: -1, cost_usd: null };
	return [...runs].sort(
		(a, b) =>
			key(b).success_rate - key(a).success_rate ||
			(key(a).cost_usd ?? Infinity) - (key(b).cost_usd ?? Infinity) ||
			a.results.model.localeCompare(b.results.model)
	);
}

/** A per-task metric the chart can show. Every one is "lower is better". Its name and unit are in the
 * dictionary (`proof.metrics.<id>`). */
export interface Metric {
	id: 'tokens' | 'duration_ms' | 'steps' | 'cost_usd';
	format: (x: number) => string;
}

export const METRICS: Metric[] = [
	{ id: 'tokens', format: tokens },
	{ id: 'duration_ms', format: seconds },
	{ id: 'steps', format: (x) => x.toFixed(1) },
	{ id: 'cost_usd', format: (x) => perThousand(x) }
];

export interface Row {
	task: string;
	live: boolean;
	baseline: ArmSummary | undefined;
	webmcp: ArmSummary | undefined;
}

/** One row per task, in the order the harness wrote them. */
export function rows(r: Results): Row[] {
	return Object.entries(r.summary.tasks).map(([task, arms]) => ({
		task,
		live: task.startsWith('live-'),
		baseline: arms.baseline,
		webmcp: arms.webmcp
	}));
}

export const metricValue = (s: ArmSummary | undefined, m: Metric['id']) => s?.[m] ?? null;

/** Tasks where webmcpx did worse than the baseline on `metric`: shown, never hidden. */
export function losses(r: Results, metric: Metric['id']): string[] {
	return rows(r)
		.filter((row) => {
			const b = metricValue(row.baseline, metric);
			const w = metricValue(row.webmcp, metric);
			return b != null && w != null && w > b;
		})
		.map((row) => row.task);
}

/** The whole-run token saving (baseline tokens / WebMCP tokens) across models: lowest, highest, count. */
export interface TokenSaving {
	low: number;
	high: number;
	models: number;
	/** The losses, never hidden: per model, the questions where WebMCP used more tokens (fewest, most). */
	worse: [number, number];
	/** Questions per model (the most any model ran). */
	questions: number;
}

/**
 * Each published model's token saving over its whole run (every question, never the showcase), as the
 * lowest and highest across models, with the questions where it lost. Null when no run has both arms,
 * or when no model saved tokens.
 */
export function tokenSaving(runs: { results: Results }[]): TokenSaving | null {
	const models = runs.flatMap(({ results }) => {
		const h = headline(results);
		if (!h) return [];
		const both = rows(results).filter((r) => r.baseline && r.webmcp);
		const worse = both.filter((r) => r.webmcp!.tokens > r.baseline!.tokens).length;
		return [{ saving: h.baseline.tokens / Math.max(1, h.webmcp.tokens), worse, questions: both.length }];
	});
	if (!models.length) return null;
	const saving = models.map((m) => m.saving);
	const worse = models.map((m) => m.worse);
	const high = Math.max(...saving);
	return high > 1
		? {
				low: Math.min(...saving),
				high,
				models: models.length,
				worse: [Math.min(...worse), Math.max(...worse)],
				questions: Math.max(...models.map((m) => m.questions))
			}
		: null;
}

/** A count or a range of counts: "6", or "5–7". */
export const span = ([low, high]: [number, number]) => (low === high ? `${low}` : `${low}–${high}`);

/** Say it as a range ("2.4× to 5.7×") only when every model saved and the ends read differently;
 * otherwise as "up to" the best one. */
export const savingIsRange = (s: TokenSaving) => s.models > 1 && s.low >= 1 && ratio(s.low) !== ratio(s.high);
