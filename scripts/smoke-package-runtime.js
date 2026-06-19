'use strict'

const { execFileSync } = require('node:child_process')

const runNode = (args) =>
  execFileSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

const commonJsResult = runNode([
  '-e',
  "const BookingSelector = require('react-booking-selector'); console.log(`${typeof BookingSelector}:${BookingSelector.default === BookingSelector}:${BookingSelector.BookingSelector === BookingSelector}:${BookingSelector.__esModule === true}`)",
])

if (commonJsResult !== 'function:true:true:true') {
  throw new Error(`CommonJS package entry smoke failed: ${commonJsResult}`)
}

const esmResult = runNode([
  '--input-type=module',
  '-e',
  "import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'; console.log(`${typeof BookingSelector}:${BookingSelector === NamedBookingSelector}`)",
])

if (esmResult !== 'function:true') {
  throw new Error(`ESM package entry smoke failed: ${esmResult}`)
}

process.stdout.write(`Package runtime smoke passed on ${process.version}.\n`)
