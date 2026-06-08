import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'

it('exports BookingSelector from the package root', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})
