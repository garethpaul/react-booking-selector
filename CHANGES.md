# Changes

## 2026-06-20

- Pinned `js-yaml` to 4.2.0 across legacy coverage tooling, removing the
  transitive GHSA-h67p-54hq-rp68 finding that Dependabot could not update.
- Added package and documentation-contract coverage for the patched parser
  resolution.

## 2026-06-19

- Retained document mouseup targets whose listener cleanup fails, retried every
  possible owner during unmount, and ignored orphaned events after unmount.
- Added a blocked-aware roving tab stop so keyboard users enter the slot grid
  once and continue with Arrow, Home, End, and Control+Home/End navigation.
- Added focused lifecycle, accessibility, and hostile mutation coverage for
  the reviewed listener and focus ownership boundaries.

## 2026-06-16

- Migrated the document-level mouseup listener when the rendered grid changes
  owner documents and cleaned up the exact retained listener target.

## 2026-06-15

- Migrated repository tooling from Yarn Classic 1.22.22 to Yarn 4.17.0 with
  immutable, lifecycle-script-free installs and the `node-modules` linker.
- Preserved the published Node 16 runtime floor by building the package on Node
  20 and loading the packed CommonJS and ESM entries in a network-disabled,
  digest-pinned Node 16.20.2 container.
- Added fail-closed contracts for the package manager, linker, audit command,
  hosted install mode, and artifact-based runtime boundary.
- Removed automatic documentation deployment from the package publish lifecycle
  while preserving the explicit pinned deployment command.

## 2026-06-13

- Added blocked-aware `Home` and `End` row navigation plus `Control+Home` and
  `Control+End` whole-grid navigation for keyboard users.

## 2026-06-12

- Added a digest-pinned Node 16.20.2 hosted smoke for the checked-in CommonJS
  and ESM package entry points.
- Added packed, unpacked, and per-file package size budgets to `pack:check`.
- Rejected malformed npm size metadata and oversized expected package files
  with focused regression coverage.

## 2026-06-10

- Added pinned, read-only hosted package verification on Node 20 and Node 24.
- Added lifecycle-script-free frozen installs and checked-in `dist` reproducibility checks to CI.
- Disabled checkout credential persistence, added manual dispatch, and extended hosted validation to every pushed branch.
- Added CODEOWNERS and fail-closed checks for workflow count, ownership, permissions, action uniqueness, and trigger scope.
- Added duplicate package file detection to the package manifest allowlist and
  npm dry-run contents checks.
- Added packed-file mode validation so JavaScript, declarations, docs, and
  assets cannot publish with executable bits.

## 2026-06-09

- Added package manifest allowlist checks so `pack:check` fails if
  `package.json` broadens published files beyond the intended package surface.
- Removed tracked VS Code editor settings from verification inputs and added
  package-root coverage for the `.vscode/` ignore rule.
- Pinned the Makefile default goal to `check` so future target reordering cannot
  weaken the repository-standard gate.
- Added Makefile `lint`, `test`, and `build` wrappers with Jest coverage for
  the repository-standard gate aliases.
- Ran the normal Jest test script serially after `lib:build` so generated
  package metadata is stable before Jest crawls the workspace.
- Updated Prettier to the `3.8.4` patch release without changing formatted
  output.
- Guarded document-level mouseup listener registration and cleanup so
  non-standard DOM listener failures cannot break mount or unmount cleanup.
- Skipped document-level mouse and touch hit testing when no browser document is
  available.
- Updated the packaged README overview image to show a seven-day grid.
- Captured Date prototype readers at module load so later prototype mutations
  cannot affect date normalization and slot bookkeeping.
- Used the rendered grid's owner document for mouseup listener wiring and touch
  hit testing.
- Resolved date-cell event targets without relying on global DOM constructors.
- Reused guarded date-cell target lookup for touch hit testing so malformed
  hit-test results cannot throw or loop.
- Guarded grid owner-document lookup so malformed refs fall back to the browser
  document when possible.
- Fell back to Date object-tag checks when `instanceof Date` throws in hostile
  host environments.
- Ignored throwing event default-prevention methods instead of failing keyboard
  navigation or touch-scroll handling.
- Ignored docs process-shim fallback assignment failures when host pages expose
  throwing `window.process` setters.
- Fell back to a captured `Date.now` when touch/mouse suppression clocks are
  later overwritten or throw.
- Verified docs smoke PNG chunk checksums and exact header lengths before
  accepting screenshots.
- Built date grids with captured Date mutators instead of live `date-fns`
  day helpers so later prototype changes cannot break grid construction.
