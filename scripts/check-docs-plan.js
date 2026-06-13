'use strict'

const fs = require('node:fs')
const path = require('node:path')

const planDir = 'docs/plans'
const toPlanPath = (name) => `${planDir}/${name}`
const toFsPath = (planPath) => path.join(...planPath.split('/'))

const baselinePlanPath = toPlanPath('2026-06-08-react-booking-selector-baseline.md')
const ciPlanPath = toPlanPath('2026-06-10-hosted-verification.md')
const homeEndPlanPath = toPlanPath('2026-06-13-home-end-keyboard-navigation.md')
const ciWorkflowPath = '.github/workflows/check.yml'
const workflowDir = '.github/workflows'
const codeownersPath = '.github/CODEOWNERS'
const planDirFsPath = toFsPath(planDir)
const makefile = fs.existsSync('Makefile') ? fs.readFileSync('Makefile', 'utf8') : ''
const readme = fs.existsSync('README.md') ? fs.readFileSync('README.md', 'utf8') : ''

const errors = []
const planFilenamePattern = /^(\d{4})-(\d{2})-(\d{2})-[-\w.]+\.md$/u
const getPlanFilename = (planPath) => planPath.split('/').pop()
const countOccurrences = (contents, fragment) => contents.split(fragment).length - 1

const getPlanPaths = () => {
  if (!fs.existsSync(planDirFsPath)) return []
  if (!fs.statSync(planDirFsPath).isDirectory()) {
    errors.push(`${planDir} must be a directory`)
    return []
  }

  return fs
    .readdirSync(planDirFsPath)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map(toPlanPath)
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

if (!planPaths.includes(ciPlanPath)) {
  errors.push(`${ciPlanPath} is missing`)
}

if (planPaths.includes(ciPlanPath)) {
  const workflowDirFsPath = toFsPath(workflowDir)
  const workflowPaths = fs.existsSync(workflowDirFsPath)
    ? fs
        .readdirSync(workflowDirFsPath)
        .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
        .sort()
    : []
  if (workflowPaths.length !== 1 || workflowPaths[0] !== 'check.yml') {
    errors.push(`${workflowDir} must contain only check.yml`)
  }

  if (!fs.existsSync(toFsPath(ciWorkflowPath))) {
    errors.push(`${ciWorkflowPath} is missing`)
  } else {
    const workflow = fs.readFileSync(toFsPath(ciWorkflowPath), 'utf8')
    const requiredFragments = [
      'runs-on: ubuntu-24.04',
      'timeout-minutes: 20',
      'cancel-in-progress: true',
      'push:',
      'pull_request:',
      'workflow_dispatch:',
      'permissions:\n  contents: read',
      'actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10',
      'persist-credentials: false',
      'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e',
      'node: [20.x, 24.x]',
      'name: Node 16 package runtime',
      'timeout-minutes: 10',
      'image: node:16.20.2-bullseye@sha256:cd59a61258b82b86c1ff0ead50c8a689f6c3483c5ed21036e11ee741add419eb',
      'run: corepack enable',
      'corepack yarn install --frozen-lockfile --ignore-scripts',
      'corepack yarn install --frozen-lockfile --ignore-scripts --ignore-engines',
      'run: corepack yarn package:runtime',
      'run: make check',
      'run: make build',
      'run: git diff --exit-code -- dist',
    ]

    for (const fragment of requiredFragments) {
      if (!workflow.includes(fragment)) errors.push(`${ciWorkflowPath} must include ${fragment}`)
    }

    if (/^\s+(?:branches|branches-ignore|paths|paths-ignore|tags|tags-ignore):/mu.test(workflow)) {
      errors.push(`${ciWorkflowPath} must validate every pushed branch and pull request`)
    }

    const expectedOccurrences = new Map([
      ['permissions:\n  contents: read', 1],
      ['actions/checkout@', 2],
      ['persist-credentials: false', 2],
      ['actions/setup-node@', 1],
      ['run: corepack yarn package:runtime', 1],
    ])
    for (const [fragment, expectedCount] of expectedOccurrences) {
      if (countOccurrences(workflow, fragment) !== expectedCount) {
        errors.push(`${ciWorkflowPath} must include ${fragment} exactly ${expectedCount} time(s)`)
      }
    }

    if (workflow.includes('continue-on-error')) {
      errors.push(`${ciWorkflowPath} must not allow verification failures`)
    }
    if (/^\s+if:/mu.test(workflow)) {
      errors.push(`${ciWorkflowPath} must not conditionally skip verification`)
    }
    if (/^\s*[\w-]+:\s*write\s*$/mu.test(workflow) || workflow.includes('write-all')) {
      errors.push(`${ciWorkflowPath} must not grant write permissions`)
    }
  }

  if (!fs.existsSync(toFsPath(codeownersPath))) {
    errors.push(`${codeownersPath} is missing`)
  } else if (fs.readFileSync(toFsPath(codeownersPath), 'utf8').trim() !== '* @garethpaul') {
    errors.push(`${codeownersPath} must assign all paths to @garethpaul`)
  }
}

if (planPaths.includes(homeEndPlanPath)) {
  const keyboardContractFiles = new Map([
    [
      'src/lib/BookingSelector.js',
      ["key === 'Home'", "key === 'End'", 'event && event.ctrlKey === true', 'getGridEdgeKeyboardNavigationTarget'],
    ],
    [
      'test/lib/BookingSelector.test.js',
      [
        'moves to row edges with Home and End',
        'moves to whole-grid edges with Control+Home and Control+End',
        'does not prevent Home or End defaults when no focus target can be reached',
      ],
    ],
  ])

  for (const [filePath, requiredFragments] of keyboardContractFiles) {
    if (!fs.existsSync(toFsPath(filePath))) {
      errors.push(`${filePath} is required by ${homeEndPlanPath}`)
      continue
    }
    const contents = fs.readFileSync(toFsPath(filePath), 'utf8')
    for (const fragment of requiredFragments) {
      if (!contents.includes(fragment)) errors.push(`${filePath} must preserve ${fragment}`)
    }
  }
}

for (const planPath of planPaths) {
  const planFilename = getPlanFilename(planPath)
  const plan = fs.readFileSync(toFsPath(planPath), 'utf8')
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
