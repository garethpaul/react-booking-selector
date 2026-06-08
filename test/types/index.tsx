import * as React from 'react'
import BookingSelector, {
  BookingSelector as NamedBookingSelector,
  type BookingSelectorProps
} from '../..'

const dateLike = { valueOf: () => new Date('2026-06-08T11:00:00.000Z').getTime() }
const selection: BookingSelectorProps['selection'] = [
  new Date('2026-06-08T09:00:00.000Z'),
  '2026-06-08T10:00:00.000Z',
  dateLike,
  null,
  undefined
]
const blocked: BookingSelectorProps['blocked'] = [new Date('2026-06-08T12:00:00.000Z').getTime(), null, undefined]

const renderDateCell: BookingSelectorProps['renderDateCell'] = (time, selected, blockedCell) => (
  <span data-time={time.toISOString()} data-selected={selected} data-blocked={blockedCell} />
)

const onChange: BookingSelectorProps['onChange'] = nextSelection => {
  nextSelection.forEach(time => {
    time.toISOString()
  })
}

const defaultExport = (
  <BookingSelector
    selection={selection}
    blocked={blocked}
    selectionScheme="square"
    onChange={onChange}
    startDate={new Date('2026-06-08T00:00:00.000Z')}
    numDays={3}
    minTime={9}
    maxTime={17}
    dateFormat="MMM d"
    margin={4}
    unselectedColor="#dbedff"
    selectedColor="rgba(89, 154, 242, 1)"
    hoveredColor="rgba(162, 198, 248, 1)"
    blockedColor="rgba(79, 79, 79, 1)"
    renderDateCell={renderDateCell}
  />
)

const namedExport = <NamedBookingSelector selection={selection} onChange={onChange} />

void defaultExport
void namedExport