- Used an explicit empty touch timestamp sentinel so compatibility mouse events
  are still suppressed when the clock reports `0`.
- Captured the Date constructor for date normalization, grid construction, and
  custom-render date copies so later global replacements cannot break them.
- Keyed rendered date columns and cells through captured timestamp reads instead
  of live `toISOString` methods.
- Traversed selection-scheme date grids without live Array iteration methods so
  later Array prototype changes cannot break drag selection.
- Captured Array callbacks for selection normalization, draft updates, and grid
  rendering so shadowed array helpers cannot break component behavior.
- Captured Array statics used by component and selection-scheme normalization so
  later global replacements cannot break date-list checks.
- Used the captured Date constructor when falling back from unreadable live
  clocks during touch/mouse suppression.
- Accepted valid `Date` objects created in another JavaScript realm while still
  rejecting objects that only spoof the Date brand.
- Read Date-branded props through intrinsic timestamps so cross-realm values do
  not fall back to unsafe instance coercion.
- Normalized valid custom slot time values before grid validation so
  cross-realm `Date` values remain real booking slots.
- Recovered the docs process shim when host pages expose immutable or throwing
  `window.process` globals.
- Normalized `docs:check` plan paths so README validation remains stable
  across native path separators.
- Tightened `docs:check` so README cannot duplicate canonical `docs/plans`
  links.
- Hardened date range helpers so malformed arguments return `false` instead of
  throwing or being coerced into valid boundaries.
- Required `startDate` to be a valid `Date` object before using it as the grid
  origin.
- Avoided raw coercion of malformed grid range props while computing internal
  update signatures.
- Required docs smoke layout metrics to be finite numbers before evaluating
  overflow checks.
- Hardened selection-scheme helpers so invalid endpoints or malformed date
  lists produce an empty selection.
- Ignored malformed touch coordinates instead of attempting DOM hit testing
  during touch drags.
- Retried transient missing docs smoke layout dumps before failing the browser
  smoke check.
- Hardened date-cell registration when touchmove listener methods are missing
  or malformed.
- Guarded CSS length normalization against malformed non-string margin values.
- Guarded keyboard focus restoration against malformed date-cell lookup
  entries.
- Ignored malformed touch scroll events without callable default prevention.
- Polished package and docs metadata with regression coverage for the generated
  page description.
- Retried transient pending docs smoke layout dumps before failing the browser
  smoke check.
- Guarded public date lookup helpers and keyboard navigation against malformed
  date arguments.
- Ignored non-callable custom date-cell renderers instead of throwing during
  render.
- Ignored non-callable `onChange` props instead of throwing when a selection
  completes.
- Guarded keyboard default-prevention calls against malformed event objects.
- Guarded event-target lookup when DOM constructors are unavailable.
- Ignored nullish touch events before reading touch coordinates.
- Treated custom time-creation errors as placeholder slots instead of throwing
  while building date grids.
- Asserted the production docs meta description in the browser smoke check.
- Expanded `docs:check` so every canonical plan under `docs/plans/` must be
  referenced from README.
- Tightened `docs:check` so canonical plans must use dated filenames.
- Normalized controlled selection drafts and emitted `onChange` payloads to
  minute-unique dates, matching the grid's slot comparison behavior.
- Guarded numeric CSS lengths so non-finite values cannot emit invalid
  `NaNpx` or `Infinitypx` styles.
- Added an optional `docs:smoke` script for local headless Chrome checks of the
  built docs DOM and desktop/mobile screenshots.
- Added black-box coverage for the docs smoke script without requiring a real
  browser in the default verification gate.
- Hardened keyboard navigation helper lookup against sparse date-column arrays.
- Passed a cloned date into custom cell renderers so renderer mutations cannot
  corrupt grid interaction state.
- Tightened docs smoke timeout handling so a stuck browser process is terminated
  before the script exits.
- Added regression coverage for in-place `blocked` prop array updates.
- Hardened selection-scheme helpers so sparse day buckets are skipped instead
  of throwing.
- Added docs smoke regression coverage for blank screenshot failures.
- Tightened docs smoke DOM checks to assert representative available and
  blocked slot labels survive the production bundle.
- Returned `400 Bad request` for malformed docs smoke server paths instead of
  letting malformed percent-encoding crash the smoke process.
- Tightened `docs:check` so README cannot keep stale links to deleted
  `docs/plans` files.
- Avoided redundant `isTouchDragging` state writes during repeated touchmove
  events in an active touch drag.
- Avoided redundant touch drag cleanup state writes after touch streams are
  already idle.
- Rejected decoded null-byte docs smoke server paths with `400 Bad request`
  instead of letting invalid filesystem paths throw.
