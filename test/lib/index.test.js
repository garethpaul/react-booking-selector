import BookingSelector, { BookingSelector as NamedBookingSelector } from '../../src/lib'

it('exports BookingSelector as both default and named exports', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})
