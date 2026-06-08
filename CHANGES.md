# Changes

## 2026-06-08

- Added direct regression coverage for the `renderDateCell` selected and blocked state arguments.
- Confirmed the existing `corepack yarn verify` gate covers lint, type declarations, Jest tests, build output, and dependency audit.
- Added package dry-run verification to `corepack yarn verify` with automatic tarball cleanup.
- Documented custom cell rendering with the `selected` and `blocked` state arguments.
- Updated README usage examples to use React hooks.
- Added a package root `exports` map, package metadata subpath, and runtime coverage for both exports.
- Rendered selectable slots as native buttons while preserving the existing grid styling.
- Aligned TypeScript date value declarations with the runtime handling of nullish selection and blocked entries.
- Kept coverage reports focused on source files by excluding generated `dist` artifacts.
- Reset native button appearance and opacity so slot colors remain consistent across browsers.
- Added keyboard regression coverage showing custom-rendered slots still toggle through the accessible grid cell wrapper.
- Improved mobile day, date, and time label legibility without changing grid dimensions.
