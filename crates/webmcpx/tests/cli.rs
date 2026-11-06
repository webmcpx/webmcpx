//! End-to-end CLI behavior. Output formats are public API: changes show up here.

use std::process::Command;

use insta_cmd::{assert_cmd_snapshot, get_cargo_bin};

fn webmcpx() -> Command {
    let mut cmd = Command::new(get_cargo_bin("webmcpx"));
    cmd.current_dir(env!("CARGO_MANIFEST_DIR"))
        .env_remove("GITHUB_ACTIONS")
        .env("NO_COLOR", "1");
    cmd
}

#[test]
fn lint_concise() {
    assert_cmd_snapshot!(webmcpx().args(["lint", "--format", "concise", "tests/fixtures"]));
}

#[test]
fn lint_json() {
    assert_cmd_snapshot!(webmcpx().args(["lint", "--format", "json", "tests/fixtures/shop.js"]));
}

#[test]
fn lint_fix_rewrites_safe_problems() {
    let dir = std::env::temp_dir().join(format!("webmcpx-fix-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let file = dir.join("shop.js");
    std::fs::copy("tests/fixtures/shop.js", &file).unwrap();
    let out = webmcpx()
        .args(["lint", "--format", "concise", "--fix"])
        .arg(&file)
        .output()
        .unwrap();
    let fixed = std::fs::read_to_string(&file).unwrap();
    std::fs::remove_dir_all(&dir).ok();
    assert!(fixed.contains("\"Find products in the catalog.\""));
    let stdout = String::from_utf8(out.stdout).unwrap();
    assert!(!stdout.contains("invisible-unicode"), "{stdout}");
    assert_eq!(
        out.status.code(),
        Some(1),
        "invalid-name is not auto-fixable"
    );
}

#[test]
fn clean_file_exits_zero() {
    assert_cmd_snapshot!(webmcpx().args(["lint", "tests/fixtures/clean.ts"]));
}

#[test]
fn usage_errors_exit_two() {
    assert_cmd_snapshot!(webmcpx().args(["lint", "--format", "json", "missing.js"]));
    assert_cmd_snapshot!(webmcpx().args(["rule", "nope"]));
}

#[test]
fn rules_and_explain() {
    assert_cmd_snapshot!(webmcpx().args(["rules"]));
    assert_cmd_snapshot!(webmcpx().args(["rule", "invisible-unicode"]));
    assert_cmd_snapshot!(webmcpx().args(["explain", "RESULT_TOO_LARGE", "--format", "json"]));
}