- Kept the docs GitHub link focus outline visible in browsers without
  `:focus-visible` support.
- Asserted the safe external GitHub link in the production docs smoke DOM
  checks.
- Kept booking grid cell focus outlines visible in browsers without
  `:focus-visible` support.
- Made the CommonJS entry writer create its output directory when run directly.
- Added docs smoke regression coverage for encoded path traversal attempts.
- Reported incomplete docs smoke PNG screenshots with explicit parser errors.
- Reset WebKit button appearance on booking grid cells for Safari parity.
- Asserted the CommonJS package root's ESM interop marker at runtime.
- Skipped sparse time entries inside selection-scheme day buckets.
- Avoided redundant `endSelection` state writes when selection is already idle.
- Treated non-Date custom time values as grid placeholders.
- Hardened keyboard navigation against malformed slot lists and entries.
- Finished selection cleanup callbacks even when no draft update can run.
- Reset wrapper and grid minimum widths for flex host layouts.
- Refreshed idle controlled selection drafts when prop order changes.
- Ignored non-callable listener cleanup entries during unmount.
- Refreshed idle controlled selection drafts when exact selected values change
  inside the same slot minute.
- Replaced primitive docs `window.process` shims before assigning
  `process.env.NODE_ENV`.
- Required docs-plan filename dates to be valid calendar dates, not just
  date-shaped prefixes.
- Added narrow-mobile docs smoke screenshots to catch 320px layout regressions.
- Marked the published package contract as explicitly side-effect-free instead
  of listing an internal docs entry that is not published.
- Added a strict package-contents check so `pack:check` fails on missing,
  unexpected, or forbidden published files.
- Split ESLint globals by source, script, and test targets so environment-only
  globals do not leak across file types.
- Added `eslint.config.js` itself to the warning-free lint gate.
- Extended `docs:smoke` with desktop, mobile, and narrow-mobile horizontal
  overflow checks.

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
- Aligned TypeScript declarations with runtime support for null `selection` and `blocked` props.
- Made the docs GitHub link open as a safe external link and covered it with a docs test.
- Kept Jest coverage thresholds focused on package code while allowing docs-app tests.
- Exposed the docs GitHub link's new-tab behavior in its accessible name.
- Aligned margin prop declarations and docs with runtime support for CSS length strings.
- Aligned source Flow props with runtime and TypeScript support for nullish selection lists.
- Avoided suppressing touch scrolling from disabled blocked cells.
- Updated the project vision next priorities to reflect completed interaction and accessibility coverage.
- Hardened the docs HTML process shim when a host already defines `window.process` without `env`.
- Kept generated slot hours stable across daylight-saving-time offset changes.
- Rendered nonexistent spring-forward hours as placeholders instead of duplicate selectable slots.
- Kept arrow-key focus on the rendered slot grid across daylight-saving-time placeholders.
- Updated the project vision to track daylight-saving-time placeholder coverage as an ongoing maintenance concern.
- Added docs-app coverage for the demo grid updating its visible selected-slot count.
- Added package-manager metadata so Corepack uses the intended Yarn release.
- Exposed the docs demo selection count as an atomic live status region.
- Queued selection cleanup before firing `onChange` so parent callbacks can unmount safely.
- Queued touch-drag cleanup before firing `onChange` so parent callbacks can unmount safely.
- Added React StrictMode coverage for date-cell lookup and touch-listener cleanup.
- Added docs-plan checker coverage for empty plan directories and missing baseline plans.
- Cancelled active selections when the rendered date or hour grid changes.
- Exposed the docs demo content through a main landmark.
- Added an `ariaLabel` prop for customizing the booking slot group name.
- Added direct coverage for the CommonJS entry writer script.
- Supported the standard `aria-label` prop for naming the booking slot group.
- Passed `className` and `style` through to the outer component wrapper.
- Supported `aria-labelledby` for naming the booking slot group from visible text.
- Preserved in-progress selections when controlled `selection` props are reordered or duplicated without changing slots.
- Passed `id` through to the outer component wrapper.
- Ignored blocked cells as mouse or touch drag endpoints.
- Supported `aria-describedby` for describing the booking slot group with visible helper text.
- Added npm package issue tracker and README homepage metadata.
- Connected the docs demo selected-slot status to the booking grid as an accessible description.
- Skipped blocked slots during arrow-key navigation instead of stopping focus on disabled cells.
- Ignored non-primary mouse buttons for drag selection.
- Cancelled active selections when `selectionScheme` changes.
- Removed Parcel caches after successful docs builds.
