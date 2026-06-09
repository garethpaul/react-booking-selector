# Docs Plan Path Normalization

## Status: Completed

## Context

`docs:check` compares the canonical plan inventory with README references under
`docs/plans/`. README links are slash-separated Markdown paths, but the checker
used native `path.join()` values for plan IDs. On platforms where native joins
produce backslashes, the checker could falsely report missing README links or
stale README references.

## Changes

- Kept canonical docs-plan IDs slash-separated for README matching and error
  output.
- Converted canonical plan IDs to native filesystem paths only when reading the
  local plan files.
- Added black-box coverage that runs the checker with Windows-style native path
  joins while keeping the temp fixture filesystem readable.
- Updated README, VISION, CHANGES, and this completed plan with the
  cross-platform guard.

## Verification

- `corepack yarn jest test/scripts/check-docs-plan.test.js --runInBand`
- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
