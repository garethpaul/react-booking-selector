# React Booking Selector

![Screenshot](/screenshot.png?raw=true)

## Getting Started

```
yarn add react-booking-selector styled-components
```

TypeScript declarations are included for both the default export and the named `BookingSelector` export.

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

## `<BookingSelector />`

`BookingSelector` is a controlled component that can be used with the default settings. Provide values for `selection` and `blocked`, pass an `onChange` handler, and customize the UI with the props below.

To customize the UI, you can either:

1.  Specify values for the color, margin, format, etc. props
2.  Use the `renderDateCell` render prop to handle rendering yourself.

### Date and time behavior

`BookingSelector` uses JavaScript `Date` values in the runtime's local timezone. The `startDate` time portion is ignored, and the grid starts at local midnight for that date. `minTime` and `maxTime` are local 24-hour clock values from `0` to `23`.

Values in `selection` and `blocked` are matched to grid slots at minute precision. For predictable results, pass dates that represent the same local timezone and hour/minute values as the rendered grid.

### Accessibility

Each time slot is rendered as a keyboard-focusable button unless it is blocked. Users can move between adjacent slots with the arrow keys, toggle a focused slot with `Enter` or `Space`, and every slot exposes an accessible label with its selected, blocked, or available state plus the full date and hour.

### `Props`

#### `selection`

**type**: `Array<Date>`

**description**: List of dates/times that should be filled in on the grid (reflect the start time of each cell).

**required**: no

**default value**: `[]`

#### `blocked`

**type**: `Array<Date>`

**description**: These are blocked or unavailable dates/times on the calendar that will be filled in on the grid and unavailable to select.

**required**: no

**default value**: `[]`

#### `selectionScheme`

**type**: `'square'` | `'linear'`

**description**: The behavior for selection when dragging. `square` selects a square with the start and end cells at opposite corners. `linear` selects all the cells that are chronologically between the start and end cells.

**required**: no

**default value**: `'square'`

#### `onChange`

**type**: `(Array<Date>) => void`

**description**: Called when selected availability is changed. The new list of selected dates is passed in as the first parameter.

**required**: no

**default value**: no-op function

#### `startDate`

**type**: `Date`

**description**: The date on which the grid should start. The time portion is ignored; specify start time with `minTime`.

**required**: no

**default value**: today

#### `numDays`

**type**: `number`

**description**: The number of days to show, starting from `startDate`

**required**: no

**default value**: `7`

#### `minTime`

**type**: `number`

**description**: The minimum hour to show (0-23)

**required**: no

**default value**: `9`

#### `maxTime`

**type**: `number`

**description**: The maximum hour to show (0-23)

**required**: no

**default value**: `23`

#### `dateFormat`

**type**: `string`

**description**: The date-fns `format` token string used for the column headers

**required**: no

**default value**: `'d'`

#### `margin`

**type**: `number`

**description**: The margin between grid cells (in pixels)

**required**: no

**default value**: `3`

#### `unselectedColor`

**type**: `string`

**description**: The color of an unselected cell

**required**: no

**default value**: `'#dbedff'`

#### `selectedColor`

**type**: `string`

**description**: The color of a selected cell

**required**: no

**default value**: `'rgba(89, 154, 242, 1)'`

#### `hoveredColor`

**type**: `string`

**description**: The color of a hovered cell

**required**: no

**default value**: `'rgba(162, 198, 248, 1)'`

#### `blockedColor`

**type**: `string`

**description**: The color of a blocked cell

**required**: no

**default value**: `'rgba(79, 79, 79, 1)'`

#### `renderDateCell`

**type**: `(time: Date, selected: boolean, blocked: boolean) => React.Node`

**description**: A render prop function that receives the time represented by the cell, whether the cell is selected, and whether the cell is blocked. If you choose to use this custom render function, the color props above have no effect. The outer grid cell still supplies selection handlers, keyboard handlers, and accessibility attributes.

**required**: no

**default value**: default colored cell
