import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'
import packageJson from 'react-booking-selector/package.json'

it('exports BookingSelector from the package root', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})

it('exports package metadata', () => {
  expect(packageJson.name).toBe('react-booking-selector')
})
