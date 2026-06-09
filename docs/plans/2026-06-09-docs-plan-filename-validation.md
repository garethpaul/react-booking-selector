# Docs Plan Filename Validation

## Status: Completed

## Context

The docs-plan checker verifies completed status, verification commands, README
references, and the canonical baseline plan. The repository already uses dated
`docs/plans/YYYY-MM-DD-*` filenames, but the checker did not enforce that
convention.

## Objectives

- Keep docs-plan filenames sortable by date.
- Reject canonical plan files that do not use a `YYYY-MM-DD-*` filename.
- Cover the failure mode in the docs-plan checker tests.
- Keep the README, VISION, and CHANGES notes aligned with the checker.

## Work Completed

- Added dated filename validation to `scripts/check-docs-plan.js`.
- Added a regression test for undated plan filenames.
- Added this completed plan and README/VISION/CHANGES references.

## Verification

- `corepack yarn docs:check`
- `corepack yarn jest test/scripts/check-docs-plan.test.js --runInBand`
- `corepack yarn verify`
- `make check`
- `git diff --check`
