'use strict'

const fs = require('node:fs')
const path = require('node:path')

const planDir = 'docs/plans'
const baselinePlanPath = path.join(planDir, '2026-06-08-react-booking-selector-baseline.md')
const makefile = fs.existsSync('Makefile') ? fs.readFileSync('Makefile', 'utf8') : ''
const readme = fs.existsSync('README.md') ? fs.readFileSync('README.md', 'utf8') : ''

const errors = []
const planFilenamePattern = /^(\d{4})-(\d{2})-(\d{2})-[-\w.]+\.md$/u

const getPlanPaths = () => {
  if (!fs.existsSync(planDir)) return []
  if (!fs.statSync(planDir).isDirectory()) {
    errors.push(`${planDir} must be a directory`)
    return []
  }

  return fs
    .readdirSync(planDir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => path.join(planDir, name))
}

const planPaths = getPlanPaths()
const readmePlanReferences = Array.from(readme.matchAll(/docs\/plans\/[-\w.]+\.md/gu), (match) => match[0]).sort()
const readmePlanReferenceCounts = readmePlanReferences.reduce(
  (counts, planPath) => counts.set(planPath, (counts.get(planPath) ?? 0) + 1),
  new Map(),
)

const isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

const getDaysInMonth = (year, month) => {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  if ([4, 6, 9, 11].includes(month)) return 30
  return 31
}

const isValidPlanFilename = (planFilename) => {
  const match = planFilename.match(planFilenamePattern)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(year, month)
}

if (planPaths.length === 0) {
  errors.push(`${planDir} must contain completed plan markdown files`)
}

if (!planPaths.includes(baselinePlanPath)) {
  errors.push(`${baselinePlanPath} is missing`)
}

for (const planPath of planPaths) {
  const planFilename = path.basename(planPath)
  const plan = fs.readFileSync(planPath, 'utf8')
  if (!isValidPlanFilename(planFilename)) {
    errors.push(`${planPath} must use a valid YYYY-MM-DD descriptive filename`)
  }
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

for (const [readmePlanReference, referenceCount] of readmePlanReferenceCounts) {
  if (referenceCount > 1) {
    errors.push(`README.md must reference ${readmePlanReference} once, found ${referenceCount}`)
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
