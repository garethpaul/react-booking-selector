# React Booking Selector

![React Booking Selector overview](docs/readme-overview.svg)

`react-booking-selector` is a controlled React component for selecting date and time slots on a day-by-hour booking grid. It supports blocked slots, square or linear drag selection, keyboard navigation, custom colors, and custom cell rendering.

## Getting Started

```bash
yarn add react-booking-selector styled-components
```

TypeScript declarations are included for both the default export and the named `BookingSelector` export.

Supported peer dependency majors are React 18 or 19, React DOM 18 or 19, and styled-components 5 or 6.

```js
import React from 'react'
import BookingSelector from 'react-booking-selector'
// Or: import { BookingSelector } from 'react-booking-selector'

class App extends React.Component {
  state = {
    selection: [],
    blocked: []
  }

  handleChange = selection => {
    this.setState({ selection })
  }

  render() {
    return (
      <BookingSelector
        selection={this.state.selection}
        blocked={this.state.blocked}
        numDays={5}
        minTime={8}
        maxTime={22}
        onChange={this.handleChange}
      />
    )
  }
}
```

## Component Behavior

`BookingSelector` is controlled. Pass `selection`, `blocked`, and `onChange`; the component renders the grid and reports the next selection when the user finishes a click, drag, tap, touch drag, or keyboard toggle.

Selection schemes:

- `square` selects a rectangular block between the start and end cells.
- `linear` selects every chronological slot between the start and end cells.

Each time slot is a focusable button unless it is blocked. Arrow keys move focus between adjacent slots, and `Enter` or `Space` toggles the focused slot. Slots expose accessible labels that include their selected, blocked, or available state plus the full date and hour.

## Date and Time Behavior

`BookingSelector` uses JavaScript `Date` values in the runtime's local timezone. The `startDate` time portion is ignored, and the grid starts at local midnight for that date. `minTime` and `maxTime` are local 24-hour clock values from `0` to `23`.

Values in `selection` and `blocked` may be `Date` objects, timestamps, or date strings, and are normalized to `Date` objects before comparison. They are matched to grid slots at minute precision. For predictable results, prefer `Date` objects that represent the same local timezone and hour/minute values as the rendered grid.

## Props

### `selection`

**type**: `Array<Date | string | number>`

**description**: List of date/times that should be selected in the grid. Values should reflect the start time of each selected slot.

**required**: no

**default value**: `[]`

### `blocked`

**type**: `Array<Date | string | number>`

**description**: List of date/times that should be unavailable to select.

**required**: no

**default value**: `[]`

### `selectionScheme`

**type**: `'square' | 'linear'`

**description**: Drag-selection behavior. `square` selects a block with the start and end cells at opposite corners. `linear` selects all slots chronologically between the start and end cells.

**required**: no

**default value**: `'square'`

### `onChange`

**type**: `(selection: Date[]) => void`

**description**: Called when selected availability changes. The new selected dates are passed as the first argument.

**required**: no

**default value**: no-op function

### `startDate`

**type**: `Date`

**description**: The date on which the grid should start. The time portion is ignored; specify the visible hours with `minTime` and `maxTime`.

**required**: no

**default value**: today

### `numDays`

**type**: `number`

**description**: Number of days to show, starting from `startDate`.

**required**: no

**default value**: `7`

### `minTime`

**type**: `number`

**description**: Minimum hour to show, from `0` to `23`. Slots render only when `maxTime` is greater than or equal to `minTime`.

**required**: no

**default value**: `9`

### `maxTime`

**type**: `number`

**description**: Maximum hour to show, from `0` to `23`. Slots render only when `maxTime` is greater than or equal to `minTime`.

**required**: no

**default value**: `23`

### `dateFormat`

**type**: `string`

**description**: date-fns `format` token string used for column headers.

**required**: no

**default value**: `'d'`

### `margin`

**type**: `number`

**description**: Margin between grid cells in pixels.

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

**description**: Color of a hovered cell.

**required**: no

**default value**: `'rgba(162, 198, 248, 1)'`

### `blockedColor`

**type**: `string`

**description**: Color of a blocked cell.

**required**: no

**default value**: `'rgba(79, 79, 79, 1)'`

### `renderDateCell`

**type**: `(time: Date, selected: boolean, blocked: boolean) => React.ReactNode`

**description**: Optional render prop for custom slot content. The outer grid cell still supplies selection handlers, keyboard handlers, and accessibility attributes. Color props do not affect custom cell content.

**required**: no

**default value**: default colored cell

## Development

```bash
corepack yarn lint
corepack yarn types:check
corepack yarn test --runInBand
corepack yarn build
npm pack --dry-run
```

`npm pack --dry-run` exercises the `prepack` build and verifies the published file list. The package intentionally publishes `dist/lib`, `docs/readme-overview.svg`, `README.md`, and `LICENSE`.
