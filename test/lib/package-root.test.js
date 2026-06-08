import { execFileSync } from 'child_process'

import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'
import packageJson from 'react-booking-selector/package.json'

it('exports BookingSelector from the package root', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})

it('exports package metadata', () => {
  expect(packageJson.name).toBe('react-booking-selector')
})

it('supports the package ESM import condition', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'; console.log(`${typeof BookingSelector}:${BookingSelector === NamedBookingSelector}`)"
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )

  expect(output.trim()).toBe('function:true')
})
