# Safe Makefile Root Resolution

## Status: Completed

## Context

Caller-controlled root and shell authority, preloaded or ambiguous Makefiles,
and shell-sensitive checkout names could redirect or execute outside the
reviewed checkout.

## Scope Boundaries

- Do not change component behavior, public package exports, generated output,
  dependencies, or the Node 16 runtime floor.
- Preserve Yarn 4.17.0 immutable installation and Node 20/24 verification.
- Do not publish packages or deploy documentation.

## Work Completed

- Reject command-line and environment replacement of `MAKEFILE_LIST`.
- Canonicalize the checked-in Makefile directory through quoted POSIX tools.
- Freeze shell authority, export the canonical root as data, and reject
  `MAKEFILES` preloads and ambiguous multiple-`-f` invocations.
- Add coverage for all five pre-existing public Make targets plus the root regression gate.
- Include the root policy in `make verify` and `make check`.

## Verification Completed

- Node 20.19.5 and Node 24.16.0 passed `corepack yarn verify`, `make check`,
  400 tests, coverage,
  package contents, runtime smoke, publint, package type checks, and high-severity audits.
- All 42 executed target, root, shell, and shell-flag authority cases passed
  from a path containing spaces, quotes, brackets, an apostrophe, and backticks.
- Both `MAKEFILE_LIST` override channels, a `MAKEFILES` preload, and an
  ambiguous multiple-Makefile invocation failed closed.
- The checked-in distribution, package metadata, lockfile, and source behavior were unchanged.
