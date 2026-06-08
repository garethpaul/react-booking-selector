# Changes

## 2026-06-08

- Added direct regression coverage for the `renderDateCell` selected and blocked state arguments.
- Confirmed the existing `corepack yarn verify` gate covers lint, type declarations, Jest tests, build output, and dependency audit.
- Added package dry-run verification to `corepack yarn verify` with automatic tarball cleanup.
- Documented custom cell rendering with the `selected` and `blocked` state arguments.
