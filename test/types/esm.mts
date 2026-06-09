import BookingSelector, {
  BookingSelector as NamedBookingSelector,
  type BookingSelectorProps,
} from 'react-booking-selector'

const selection: BookingSelectorProps['selection'] = [
  new Date('2026-06-08T09:00:00.000Z'),
  '2026-06-08T10:00:00.000Z',
  { valueOf: () => new Date('2026-06-08T11:00:00.000Z').getTime() },
]
const blocked: BookingSelectorProps['blocked'] = null

const onChange: NonNullable<BookingSelectorProps['onChange']> = (nextSelection) => {
  nextSelection.forEach((time) => {
    time.toISOString()
  })
}

void BookingSelector
void NamedBookingSelector
void selection
void blocked
void onChange
