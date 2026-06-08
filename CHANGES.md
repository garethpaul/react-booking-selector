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
- Added a generated ESM build and package `import` condition while preserving the CommonJS entry point.
- Enforced source coverage thresholds in the standard verification gate with automatic coverage cleanup.
- Added direct coverage for styled-components CommonJS and ESM interop paths.
- Made standalone test and coverage scripts rebuild package entry artifacts before running package-root tests.
- Updated TypeScript verification to exercise package-name imports through the published export map.
- Moved slot cursor affordance to the outer interactive button so custom-rendered cells look clickable.
- Added branch coverage for date-cell cleanup paths and blocked wrapper pointer guards, raising the branch gate to 100%.
- Removed redundant button role, disabled ARIA, and tab-index attributes from native slot buttons.
- Normalized first-party source and tests with Prettier, then added format checking to the standard verification gate.
- Added ESM-specific TypeScript declarations and NodeNext type coverage for the package import condition.
- Added explicit package metadata for CommonJS type, repository URL format, and side-effect-free bundling.
