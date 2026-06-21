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
- GNU Make can execute parse-time expressions in caller-supplied preloaded or
  additional Makefiles before this repository's guard runs; trusted automation
  must not supply them. Runtime tool identities also remain the responsibility
  of the trusted caller's `PATH`.

## Work Completed

- Reject command-line and environment replacement of `MAKEFILE_LIST`.
- Canonicalize the checked-in Makefile directory through quoted POSIX tools.
- Freeze shell authority, export the canonical root as data, and reject
  `MAKEFILES` preloads, earlier and later additional Makefiles, and the `-n`,
  `-t`, `-q`, and `-i` Make modes that skip or ignore verification recipes,
  including command-line replacement of the `MAKEFLAGS` evidence.
- Use absolute root-resolution tools so caller `PATH` entries cannot replace
  `sed`, `dirname`, or `pwd` while the checkout location is established.
- Add coverage for all five pre-existing public Make targets plus the root regression gate.
- Include the root policy in `make verify` and `make check`.

## Verification Completed

- Node 20.19.5 and Node 24.16.0 passed `corepack yarn verify`, `make check`,
  400 tests, coverage,
  package contents, runtime smoke, publint, package type checks, and high-severity audits.
- All 42 executed target, root, shell, and shell-flag authority cases passed
  from a path containing spaces, quotes, brackets, an apostrophe, a semicolon,
  and backticks without invoking caller-shadowed root tools.
- Both `MAKEFILE_LIST` override channels, a `MAKEFILES` preload, earlier and
  later additional Makefiles, four non-executing or error-ignoring
  `MAKEFLAGS` modes, and command-line `MAKEFLAGS` replacement failed closed.
- A literal `$()` checkout path failed closed without executing its contents;
  GNU Make removes that segment from `MAKEFILE_LIST`, so safe reconstruction is
  unavailable.
- The checked-in distribution, package metadata, lockfile, and source behavior were unchanged.
