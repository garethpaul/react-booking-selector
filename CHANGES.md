# Changes

## 2026-06-08

- Expanded `docs:check` so every canonical plan under `docs/plans/` must
  record completed status and verification commands.
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
- Added `publint` and `attw` package validation to the standard verification gate.
- Expanded the clean script to remove local caches, coverage output, and package tarballs.
- Optimized selection de-duplication to preserve order without reallocating the accumulator on every unique slot.
- Added a CommonJS build wrapper so `require('react-booking-selector')` returns the component while keeping default and named access.
- Removed render-time lookup cache mutation from the booking selector while preserving committed event-handler lookups.
- Tightened linting to fail on warnings and removed stale lint suppressions.
- Expanded Prettier coverage to include Babel config, editor settings, plan markdown, and docs HTML source.
- Lowered the published package Node engine floor to Node 16 while documenting the Node 20 development verification requirement.
- Guarded date column header formatting so invalid `dateFormat` props fall back to the default header format instead of crashing render.
- Added CommonJS-specific TypeScript declarations and NodeNext coverage for direct `require` interop.
- Included source `.cts` and `.mts` files in Prettier coverage.
- Hardened selection and blocked date normalization so unsupported values are ignored instead of being coerced into valid dates.
- Switched date-fns usage to subpath imports so CommonJS builds avoid loading the full package barrel.
- Completed date-fns subpath imports for date utilities and selection schemes.
- Cancelled in-progress pointer or touch selections when controlled `selection` props change.
- Cancelled in-progress selections and restored the controlled draft when controlled `blocked` props change.
- Preserved in-progress selections when controlled `blocked` props are reordered or duplicated without changing slots.
- Ended active mouse selections when the pointer is released over a disabled blocked slot.
- Kept time labels inside their fixed column in apps without a global border-box reset.
- Reset grid-cell minimum widths so host button styles cannot force columns to overflow.
- Ignored document-level compatibility mouseup events immediately after touch input.
- Hid redundant visual date headers from assistive technology while preserving full slot labels.
- Removed the unused `react-dom` peer dependency from the published package contract.
- Cancelled active touch drafts when the browser emits `touchcancel`.
- Reset grid-cell width and height constraints so host button styles cannot shrink or stretch slots.
- Kept selected cells on their selected color while hovered so hover styling does not hide selection state.
- Contained visual date header text so long formats and host heading styles cannot spill across columns.
- Limited `touch-action: none` to interactive slot cells instead of decorative header cells.
- Increased desktop date-number header height to avoid clipped glyphs under contained overflow.
- Added canonical `docs/plans` coverage and made `corepack yarn verify` require
  the completed package baseline plan.
- Added `make check` as the repository-standard wrapper around
  `corepack yarn verify`.
- Removed stale reverse date-cell lookup entries when cell registration state is incomplete.
- Ignored late touchmove events after controlled props cancel an active touch selection.
- Ignored late touchend events after controlled props cancel an active touch selection.
- Hid orphaned time labels when no date columns are rendered.
- Added black-box coverage for the docs-plan checker success and failure paths.
- Moved completed custom-renderer plans into the verified `docs/plans` inventory.
- Preserved newer reverse date-cell lookups when older cells unregister or re-register.
- Supported legacy `Spacebar` key values for keyboard slot toggles.
