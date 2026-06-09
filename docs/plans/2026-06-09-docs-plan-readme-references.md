# Docs Plan README References

## Status: Completed

## Context

`docs:check` verified that every canonical plan under `docs/plans/` was
completed and recorded the verification commands, but README only linked a
subset of those plans. That made it easy for completed maintenance records to
exist without a discoverable top-level pointer.

## Goals

- Require README to reference every canonical plan under `docs/plans/`.
- Add black-box checker coverage for missing README plan references.
- Add the missing README references for custom renderer and checker plans.

## Work Completed

- Extended `scripts/check-docs-plan.js` to validate README plan links.
- Added checker tests for success, existing validation failures, and missing
  README references.
- Updated README, VISION, and CHANGES with the new plan-link guard.

## Verification

- corepack yarn docs:check
- corepack yarn jest test/scripts/check-docs-plan.test.js
- corepack yarn verify
- make check
