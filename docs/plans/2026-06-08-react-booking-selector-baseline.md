# React Booking Selector Baseline

## Status: Completed

## Context

`react-booking-selector` is a reusable React booking-grid package with custom
slot rendering, mouse/touch/keyboard selection, TypeScript declarations, and a
published CommonJS and ESM surface. Recent maintenance strengthened package
exports, native slot-button accessibility, date value typing, generated coverage
ignores, and custom renderer regression coverage.

## Objectives

- Preserve the controlled `selection`, `blocked`, and `onChange` API.
- Keep custom cell rendering presentational while the owning slot button
  preserves pointer, touch, keyboard, focus, and accessibility behavior.
- Keep package verification broad enough for formatting, lint, declarations,
  coverage, audit, package dry-run contents, and package contract linting.
- Record the completed package baseline under `docs/plans`.

## Work Completed

- Added focused custom renderer state and keyboard coverage.
- Kept `corepack yarn verify` as the release-quality local gate.
- Added `make check` as a repository-standard wrapper around `corepack yarn verify`.
- Added `scripts/check-docs-plan.js` and included it in `corepack yarn verify`.
- Documented the canonical plan location in README, VISION, and CHANGES.

## Verification

- `corepack yarn verify`
- `make check`
- `corepack yarn test --runInBand`
- `corepack yarn docs:check`
- `git diff --check`

## Follow-Up Candidates

- Add more examples for custom renderers in README.
- Keep peer dependency ranges aligned with supported React versions.
- Add visual regression coverage before large style changes.
