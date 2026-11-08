/// Error codes carried by `Envelope::err`. These strings are stable public API.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub enum Code {
    InvalidInput,
    NotFound,
    ResultTooLarge,
    Refused,
    RateLimited,
    RequiresUser,
    Unavailable,
}

impl Code {
    pub const ALL: [Self; 7] = [
        Self::InvalidInput,
        Self::NotFound,
        Self::ResultTooLarge,
        Self::Refused,
        Self::RateLimited,
        Self::RequiresUser,
        Self::Unavailable,
    ];

    pub const fn as_str(self) -> &'static str {
        match self {
            Self::InvalidInput => "INVALID_INPUT",
            Self::NotFound => "NOT_FOUND",
            Self::ResultTooLarge => "RESULT_TOO_LARGE",
            Self::Refused => "REFUSED",
            Self::RateLimited => "RATE_LIMITED",
            Self::RequiresUser => "REQUIRES_USER",
            Self::Unavailable => "UNAVAILABLE",
        }
    }

    /// Whether the same call may succeed if retried unchanged.
    pub const fn retryable(self) -> bool {
        matches!(self, Self::RateLimited | Self::Unavailable)
    }

    /// What the code means and what the agent should do next.
    pub const fn explain(self) -> &'static str {
        match self {
            Self::InvalidInput => {
                "The input does not match the tool's inputSchema. Fix the arguments named in the message and call again."
            }
            Self::NotFound => {
                "Nothing matched. Broaden the query or check the identifier; do not retry unchanged."
            }
            Self::ResultTooLarge => {
                "The result exceeds the output budget. Narrow the request or page with `cursor`."
            }
            Self::Refused => {
                "The site deliberately declined this call (policy, permissions or state). Do not retry; tell the user why."
            }
            Self::RateLimited => "Too many calls. Wait and retry later.",
            Self::RequiresUser => {
                "A human must act on the page first (sign in, confirm, solve a challenge). Ask the user, then retry."
            }
            Self::Unavailable => {
                "The tool could not run in this environment (e.g. WebAssembly blocked by the page's CSP). See `hint`."
            }
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        Self::ALL
            .into_iter()
            .find(|c| c.as_str().eq_ignore_ascii_case(s))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trips() {
        for code in Code::ALL {
            assert_eq!(Code::parse(code.as_str()), Some(code));
        }
        assert_eq!(Code::parse("refused"), Some(Code::Refused));
        assert_eq!(Code::parse("nope"), None);
    }
}
