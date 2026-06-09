import BookingSelector = require('react-booking-selector')

const defaultExport: typeof BookingSelector = BookingSelector.default
const namedExport: typeof BookingSelector = BookingSelector.BookingSelector

const selection: BookingSelector.BookingSelectorProps['selection'] = [
  new Date('2026-06-08T09:00:00.000Z'),
  '2026-06-08T10:00:00.000Z',
  { valueOf: () => new Date('2026-06-08T11:00:00.000Z').getTime() },
]
const blocked: BookingSelector.BookingSelectorProps['blocked'] = null
const margin: BookingSelector.BookingSelectorCssLength = '0.25rem'
const ariaLabel: BookingSelector.BookingSelectorProps['ariaLabel'] = 'Appointment availability'
const standardAriaLabel: BookingSelector.BookingSelectorProps['aria-label'] = 'Team appointment availability'

const onChange: NonNullable<BookingSelector.BookingSelectorProps['onChange']> = (nextSelection) => {
  nextSelection.forEach((time) => {
    time.toISOString()
  })
}

void defaultExport
void namedExport
void selection
void blocked
void margin
void ariaLabel
void standardAriaLabel
void onChange
