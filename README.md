# React Booking Selector

![React Booking Selector overview](docs/readme-overview.svg)

`react-booking-selector` is a controlled React component for selecting date and time slots on a day-by-hour booking grid. It supports blocked slots, square or linear drag selection, keyboard navigation, custom colors, and custom cell rendering.

## Getting Started

### Registry Source Boundary

npm `latest` still resolves to `1.0.2`, published on April 12, 2020. That
historical registry artifact declares React `>=15.5 && <=16.0`,
styled-components `>=2.0 || >=3.0` (effectively `>=2.0`), and
Node greater than 8; it does not contain the current package exports,
TypeScript declarations, keyboard behavior, or verification stack. The
registry package is not the current default-branch source.

Use the install command below only when you intentionally need the historical registry package.

```bash
yarn add react-booking-selector styled-components
```

To evaluate current source, check out a reviewed repository commit and use the
Node 20+/Yarn 4 development commands documented below. A future current-source release needs a new version and a reviewed publish.

TypeScript declarations are included for both the default export and the named `BookingSelector` export.

The package exposes a root `exports` map with CommonJS and ESM entry points, and keeps `main`, `module`, and `types` fields for compatibility. Supported peer dependency majors are React 18 or 19 and styled-components 5 or 6.

The published package supports Node 16 or newer for package resolution. A
dedicated hosted job builds a package tarball on Node 20 and loads both package
entry modes from that artifact in digest-pinned Node 16.20.2. Repository
development uses Yarn 4.17.0 and Node 20 or newer because the package manager
and dev-only validation tools require it.

```js
import React, { useState } from 'react'
import BookingSelector from 'react-booking-selector'
// Or: import { BookingSelector } from 'react-booking-selector'

const blocked = []

function App() {
  const [selection, setSelection] = useState([])

  return (
    <BookingSelector
      selection={selection}
      blocked={blocked}
      numDays={5}
      minTime={8}
      maxTime={22}
      onChange={setSelection}
    />
  )
}
```

## Component Behavior

`BookingSelector` is controlled. Pass `selection`, `blocked`, and `onChange`; the component renders the grid and reports the next selection when the user finishes a click, drag, tap, touch drag, or keyboard toggle.

Selection schemes:

- `square` selects a rectangular block between the start and end cells.
- `linear` selects every chronological slot between the start and end cells.

Each time slot is rendered as a native button. Blocked slots are disabled and removed from the tab order. The grid keeps one available slot in the tab order and moves that roving tab stop with focus, so keyboard users enter the grid once and continue with its navigation keys. Arrow keys move focus across the rendered slot grid, skipping disabled slots. `Home` and `End` move to the first and last available slot in the current hour row; `Control+Home` and `Control+End` move to the first and last available slot in the complete rendered grid. `Enter` or `Space` toggles the focused slot. Slots expose accessible labels that include their selected, blocked, or available state plus the full date and hour.

If the same slot appears in both `selection` and `blocked`, blocked state takes precedence. The slot renders as unavailable, is exposed as unpressed to assistive technology, and is not carried into the next selection emitted by `onChange`.

During an active drag or touch selection, controlled `selection` and `blocked` rerenders that keep the same slot-minute set preserve the visible draft instead of canceling the interaction.
When no interaction is active, controlled `selection` rerenders refresh the exact normalized date values and order, even when the selected slot-minute set is unchanged.

## Custom Cell Rendering

Use `renderDateCell` when a slot needs custom content. The outer grid cell still owns pointer, touch, keyboard, focus, and accessibility behavior, so custom content should be presentational rather than another interactive control.

```js
const renderDateCell = (time, selected, blocked) => (
  <span className={`slot-content ${selected ? 'selected' : ''} ${blocked ? 'blocked' : ''}`}>
    {time.getHours()}:00
  </span>
)

<BookingSelector
  selection={selection}
  blocked={blocked}
  renderDateCell={renderDateCell}
  onChange={setSelection}
/>
```

## Date and Time Behavior

`BookingSelector` uses JavaScript `Date` values in the runtime's local timezone. The `startDate` prop must be a valid `Date` object; its time portion is ignored, and the grid starts at local midnight for that date. If `startDate` is omitted, invalid, or not a `Date` object, the grid starts from today. `minTime` and `maxTime` are local 24-hour clock values from `0` to `23`. Slots are built from local calendar dates and visible hours so daylight-saving-time offset changes do not shift ordinary wall-clock hours. Nonexistent local hours during spring-forward transitions render as empty placeholders rather than duplicate selectable slots, and keyboard navigation follows the rendered grid instead of normalizing missing hours into another row.

Values in `selection` and `blocked` may be `Date` objects, timestamps, date strings, date-like objects with a numeric `valueOf()`, `null`, or `undefined`, and are normalized to `Date` objects before comparison. Nullish, invalid, malformed, or unsupported values are ignored rather than coerced. Valid values are matched to grid slots at minute precision. For predictable results, prefer `Date` objects that represent the same local timezone and hour/minute values as the rendered grid.

