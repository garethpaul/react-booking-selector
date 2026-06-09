import * as React from 'react'
import BookingSelector, {
  BookingSelector as NamedBookingSelector,
  type BookingSelectorProps,
} from 'react-booking-selector'

const dateLike = { valueOf: () => new Date('2026-06-08T11:00:00.000Z').getTime() }
const selection: BookingSelectorProps['selection'] = [
  new Date('2026-06-08T09:00:00.000Z'),
  '2026-06-08T10:00:00.000Z',
  dateLike,
  null,
  undefined,
]
const blocked: BookingSelectorProps['blocked'] = [new Date('2026-06-08T12:00:00.000Z').getTime(), null, undefined]
const nullSelection: BookingSelectorProps['selection'] = null
const nullBlocked: BookingSelectorProps['blocked'] = null

const renderDateCell: BookingSelectorProps['renderDateCell'] = (time, selected, blockedCell) => (
  <span data-time={time.toISOString()} data-selected={selected} data-blocked={blockedCell} />
)

const onChange: BookingSelectorProps['onChange'] = (nextSelection) => {
  nextSelection.forEach((time) => {
    time.toISOString()
  })
}

const defaultExport = (
  <BookingSelector
    className="booking-selector-shell"
    id="booking-selector"
    style={{ maxWidth: 480 }}
    selection={selection}
    blocked={blocked}
    selectionScheme="square"
    onChange={onChange}
    startDate={new Date('2026-06-08T00:00:00.000Z')}
    numDays={3}
    minTime={9}
    maxTime={17}
    dateFormat="MMM d"
    margin="0.25rem"
    unselectedColor="#dbedff"
    selectedColor="rgba(89, 154, 242, 1)"
    hoveredColor="rgba(162, 198, 248, 1)"
    blockedColor="rgba(79, 79, 79, 1)"
    ariaLabel="Appointment availability"
    aria-label="Team appointment availability"
    aria-labelledby="team-availability-heading"
    renderDateCell={renderDateCell}
  />
)

const namedExport = <NamedBookingSelector selection={selection} onChange={onChange} />
const nullishProps = <NamedBookingSelector selection={nullSelection} blocked={nullBlocked} onChange={onChange} />

void defaultExport
void namedExport
void nullishProps
