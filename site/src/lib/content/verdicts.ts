// The lint rules whose findings are errors, so a site that trips one is "Almost", never "Agent-ready"
// (crates/webmcpx-lint/src/rules/*.rs with `severity: Severity::Error`). Some warning rules also turn
// into errors past a hard limit (long names and descriptions, too many tools).
export const ERROR_RULES = [
	'invalid-name',
	'duplicate-name',
	'missing-description',
	'invalid-input-schema',
	'invisible-unicode'
] as const;

export const RULES_URL = 'https://github.com/webmcpx/webmcpx/tree/main/crates/webmcpx-lint/src/rules';
export const VERDICT_ISSUE_URL = 'https://github.com/webmcpx/webmcpx/issues/new?template=verdict.yml';
