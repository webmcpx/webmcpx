// Types and view helpers for the benchmark results file written by `crates/webmcpx-bench`
// (`report.rs`, schema_version 1). The summary is computed in Rust; this module only formats it.

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

export interface Results {
	schema_version: 1;
	model: string;
	reasoning_effort: string | null;
	price_per_mtok: [number, number] | null;
	started_at: number;
	runs: unknown[];
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

/** Accepts the JSON written by the harness; fails the build on an unknown schema. */
export function parse(data: unknown): Results {
	const version = (data as { schema_version?: unknown } | null)?.schema_version;
	if (version !== 1) throw new Error(`bench.json: unsupported schema_version ${String(version)}`);
	return data as Results;
}
