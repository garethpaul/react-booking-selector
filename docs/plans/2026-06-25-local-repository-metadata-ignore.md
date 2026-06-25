# Local Repository Metadata Ignore

## Status: Completed

## Context

The checkout persists maintainer working notes under `.explore/`, but the
directory was not ignored. Every synchronized repository therefore appeared
dirty, and local intelligence could be staged or published accidentally.

The existing package-root test covered `.vscode/` only through raw ignore text
and filtered tracked paths by filesystem existence. That did not prove Git's
effective ordered-rule behavior and could miss deleted files still present in
the index.

## Objectives

- Add the exact active `.explore/` ignore rule.
- Verify Git effectively ignores local metadata directories and a representative
  intelligence file.
- Reject every tracked `.vscode` or `.explore` path without filtering by current
  filesystem existence.
- Keep local metadata outside formatting, package, and durable review evidence.

## Work Completed

- Added `.explore/` to `.gitignore`.
- Strengthened the package-root contract to parse active patterns, call pinned
  `/usr/bin/git check-ignore`, and query tracked metadata with `git ls-files`.
- Preserved the existing `.vscode/` formatting-input exclusions.
- Updated repository guidance and this canonical maintenance record.

## Verification

- The focused package-root suite failed first because `.explore/` was absent.
- `corepack yarn verify`
- `make check`
- `git diff --check`

## Risks

- Ignored local notes are not shared through Git. Durable technical decisions
  must be copied into tracked plans, changes, policies, tests, or source.
- The contract relies on `/usr/bin/git`, matching the hosted Ubuntu and common
  macOS system-tool locations used by this repository's verification policy.
- This change does not alter the component API, booking behavior, package
  contents, generated distribution, or publication workflow.

## Verification Result

- The red-first package-root suite rejected the absent `.explore/` rule.
- The focused docs-plan/package-root suites passed 29 tests, formatting, and
  lint checks.
- `corepack yarn verify` and `make check` passed 42 Make authority cases, 400
  Jest tests with full covered-source thresholds, hostile review mutations,
  audit, package contents/runtime checks, publint, and type-package analysis.
- `make build` left checked-in `dist` unchanged, and `git diff --check` passed.
- Exact-head Codex review was clean. Push and pull-request Node 16/20/24 jobs,
  clean distribution checks, and CodeQL Actions/JavaScript analysis passed.
