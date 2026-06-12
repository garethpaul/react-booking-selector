# Package File Mode Check

## Status: Completed

## Context

`npm pack --dry-run --json` reports the Unix mode for every packed file, but
the package contents checker previously discarded that metadata. The published
surface contains libraries, declarations, JSON, documentation, and an SVG;
none should carry executable bits into downstream installations.

## Objectives

- Preserve mode metadata from the npm package dry run.
- Reject any packed file with user, group, or other executable bits.
- Keep the existing exact allowlist, duplicate, and forbidden-path checks.
- Cover executable and non-executable modes with focused Jest tests.

## Work Completed

- Extended `parsePackOutput` to collect executable packed file paths.
- Added `assertNoExecutablePackageFiles` to the real `pack:check` command.
- Added focused parser and assertion tests for `0644` and `0755` modes.
- Updated README, VISION, and CHANGES with the package mode invariant.

## Verification

- `corepack yarn test --runTestsByPath test/scripts/check-package-contents.test.js --runInBand`
- `corepack yarn pack:check`
- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
- Fed the npm pack parser a packed entry with mode `0755` and confirmed the
  executable-mode assertion rejected it.
- `git diff --check`
