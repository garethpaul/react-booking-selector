'use strict'

const fs = require('node:fs')
const path = require('node:path')

const planDir = 'docs/plans'
const toPlanPath = (name) => `${planDir}/${name}`
const toFsPath = (planPath) => path.join(...planPath.split('/'))

const baselinePlanPath = toPlanPath('2026-06-08-react-booking-selector-baseline.md')
const ciPlanPath = toPlanPath('2026-06-10-hosted-verification.md')
const homeEndPlanPath = toPlanPath('2026-06-13-home-end-keyboard-navigation.md')
const locationIndependentMakePlanPath = toPlanPath('2026-06-14-location-independent-make.md')
const yarnPackageManagerPlanPath = toPlanPath('2026-06-15-yarn-4-package-manager.md')
const explicitDocsDeploymentPlanPath = toPlanPath('2026-06-15-explicit-docs-deployment.md')
const documentListenerMigrationPlanPath = toPlanPath('2026-06-16-document-mouseup-listener-migration.md')
const ciWorkflowPath = '.github/workflows/check.yml'
const workflowDir = '.github/workflows'
const codeownersPath = '.github/CODEOWNERS'
const packageJsonPath = 'package.json'
const packageRootTestPath = 'test/lib/package-root.test.js'
const yarnConfigPath = '.yarnrc.yml'
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
      'node-version: 20.x',
      'run: corepack enable',
      'corepack yarn install --immutable --mode=skip-build',
      'corepack yarn lib:build',
      'package_file="$(npm pack --ignore-scripts --silent)"',
      'tar -xzf "$package_file" --strip-components=1 -C .node16-package',
      'rm "$package_file"',
      'docker run --rm --network none -v "$PWD:/workspace:ro" -w /workspace/.node16-package node:16.20.2-bullseye@sha256:cd59a61258b82b86c1ff0ead50c8a689f6c3483c5ed21036e11ee741add419eb node ../scripts/smoke-package-runtime.js',
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
      ['actions/setup-node@', 2],
      ['corepack yarn install --immutable --mode=skip-build', 2],
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
    if (workflow.includes('container:')) {
      errors.push(`${ciWorkflowPath} must build the package on a Yarn 4-compatible Node release`)
    }
    if (workflow.includes('--frozen-lockfile') || workflow.includes('--ignore-engines')) {
      errors.push(`${ciWorkflowPath} must not use Yarn Classic install flags`)
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

if (planPaths.includes(documentListenerMigrationPlanPath)) {
  const listenerContractFiles = new Map([
    [
      'src/lib/BookingSelector.js',
      [
        'documentMouseUpTarget: ?BrowserDocumentType',
        'syncDocumentMouseUpListener()',
        'removeDocumentMouseUpListener()',
        'browserDocument === this.documentMouseUpTarget',
      ],
    ],
    [
      'test/lib/BookingSelector.test.js',
      [
        'keeps document mouseup ownership synchronized without duplicate listeners',
        'removes document mouseup listeners from the retained owner document',
        'mock.invocationCallOrder[0]',
      ],
    ],
  ])

  for (const [filePath, requiredFragments] of listenerContractFiles) {
    if (!fs.existsSync(toFsPath(filePath))) {
      errors.push(`${filePath} is required by ${documentListenerMigrationPlanPath}`)
      continue
    }
    const contents = fs.readFileSync(toFsPath(filePath), 'utf8')
    for (const fragment of requiredFragments) {
      if (!contents.includes(fragment)) errors.push(`${filePath} must preserve ${fragment}`)
    }
  }

  const listenerGuidance = new Map([
    ['README.md', 'owner-document listener migration and retained-target cleanup'],
    ['SECURITY.md', 'Document-level mouseup ownership must migrate'],
    ['AGENTS.md', 'Retain and migrate the exact owner document'],
    ['VISION.md', 'document-level drag completion aligned with the rendered grid owner'],
    ['CHANGES.md', 'Migrated the document-level mouseup listener'],
  ])
  for (const [filePath, requiredFragment] of listenerGuidance) {
    const contents = fs.existsSync(toFsPath(filePath)) ? fs.readFileSync(toFsPath(filePath), 'utf8') : ''
    if (!contents.includes(requiredFragment)) {
      errors.push(`${filePath} must preserve ${requiredFragment}`)
    }
  }

  const listenerPlan = fs.readFileSync(toFsPath(documentListenerMigrationPlanPath), 'utf8')
  for (const evidence of [
    'focused lifecycle tests passed',
    'external-directory make check passed',
    'Six isolated hostile mutations were rejected',
    'Exact diff',
  ]) {
    if (!listenerPlan.includes(evidence)) {
      errors.push(`${documentListenerMigrationPlanPath} must preserve completed evidence: ${evidence}`)
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

const makeContracts = [
  'override REPO_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))',
  'lint:\n\tcd "$(REPO_ROOT)" && corepack yarn lint',
  'test:\n\tcd "$(REPO_ROOT)" && corepack yarn test',
  'build:\n\tcd "$(REPO_ROOT)" && corepack yarn build',
  'verify:\n\tcd "$(REPO_ROOT)" && corepack yarn verify',
]
if (!makefile.includes('corepack yarn verify')) {
  errors.push('Makefile must expose corepack yarn verify')
}
for (const makeContract of makeContracts) {
  if (!makefile.includes(makeContract)) {
    errors.push(`Makefile must preserve rooted contract: ${makeContract}`)
  }
}

if (planPaths.includes(locationIndependentMakePlanPath)) {
  const locationIndependentMakePlan = fs.readFileSync(toFsPath(locationIndependentMakePlanPath), 'utf8')
  for (const evidence of ['Node 20', 'Node 24', 'unrelated directory', 'hostile mutations rejected']) {
    if (!locationIndependentMakePlan.includes(evidence)) {
      errors.push(`${locationIndependentMakePlanPath} must preserve completed evidence: ${evidence}`)
    }
  }
}

if (planPaths.includes(yarnPackageManagerPlanPath)) {
  if (!fs.existsSync(toFsPath(packageJsonPath))) {
    errors.push(`${packageJsonPath} is required by ${yarnPackageManagerPlanPath}`)
  } else {
    const packageJson = JSON.parse(fs.readFileSync(toFsPath(packageJsonPath), 'utf8'))
    if (packageJson.packageManager !== 'yarn@4.17.0') {
      errors.push(`${packageJsonPath} must pin packageManager to yarn@4.17.0`)
    }
    if (!packageJson.scripts?.verify?.includes('yarn npm audit --all --recursive --severity high')) {
      errors.push(`${packageJsonPath} verify must run the Yarn 4 recursive high-severity audit`)
    }
    if (packageJson.resolutions?.['js-yaml'] !== '4.2.0') {
      errors.push(`${packageJsonPath} must pin patched js-yaml 4.2.0 across legacy coverage tooling`)
    }
    if (packageJson.engines?.node !== '>=16.0') {
      errors.push(`${packageJsonPath} must preserve the published Node >=16.0 runtime floor`)
    }
  }

  if (!fs.existsSync(toFsPath(yarnConfigPath))) {
    errors.push(`${yarnConfigPath} is required by ${yarnPackageManagerPlanPath}`)
  } else if (!/^nodeLinker: node-modules$/mu.test(fs.readFileSync(toFsPath(yarnConfigPath), 'utf8'))) {
    errors.push(`${yarnConfigPath} must preserve the node-modules linker`)
  }

  const yarnPackageManagerPlan = fs.readFileSync(toFsPath(yarnPackageManagerPlanPath), 'utf8')
  for (const evidence of ['Node 20', 'Node 24', 'Node 16', 'hostile mutations rejected']) {
    if (!yarnPackageManagerPlan.includes(evidence)) {
      errors.push(`${yarnPackageManagerPlanPath} must preserve completed evidence: ${evidence}`)
    }
  }
}

if (planPaths.includes(explicitDocsDeploymentPlanPath)) {
  if (!fs.existsSync(toFsPath(packageJsonPath))) {
    errors.push(`${packageJsonPath} is required by ${explicitDocsDeploymentPlanPath}`)
  } else {
    const packageJson = JSON.parse(fs.readFileSync(toFsPath(packageJsonPath), 'utf8'))
    for (const lifecycleHook of ['prepublish', 'publish', 'postpublish']) {
      if (Object.hasOwn(packageJson.scripts ?? {}, lifecycleHook)) {
        errors.push(`${packageJsonPath} must not define automatic ${lifecycleHook} deployment behavior`)
      }
    }
    if (packageJson.scripts?.prepack !== 'corepack yarn build') {
      errors.push(`${packageJsonPath} must preserve the reviewed prepack build`)
    }
    if (
      packageJson.scripts?.['docs:deploy'] !==
      'yarn docs:build && npx --yes surge@0.27.4 dist/docs --domain react-booking-selector.surge.sh'
    ) {
      errors.push(`${packageJsonPath} must preserve the explicit pinned documentation deployment command`)
    }
  }

  if (!fs.existsSync(toFsPath(packageRootTestPath))) {
    errors.push(`${packageRootTestPath} is required by ${explicitDocsDeploymentPlanPath}`)
  } else {
    const packageRootTest = fs.readFileSync(toFsPath(packageRootTestPath), 'utf8')
    for (const testContract of [
      "it('keeps documentation deployment explicit and separate from publishing'",
      'expect(packageJson.scripts.prepublish).toBeUndefined()',
      'expect(packageJson.scripts.publish).toBeUndefined()',
      'expect(packageJson.scripts.postpublish).toBeUndefined()',
      "expect(packageJson.scripts.prepack).toBe('corepack yarn build')",
      "expect(packageJson.scripts['docs:deploy']).toBe(",
      'npx --yes surge@0.27.4 dist/docs --domain react-booking-selector.surge.sh',
    ]) {
      if (!packageRootTest.includes(testContract)) {
        errors.push(`${packageRootTestPath} must preserve release separation contract: ${testContract}`)
      }
    }
  }

  for (const [documentPath, fragment] of [
    ['README.md', 'Package publication and documentation deployment are separate maintainer'],
    ['SECURITY.md', 'Package publication has no deployment lifecycle hook.'],
    ['VISION.md', 'Keep package publication separate from explicit documentation deployment'],
    ['CHANGES.md', 'Removed automatic documentation deployment from the package publish lifecycle'],
  ]) {
    if (!fs.existsSync(toFsPath(documentPath))) {
      errors.push(`${documentPath} is required by ${explicitDocsDeploymentPlanPath}`)
    } else if (!fs.readFileSync(toFsPath(documentPath), 'utf8').includes(fragment)) {
      errors.push(`${documentPath} must document explicit release and deployment separation`)
    }
  }

  const explicitDocsDeploymentPlan = fs.readFileSync(toFsPath(explicitDocsDeploymentPlanPath), 'utf8')
  for (const evidence of [
    '## Status: Completed',
    'focused package-root and docs-plan tests passed',
    'Node 20',
    'Node 24',
    'Node 16',
    'hostile mutations were rejected',
    '`git diff --check`',
  ]) {
    if (!explicitDocsDeploymentPlan.includes(evidence)) {
      errors.push(`${explicitDocsDeploymentPlanPath} must preserve completed evidence: ${evidence}`)
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(`Docs plan check passed for ${planPaths.length} plan(s).\n`)
