//! Size budgets, in Unicode scalar values (chars).
//!
//! `*_WARN` values follow Chrome's authoring guidance
//! (<https://developer.chrome.com/docs/ai/webmcp/secure-tools>); `*_MAX` values follow the
//! floors proposed in webmachinelearning/webmcp#359, above which a host may truncate or
//! reject. Tool counts are heuristics from #293 (silent disablement at 126–296 tools).

/// Hard limit for a tool name (spec: 1–128 chars).
pub const NAME_MAX: usize = 128;
/// Names longer than this are hard for models to pick reliably.
pub const NAME_WARN: usize = 30;

pub const DESCRIPTION_WARN: usize = 500;
pub const DESCRIPTION_MAX: usize = 750;

pub const PARAM_DESCRIPTION_WARN: usize = 150;
pub const PARAM_DESCRIPTION_MAX: usize = 500;

/// Tools registered by one document.
pub const TOOLS_WARN: usize = 20;
pub const TOOLS_MAX: usize = 100;

/// Default output budget of content tools (Chrome recommends ~1.5K per output).
pub const OUTPUT_DEFAULT: usize = 2_000;
/// Largest output a caller may request.
pub const OUTPUT_MAX: usize = 20_000;
