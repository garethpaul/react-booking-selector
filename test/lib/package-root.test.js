import { execFileSync } from 'child_process'

import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'
import packageJson from 'react-booking-selector/package.json'

it('exports BookingSelector from the package root', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})

it('exports package metadata', () => {
  expect(packageJson.name).toBe('react-booking-selector')
  expect(packageJson.description).toBe('A grid-based booking selector.')
  expect(packageJson.peerDependencies.react).toBe('^18.0.0 || ^19.0.0')
  expect(packageJson.peerDependencies['styled-components']).toBe('^5.1.0 || ^6.0.0')
})

it('marks the published package as side-effect free', () => {
  expect(packageJson.sideEffects).toBe(false)
})

it('keeps package entry metadata aligned with the generated builds', () => {
  expect(packageJson.type).toBe('commonjs')
  expect(packageJson.main).toBe('dist/lib/index.js')
  expect(packageJson.module).toBe('dist/esm/index.js')
  expect(packageJson.types).toBe('dist/lib/index.d.ts')
  expect(packageJson.exports['.']).toEqual({
    import: {
      types: './dist/esm/index.d.mts',
      default: './dist/esm/index.js',
    },
    require: {
      types: './dist/lib/index.d.cts',
      default: './dist/lib/index.js',
    },
    default: './dist/esm/index.js',
  })
  expect(packageJson.exports['./package.json']).toBe('./package.json')
})

it('supports direct CommonJS require interop', () => {
  const output = execFileSync(
    process.execPath,
    [
      '-e',
      "const BookingSelector = require('react-booking-selector'); console.log(`${typeof BookingSelector}:${BookingSelector.default === BookingSelector}:${BookingSelector.BookingSelector === BookingSelector}:${BookingSelector.__esModule === true}`)",
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  expect(output.trim()).toBe('function:true:true:true')
})

it('supports the package ESM import condition', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'; console.log(`${typeof BookingSelector}:${BookingSelector === NamedBookingSelector}`)",
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  expect(output.trim()).toBe('function:true')
})
