# Minute-Unique Selection

## Status: Completed

## Context

The booking grid compares selected and blocked values at minute precision so a
slot remains selected even when a caller passes a date with seconds or
milliseconds. Duplicate same-minute values could still survive in controlled
selection drafts or emitted `onChange` payloads, which made callback data less
predictable than the visible grid state.

## Objectives

- Keep the public controlled `selection` and `onChange` API shape unchanged.
- Normalize internal selection drafts to unique minute keys.
- Emit `onChange` payloads that are minute-unique and cloned from internal
  state.
- Preserve first-seen slot order for distinct selected minutes.

## Work Completed

- Added a shared selection-draft normalizer that clones, filters, and
  de-duplicates selected dates at minute precision.
- Used the normalizer for initial props, controlled prop updates, and
  `onChange` payloads.
- Added Jest coverage for duplicate selection props and duplicate emitted
  selection drafts.
- Updated README, VISION, and CHANGES notes for minute-unique selection
  behavior.

## Verification

- `corepack yarn test --runInBand test/lib/BookingSelector.test.js`
- `corepack yarn verify`
- `make check`
- `git diff --check`