Selection draft state and `onChange` payloads are also normalized at minute
precision. Duplicate values in the same minute collapse to the first valid
value while preserving the order of distinct selected slots.

## Props

### `className`

**type**: `string`

**description**: Class name applied to the outer component wrapper.

**required**: no

**default value**: none

### `id`

**type**: `string`

**description**: ID applied to the outer component wrapper.

**required**: no

**default value**: none

### `style`

**type**: `React.CSSProperties`

**description**: Inline styles applied to the outer component wrapper.

**required**: no

**default value**: none

### `selection`

**type**: `Array<Date | string | number | { valueOf(): number } | null | undefined> | null | undefined`

**description**: List of date/times that should be selected in the grid. Values should reflect the start time of each selected slot.

**required**: no

**default value**: `[]`

### `blocked`

**type**: `Array<Date | string | number | { valueOf(): number } | null | undefined> | null | undefined`

**description**: List of date/times that should be unavailable to select.

**required**: no

**default value**: `[]`

### `selectionScheme`

**type**: `'square' | 'linear'`

**description**: Drag-selection behavior. `square` selects a block with the start and end cells at opposite corners. `linear` selects all slots chronologically between the start and end cells. Changing the scheme during an active drag cancels that draft.

**required**: no

**default value**: `'square'`

### `onChange`

**type**: `(selection: Date[]) => void`

**description**: Called when selected availability changes. The new selected dates are passed as the first argument.

**required**: no

**default value**: no-op function

### `startDate`

**type**: `Date`

**description**: The valid `Date` object on which the grid should start. The time portion is ignored; specify the visible hours with `minTime` and `maxTime`.

**required**: no

**default value**: today

### `numDays`

**type**: `number`

**description**: Number of days to show, starting from `startDate`.

**required**: no

**default value**: `7`

### `minTime`

**type**: `number`

**description**: Minimum whole hour to show, from `0` to `23`. Slots render only when `minTime` and `maxTime` are whole hours in that range and `maxTime` is greater than or equal to `minTime`.

**required**: no

**default value**: `9`

### `maxTime`

**type**: `number`

**description**: Maximum whole hour to show, from `0` to `23`. Slots render only when `minTime` and `maxTime` are whole hours in that range and `maxTime` is greater than or equal to `minTime`.

**required**: no

**default value**: `23`

### `dateFormat`

**type**: `string`

**description**: date-fns `format` token string used for column headers.
Invalid format strings fall back to the default day-of-month header format.

**required**: no

**default value**: `'d'`

### `margin`

**type**: `number | string`

**description**: Margin between grid cells. Numbers are treated as pixels; strings may use any valid CSS length.
Non-finite numbers fall back to `0px`.

**required**: no

**default value**: `3`

### `unselectedColor`

**type**: `string`

**description**: Color of an unselected cell.

**required**: no

**default value**: `'#dbedff'`

### `selectedColor`

**type**: `string`

**description**: Color of a selected cell.

**required**: no

**default value**: `'rgba(89, 154, 242, 1)'`

### `hoveredColor`

**type**: `string`

**description**: Color of a hovered unselected, available cell. Selected and blocked cells keep their state colors on hover.

**required**: no

**default value**: `'rgba(162, 198, 248, 1)'`

### `blockedColor`

**type**: `string`

**description**: Color of a blocked cell.

**required**: no

**default value**: `'rgba(79, 79, 79, 1)'`

### `aria-label` / `ariaLabel`

**type**: `string`

**description**: Accessible label for the booking slot group. Prefer the standard `aria-label` prop; `ariaLabel` is also supported. Use a unique label when rendering more than one selector on the same page.

**required**: no

**default value**: `'Booking time slots'`

### `aria-describedby`

**type**: `string`

**description**: ID reference for visible helper text that describes the booking slot group.

**required**: no

**default value**: none

### `aria-labelledby`

**type**: `string`

**description**: ID reference for visible text that labels the booking slot group. When provided, this takes precedence over `aria-label` and the default group label.

**required**: no

**default value**: none

### `renderDateCell`

**type**: `(time: Date, selected: boolean, blocked: boolean) => React.ReactNode`

**description**: Optional render prop for custom slot content. The `time` argument is a copy of the slot date. The outer grid cell still supplies selection handlers, keyboard handlers, and accessibility attributes. Color props do not affect custom cell content.

**required**: no

**default value**: default colored cell

## Development

```bash
make lint
make test
make build
make check
corepack yarn verify
corepack yarn build
corepack yarn docs:smoke
```

