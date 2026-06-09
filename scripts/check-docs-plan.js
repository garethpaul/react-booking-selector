'use strict'

const fs = require('node:fs')
const path = require('node:path')

const planDir = 'docs/plans'
const baselinePlanPath = path.join(planDir, '2026-06-08-react-booking-selector-baseline.md')
const makefile = fs.existsSync('Makefile') ? fs.readFileSync('Makefile', 'utf8') : ''
const readme = fs.existsSync('README.md') ? fs.readFileSync('README.md', 'utf8') : ''

const errors = []
const planPaths = fs.existsSync(planDir)
  ? fs
      .readdirSync(planDir)
      .filter((name) => name.endsWith('.md'))
      .sort()
      .map((name) => path.join(planDir, name))
  : []
const readmePlanReferences = Array.from(readme.matchAll(/docs\/plans\/[-\w.]+\.md/gu), (match) => match[0]).sort()

if (planPaths.length === 0) {
  errors.push(`${planDir} must contain completed plan markdown files`)
}

if (!planPaths.includes(baselinePlanPath)) {
  errors.push(`${baselinePlanPath} is missing`)
}

for (const planPath of planPaths) {
  const plan = fs.readFileSync(planPath, 'utf8')
  if (!/^## Status: Completed$/mu.test(plan)) {
    errors.push(`${planPath} must record Status: Completed`)
  }
  if (!plan.includes('corepack yarn verify')) {
    errors.push(`${planPath} must record corepack yarn verify`)
  }
  if (!plan.includes('make check')) {
    errors.push(`${planPath} must record make check`)
  }
  if (!readme.includes(planPath)) {
    errors.push(`README.md must reference ${planPath}`)
  }
}

for (const readmePlanReference of readmePlanReferences) {
  if (!planPaths.includes(readmePlanReference)) {
    errors.push(`README.md references missing plan ${readmePlanReference}`)
  }
}

if (!makefile.includes('corepack yarn verify')) {
  errors.push('Makefile must expose corepack yarn verify')
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(`Docs plan check passed for ${planPaths.length} plan(s).\n`)
