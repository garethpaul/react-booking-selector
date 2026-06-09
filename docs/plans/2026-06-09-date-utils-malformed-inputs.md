# Date Utils Malformed Inputs

## Status: Completed

## Context

The booking selector ignores malformed `selection` and `blocked` values before
comparing them to rendered slots, but the lower-level date range helpers still
assumed every argument was a valid `Date`. Direct malformed calls could throw,
and `dateIsBetween` could treat `null` as an epoch boundary through date-fns
coercion.

## Objectives

- Return `false` for malformed range-helper arguments instead of throwing.
- Reject invalid `Date` instances before hour, day, or exact-time comparisons.
- Keep existing inclusive range semantics for valid `Date` inputs.

## Work Completed

- Added a shared valid-Date guard to the date utility helpers.
- Added table-driven Jest coverage for `null`, invalid `Date`, and non-Date
  arguments across hour, day, and time range helpers.
- Updated README, VISION, and CHANGES notes for the new malformed-input guard.

## Verification

- `corepack yarn jest test/lib/date-utils.test.js --runInBand`
- `corepack yarn verify`
- `make check`
