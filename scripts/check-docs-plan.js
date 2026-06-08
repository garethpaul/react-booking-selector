'use strict'

const fs = require('node:fs')

const planPath = 'docs/plans/2026-06-08-react-booking-selector-baseline.md'
const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : ''
const makefile = fs.existsSync('Makefile') ? fs.readFileSync('Makefile', 'utf8') : ''

const errors = []
if (!plan) {
  errors.push(`${planPath} is missing`)
}
if (!plan.includes('Status: Completed')) {
  errors.push(`${planPath} must record Status: Completed`)
}
if (!plan.includes('corepack yarn verify')) {
  errors.push(`${planPath} must record corepack yarn verify`)
}
if (!plan.includes('make check')) {
  errors.push(`${planPath} must record make check`)
}
if (!makefile.includes('corepack yarn verify')) {
  errors.push('Makefile must expose corepack yarn verify')
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write('Docs plan check passed.\n')
