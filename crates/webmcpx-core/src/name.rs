use crate::limits::NAME_MAX;

/// Why a tool name is rejected by `registerTool()`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, thiserror::Error)]
#[non_exhaustive]
pub enum NameError {
    #[error("tool name is empty")]
    Empty,
    #[error("tool name is longer than {NAME_MAX} characters")]
    TooLong,
    #[error("tool name contains {0:?}; only A-Z, a-z, 0-9, '_', '.' and '-' are allowed")]
    InvalidChar(char),
}

/// Validates a tool name exactly as the spec does (`[A-Za-z0-9_.-]{1,128}`).
///
/// ```
/// use webmcpx_core::{validate_name, NameError};
/// assert!(validate_name("search_site").is_ok());
/// assert_eq!(validate_name("search site"), Err(NameError::InvalidChar(' ')));
/// ```
pub fn validate_name(name: &str) -> Result<(), NameError> {
    if name.is_empty() {
        return Err(NameError::Empty);
    }
    if let Some(c) = name
        .chars()
        .find(|c| !(c.is_ascii_alphanumeric() || matches!(c, '_' | '.' | '-')))
    {
        return Err(NameError::InvalidChar(c));
    }
    // All chars are ASCII at this point, so bytes == chars.
    if name.len() > NAME_MAX {
        return Err(NameError::TooLong);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_spec_charset() {
        assert_eq!(validate_name("a.B-c_9"), Ok(()));
        assert_eq!(validate_name(&"a".repeat(NAME_MAX)), Ok(()));
    }

    #[test]
    fn rejects_invalid() {
        assert_eq!(validate_name(""), Err(NameError::Empty));
        assert_eq!(
            validate_name(&"a".repeat(NAME_MAX + 1)),
            Err(NameError::TooLong)
        );
        assert_eq!(validate_name("café"), Err(NameError::InvalidChar('é')));
        assert_eq!(validate_name("a/b"), Err(NameError::InvalidChar('/')));
    }
}
