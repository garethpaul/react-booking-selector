# Custom Render Keyboard Coverage

## Status

Completed

## Context

`renderDateCell` now has direct selected/blocked state coverage, and the README
documents that the outer grid cell preserves selection and keyboard handlers.
The remaining regression risk is that custom-rendered content could obscure
whether keyboard toggles still operate through the owning cell wrapper.

## Objectives

- Add focused Jest coverage for keyboard toggling on a custom-rendered slot.
- Assert the custom content is still nested inside the accessible grid button.
- Preserve runtime behavior and avoid snapshot churn.
- Run the existing package verification gate before committing.

## Verification

- `corepack yarn test --runInBand test/lib/BookingSelector.test.js`
- `corepack yarn verify`
- `git diff --check`
