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
	tokensRatio: number;
	speedRatio: number;
	costRatio: number | null;
	baseline: ArmSummary;
	webmcp: ArmSummary;
}

/** Ratios baseline / webmcp, or null when either arm is missing. */
export function headline(r: Results): Headline | null {
	const { baseline, webmcp } = r.summary.arms;
	if (!baseline || !webmcp || webmcp.tokens === 0) return null;
	return {
		tokensRatio: baseline.tokens / webmcp.tokens,
		speedRatio: baseline.duration_ms / Math.max(webmcp.duration_ms, 1),
		costRatio:
			baseline.cost_usd != null && webmcp.cost_usd ? baseline.cost_usd / webmcp.cost_usd : null,
		baseline,
		webmcp
	};
}

export const percent = (x: number) => `${Math.round(x * 100)}%`;
export const tokens = (x: number) =>
	x >= 10_000 ? `${(x / 1000).toFixed(0)}k` : x >= 1000 ? `${(x / 1000).toFixed(1)}k` : `${Math.round(x)}`;
export const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
export const ratio = (x: number) => `${x >= 10 ? x.toFixed(0) : x.toFixed(1)}×`;
/** Cost per 1,000 tasks, easier to read than fractions of a cent. */
export const perThousand = (usd: number | null) => (usd == null ? 'n/a' : `$${(usd * 1000).toFixed(2)}`);

/** Accepts the JSON written by the harness; fails the build on an unknown schema. */
export function parse(data: unknown): Results {
	const version = (data as { schema_version?: unknown } | null)?.schema_version;
	if (version !== 1) throw new Error(`bench.json: unsupported schema_version ${String(version)}`);
	return data as Results;
}
