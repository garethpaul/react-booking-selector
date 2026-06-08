# Docs Plan Inventory Check

## Status: Completed

## Context

`react-booking-selector` already ran `scripts/check-docs-plan.js` from
`corepack yarn verify`, but the script only checked the original baseline plan
path. Future canonical plans under `docs/plans/` could be added without the
verification gate confirming their completed status or recorded commands.

## Objectives

- Keep `docs:check` dependency-free.
- Require every `docs/plans/*.md` file to record `Status: Completed`,
  `corepack yarn verify`, and `make check`.
- Preserve the explicit baseline plan requirement.
- Keep the standard `make check` wrapper as the package-quality gate.

## Work Completed

- Updated `scripts/check-docs-plan.js` to scan all markdown plans under
  `docs/plans/`.
- Added this completed plan under `docs/plans/`.
- Updated README, VISION, and CHANGES notes for docs-plan inventory coverage.

## Verification

- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
- `git diff --check`
