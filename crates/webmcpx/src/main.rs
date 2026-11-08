//! `webmcpx`: lint WebMCP tools and explain rules and error codes.
//!
//! Exit codes: 0 no errors, 1 lint errors found, 2 usage or I/O error.
//! Results go to stdout; with `--format json` they follow a versioned schema.

mod files;
mod output;

use std::io::{BufWriter, Write};
use std::path::PathBuf;
use std::process::ExitCode;

use clap::{Parser, Subcommand, ValueEnum};
use webmcpx_core::Code;
use webmcpx_lint::{Options, rules};

#[derive(Parser)]
#[command(name = "webmcpx", version, about = "Lint and inspect WebMCP tools.")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Lint WebMCP tools in JS/TS sources and JSON manifests.
    Lint {
        /// Files or directories (default: current directory). Directories include
        /// JS/TS files and `*webmcp*.json` manifests; `node_modules` and dot-dirs are skipped.
        paths: Vec<PathBuf>,
        /// Output format (default: `github` under GitHub Actions, else `human`).
        #[arg(long, value_enum)]
        format: Option<Format>,
        /// Apply safe fixes in place.
        #[arg(long)]
        fix: bool,
        /// Also run preview rules (may change in any release).
        #[arg(long)]
        preview: bool,
        /// Skip a rule (repeatable).
        #[arg(long, value_name = "RULE")]
        ignore: Vec<String>,
    },
    /// List every rule.
    Rules {
        #[arg(long, value_enum, default_value = "human")]
        format: Format,
    },
    /// Show what a rule checks and why.
    Rule {
        name: String,
        #[arg(long, value_enum, default_value = "human")]
        format: Format,
    },
    /// Explain an error code returned by a webmcpx tool (e.g. `RESULT_TOO_LARGE`).
    Explain {
        code: String,
        #[arg(long, value_enum, default_value = "human")]
        format: Format,
    },
}

#[derive(Clone, Copy, PartialEq, Eq, ValueEnum)]
pub(crate) enum Format {
    Human,
    /// One line per diagnostic.
    Concise,
    /// Versioned, machine-readable (`schema_version`).
    Json,
    /// SARIF 2.1.0 for code scanning.
    Sarif,
    /// GitHub Actions annotations.
    Github,
}

/// A failure that is not a lint finding: printed as an error envelope, exit code 2.
pub(crate) struct Failure {
    code: Code,
    message: String,
    hint: &'static str,
}

fn main() -> ExitCode {
    // Under WASI (`npx webmcpx lint`, see packages/webmcpx/bin/rust.js) the host maps its file system at
    // `/` and passes its working directory as PWD: start there, so paths mean what they mean natively.
    #[cfg(target_os = "wasi")]
    if let Some(dir) = std::env::var_os("PWD") {
        std::env::set_current_dir(dir).ok();
    }
    let cli = Cli::parse();
    let mut out = BufWriter::new(std::io::stdout().lock());
    let result = run(cli.command, &mut out);
    let code = match result {
        Ok(code) => code,
        Err((format, failure)) => {
            output::failure(&mut out, format, &failure).ok();
            ExitCode::from(2)
        }
    };
    out.flush().ok();
    code
}

fn run(command: Command, out: &mut impl Write) -> Result<ExitCode, (Format, Failure)> {
    match command {
        Command::Lint {
            paths,
            format,
            fix,
            preview,
            ignore,
        } => {
            let format = format.unwrap_or_else(|| {
                if std::env::var_os("GITHUB_ACTIONS").is_some() {
                    Format::Github
                } else {
                    Format::Human
                }
            });
            if let Some(name) = ignore.iter().find(|n| rules::find(n).is_none()) {
                return Err((format, unknown_rule(name)));
            }
            let options = Options { preview, ignore };
            let results = files::lint_paths(&paths, &options, fix).map_err(|f| (format, f))?;
            let errors = output::lint(out, format, &results).map_err(|e| (format, io(&e)))?;
            Ok(if errors == 0 {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            })
        }
        Command::Rules { format } => {
            output::rules(out, format).map_err(|e| (format, io(&e)))?;
            Ok(ExitCode::SUCCESS)
        }
        Command::Rule { name, format } => {
            let rule = rules::find(&name).ok_or_else(|| (format, unknown_rule(&name)))?;
            output::rule(out, format, rule).map_err(|e| (format, io(&e)))?;
            Ok(ExitCode::SUCCESS)
        }
        Command::Explain { code, format } => {
            let parsed = Code::parse(&code).ok_or_else(|| {
                (
                    format,
                    Failure {
                        code: Code::InvalidInput,
                        message: format!("unknown error code `{code}`"),
                        hint: CODES_HINT.get_or_init(|| {
                            let names: Vec<_> = Code::ALL.iter().map(|c| c.as_str()).collect();
                            format!("Codes: {}.", names.join(", "))
                        }),
                    },
                )
            })?;
            output::explain(out, format, parsed).map_err(|e| (format, io(&e)))?;
            Ok(ExitCode::SUCCESS)
        }
    }
}

/// The hint listing every error code, built from `Code::ALL` so a new code shows up without an edit here.
static CODES_HINT: std::sync::OnceLock<String> = std::sync::OnceLock::new();

fn unknown_rule(name: &str) -> Failure {
    Failure {
        code: Code::InvalidInput,
        message: format!("unknown rule `{name}`"),
        hint: "Run `webmcpx rules` to list rule names.",
    }
}

fn io(e: &std::io::Error) -> Failure {
    Failure {
        code: Code::Unavailable,
        message: e.to_string(),
        hint: "Check that stdout is writable.",
    }
}