`make lint`, `make test`, `make build`, and `make check` are repository-standard wrappers around the matching
`corepack yarn` gates.
They reject additional Makefiles and non-executing/error-ignoring Make modes;
trusted automation must still provide the intended Node/Corepack toolchain on
`PATH` and must not supply caller-controlled Makefiles.
`corepack yarn verify` checks every dated canonical completed plan under `docs/plans`, runs the real-browser documentation
smoke at desktop and two mobile viewport widths, formatting checks, linting, TypeScript checks, Jest with coverage thresholds, a dependency audit, a strict package dry run with contents validation,
`publint`, and Are The Types Wrong. The package intentionally publishes `dist/lib`, `dist/esm`,
`docs/readme-overview.svg`, `README.md`, and `LICENSE`; packed files must remain non-executable and within the reviewed
64 KiB compressed, 256 KiB unpacked, and 64 KiB per-file package size budget.
`corepack yarn docs:smoke` builds the docs, serves them locally, captures desktop, mobile, and narrow-mobile
screenshots through fixed-size iframe viewports with headless Chrome or Chromium, and checks the rendered DOM, screenshots,
and horizontal layout metrics even when Chrome enforces a wider minimum outer window.
GitHub Actions performs immutable, lifecycle-script-free Yarn 4 installs for
the full verification graph on Node 20 and Node 24. A separate job builds and
packs on Node 20, then loads the read-only artifact under digest-pinned Node
16.20.2 without network access. Hosted verification rebuilds `dist` and rejects
generated output drift. Actions are commit-pinned, use read-only permissions,
disable checkout credential persistence, and run for every pushed branch, pull
request, or manual dispatch.
Package publication and documentation deployment are separate maintainer
actions: publishing never runs a deploy lifecycle hook, and documentation is
deployed only through an explicit `corepack yarn docs:deploy` invocation.
Repository-local `.vscode/` editor state and `.explore/` maintainer intelligence
are ignored, effectively excluded by Git, and forbidden from the tracked source
set. Durable decisions belong in reviewed plans, changes, policies, tests, or
source rather than local metadata.

See `docs/plans/2026-06-08-react-booking-selector-baseline.md` for the current package verification baseline.
See `docs/plans/2026-06-08-docs-plan-inventory-check.md` for the docs-plan inventory baseline.
See `docs/plans/2026-06-08-custom-render-state-coverage.md` for custom cell renderer state coverage.
See `docs/plans/2026-06-08-custom-render-keyboard-coverage.md` for keyboard coverage around custom-rendered cells.

See `docs/plans/2026-06-13-home-end-keyboard-navigation.md` for row-edge and whole-grid keyboard navigation coverage.
See `docs/plans/2026-06-14-location-independent-make.md` for location-independent Make gate coverage.
See `docs/plans/2026-06-15-yarn-4-package-manager.md` for the Yarn 4 toolchain and Node 16 artifact boundary.
See `docs/plans/2026-06-15-explicit-docs-deployment.md` for package publication and documentation deployment separation.
See `docs/plans/2026-06-16-document-mouseup-listener-migration.md` for owner-document listener migration and retained-target cleanup.
See `docs/plans/2026-06-19-listener-and-roving-focus-review.md` for failed-cleanup ownership and roving-focus review coverage.
See `docs/plans/2026-06-20-js-yaml-security-resolution.md` for the patched transitive YAML parser boundary.

See `docs/plans/2026-06-21-safe-make-root.md` for fail-closed Make root resolution and regression coverage.
See `docs/plans/2026-06-25-registry-source-boundary.md` for the npm registry and current-source distinction.
See `docs/plans/2026-06-25-local-repository-metadata-ignore.md` for effective local metadata ignore and index coverage.
See `docs/plans/2026-06-26-docs-smoke-verify-gate.md` for the canonical real-browser documentation smoke gate.
See `docs/plans/2026-06-09-minute-unique-selection.md` for minute-unique selection payload handling.
See `docs/plans/2026-06-09-docs-plan-readme-references.md` for README plan-link coverage.
See `docs/plans/2026-06-09-docs-plan-readme-unique-references.md` for unique README plan-link coverage.
See `docs/plans/2026-06-09-docs-plan-filename-validation.md` for dated docs-plan filename validation.
See `docs/plans/2026-06-09-date-utils-malformed-inputs.md` for malformed date utility input handling.
See `docs/plans/2026-06-09-docs-plan-path-normalization.md` for cross-platform docs-plan path validation.
See `docs/plans/2026-06-09-make-gate-wrapper-aliases.md` for Makefile gate wrapper aliases.
See `docs/plans/2026-06-09-editor-metadata-ignore.md` for local editor metadata ignore coverage.
See `docs/plans/2026-06-09-package-manifest-allowlist-check.md` for package manifest allowlist coverage.
See `docs/plans/2026-06-10-package-duplicate-file-check.md` for duplicate package file detection.
See `docs/plans/2026-06-10-package-file-mode-check.md` for packed-file executable mode rejection.
See `docs/plans/2026-06-10-hosted-verification.md` for the pinned Node 20/24 verification and clean distribution gate.
See `docs/plans/2026-06-12-package-size-budget.md` for fail-closed packed, unpacked, and per-file size ceilings.
See `docs/plans/2026-06-12-node16-package-runtime.md` for the advertised runtime-floor package smoke.
