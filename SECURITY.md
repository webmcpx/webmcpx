# Security policy

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub:
**Security → Report a vulnerability** on this repository
([private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)).

Include what you found, how to reproduce it and what an attacker could do with it. We aim to acknowledge
reports within 3 working days and to agree on a fix and disclosure date with you. Credit is given in the
advisory unless you prefer otherwise.

## Scope

- The npm loader (`packages/webmcpx`) and everything it runs in a visitor's browser.
- The linter and CLI (`crates/`).
- The scanner behind webmcpx.dev (`crates/webmcpx-bench/src/scan.rs`, `proxy.rs`) and the deploy stack
  (`deploy/`). Server-side request forgery, egress-filter bypasses (reaching private, loopback or
  link-local addresses) and ways to keep the scan browser busy past its limits are all in scope.

Out of scope: reports that need a compromised browser or machine, missing hardening headers without an
exploit, and findings about third-party sites the scanner visits.

## Supported versions

webmcpx is pre-1.0: fixes land on `main` and in the next release only.
