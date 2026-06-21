import { execFileSync } from 'child_process'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const scriptPath = path.join(process.cwd(), 'scripts/check-docs-plan.js')
const planDir = 'docs/plans'
const baselinePlanPath = `${planDir}/2026-06-08-react-booking-selector-baseline.md`
const ciPlanPath = `${planDir}/2026-06-10-hosted-verification.md`
const homeEndPlanPath = `${planDir}/2026-06-13-home-end-keyboard-navigation.md`
const yarnPackageManagerPlanPath = `${planDir}/2026-06-15-yarn-4-package-manager.md`
const ciWorkflowPath = '.github/workflows/check.yml'
const codeownersPath = '.github/CODEOWNERS'
const packageJsonPath = 'package.json'
const yarnConfigPath = '.yarnrc.yml'

const hostedWorkflow = `name: Check

on:
  push:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  node16-runtime:
    name: Node 16 package runtime
    runs-on: ubuntu-24.04
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10
        with:
          persist-credentials: false
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e
        with:
          node-version: 20.x
      - run: corepack enable
      - run: corepack yarn install --immutable --mode=skip-build
      - run: |
          corepack yarn lib:build
          package_file="$(npm pack --ignore-scripts --silent)"
          mkdir .node16-package
          tar -xzf "$package_file" --strip-components=1 -C .node16-package
          rm "$package_file"
      - run: docker run --rm --network none -v "$PWD:/workspace:ro" -w /workspace/.node16-package node:16.20.2-bullseye@sha256:cd59a61258b82b86c1ff0ead50c8a689f6c3483c5ed21036e11ee741add419eb node ../scripts/smoke-package-runtime.js
  node:
    runs-on: ubuntu-24.04
    timeout-minutes: 20
    strategy:
      matrix:
        node: [20.x, 24.x]
    concurrency:
      cancel-in-progress: true
    steps:
      - uses: actions/checkout@df4cb1c069e1874edd31b4311f1884172cec0e10
        with:
          persist-credentials: false
      - uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e
      - run: corepack enable
      - run: corepack yarn install --immutable --mode=skip-build
      - run: make check
      - run: make build
      - run: git diff --exit-code -- dist
`

const completedPlan = (title) => `# ${title}

## Status: Completed

## Verification

- corepack yarn verify
- make check
`

const rootedMakefile = `.DEFAULT_GOAL := check

.PHONY: build check lint root-test test verify

ifneq ($(origin MAKEFILE_LIST),file)
$(error MAKEFILE_LIST must not be overridden)
endif
override REPO_ROOT := $(shell path='$(subst ','"'"',$(MAKEFILE_LIST))'; path=$$(printf '%s' "$$path" | /bin/sed 's/^ //'); directory=$$(/usr/bin/dirname -- "$$path"); CDPATH= cd -- "$$directory" && /bin/pwd -P)

check: verify

lint:
	cd "$(REPO_ROOT)" && corepack yarn lint

test:
	cd "$(REPO_ROOT)" && corepack yarn test

build:
	cd "$(REPO_ROOT)" && corepack yarn build

root-test:
	cd "$(REPO_ROOT)" && scripts/test-makefile-root.sh

verify: root-test
	cd "$(REPO_ROOT)" && corepack yarn verify
`

const createTempProject = ({ withHostedVerification = true } = {}) => {
  const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-docs-check-'))
  mkdirSync(path.join(projectPath, ...planDir.split('/')), { recursive: true })
  if (withHostedVerification) writeHostedVerification(projectPath)
  return projectPath
}

const writePlan = (projectPath, planPath, contents) => {
  writeFileSync(path.join(projectPath, ...planPath.split('/')), contents)
}

const writeReadme = (projectPath, planPaths) => {
  const referencedPlans = [...planPaths]
  if (existsSync(path.join(projectPath, ...ciPlanPath.split('/'))) && !referencedPlans.includes(ciPlanPath)) {
    referencedPlans.push(ciPlanPath)
  }
  writeFileSync(path.join(projectPath, 'README.md'), referencedPlans.map((planPath) => `See ${planPath}.`).join('\n'))
}

const writeHostedVerification = (projectPath, workflow = hostedWorkflow, codeowners = '* @garethpaul\n') => {
  writePlan(projectPath, ciPlanPath, completedPlan('Hosted Verification'))
  mkdirSync(path.join(projectPath, '.github', 'workflows'), { recursive: true })
  writeFileSync(path.join(projectPath, ...ciWorkflowPath.split('/')), workflow)
  writeFileSync(path.join(projectPath, ...codeownersPath.split('/')), codeowners)
}

const writeYarnPackageManagerBoundary = (projectPath, overrides = {}) => {
  const packageJson = {
    packageManager: 'yarn@4.17.0',
    engines: { node: '>=16.0' },
    resolutions: { 'js-yaml': '4.2.0' },
    scripts: { verify: 'yarn npm audit --all --recursive --severity high' },
    ...overrides,
  }
  writeFileSync(path.join(projectPath, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`)
  writeFileSync(path.join(projectPath, '.yarnrc.yml'), 'nodeLinker: node-modules\n')
}

const writeWin32PathPreload = (projectPath) => {
  const preloadPath = path.join(projectPath, 'mock-win32-path.js')
  writeFileSync(
    preloadPath,
    `const Module = require('node:module')
const nativeFs = require('node:fs')
const win32Path = require('node:path').win32

const normalizePath = (value) => (typeof value === 'string' ? value.replace(/\\\\/g, '/') : value)
const fsProxy = new Proxy(nativeFs, {
  get(target, property) {
    const value = target[property]
    if (['existsSync', 'statSync', 'readdirSync', 'readFileSync'].includes(property)) {
      return (filePath, ...args) => value.call(target, normalizePath(filePath), ...args)
    }
    return value
  },
})
const originalLoad = Module._load

Module._load = function load(request, parent, isMain) {
  if (request === 'node:fs' || request === 'fs') return fsProxy
  if (request === 'node:path' || request === 'path') return win32Path
  return originalLoad.call(this, request, parent, isMain)
}
`,
  )
  return preloadPath
}

const runDocsCheck = (projectPath, nodeArgs = []) =>
  execFileSync(process.execPath, [...nodeArgs, scriptPath], {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

const runDocsCheckFailure = (projectPath) => {
  try {
    runDocsCheck(projectPath)
  } catch (error) {
    return error.stderr.toString()
  }
  throw new Error('Expected docs plan check to fail')
}

describe('check-docs-plan script', () => {
  const tempProjects = []

  afterEach(() => {
    while (tempProjects.length > 0) {
      rmSync(tempProjects.pop(), { force: true, recursive: true })
    }
  })

  it('passes when every docs plan is completed and records verification commands', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    const extraPlanPath = `${planDir}/2026-06-08-extra-plan.md`
    const leapDayPlanPath = `${planDir}/2024-02-29-leap-day-plan.md`
    writePlan(projectPath, extraPlanPath, completedPlan('Extra Plan'))
    writePlan(projectPath, leapDayPlanPath, completedPlan('Leap Day Plan'))
    writeReadme(projectPath, [baselinePlanPath, extraPlanPath, leapDayPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)

    expect(runDocsCheck(projectPath)).toBe('Docs plan check passed for 4 plan(s).\n')
  })

  it('passes when hosted verification is credential-free and applies to every ref', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeHostedVerification(projectPath)
    writeReadme(projectPath, [baselinePlanPath, ciPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)

    expect(runDocsCheck(projectPath)).toBe('Docs plan check passed for 2 plan(s).\n')
  })

  it('passes with the pinned Yarn 4 package-manager and Node 16 artifact boundary', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writePlan(
      projectPath,
      yarnPackageManagerPlanPath,
      `${completedPlan('Yarn 4 Package Manager')}\nNode 20\nNode 24\nNode 16\nhostile mutations rejected\n`,
    )
    writeYarnPackageManagerBoundary(projectPath)
    writeReadme(projectPath, [baselinePlanPath, yarnPackageManagerPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)

    expect(runDocsCheck(projectPath)).toBe('Docs plan check passed for 3 plan(s).\n')
  })

  it('rejects weakened Yarn 4 package-manager and runtime-boundary contracts', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writePlan(projectPath, yarnPackageManagerPlanPath, completedPlan('Yarn 4 Package Manager'))
    writeYarnPackageManagerBoundary(projectPath, {
      packageManager: 'yarn@1.22.22',
      engines: { node: '>=20.0' },
      resolutions: { 'js-yaml': '3.14.2' },
      scripts: { verify: 'yarn audit' },
    })
    writeFileSync(path.join(projectPath, '.yarnrc.yml'), 'nodeLinker: pnp\n')
    writeHostedVerification(
      projectPath,
      hostedWorkflow
        .replace(' --immutable --mode=skip-build', ' --mode=skip-build')
        .replace(' --network none', '')
        .replace('npm pack --ignore-scripts', 'npm pack'),
    )
    writeReadme(projectPath, [baselinePlanPath, yarnPackageManagerPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${ciWorkflowPath} must include corepack yarn install --immutable --mode=skip-build`)
    expect(stderr).toContain(`${ciWorkflowPath} must include package_file="$(npm pack --ignore-scripts --silent)"`)
    expect(stderr).toContain(`${ciWorkflowPath} must include docker run --rm --network none`)
    expect(stderr).toContain(`${packageJsonPath} must pin packageManager to yarn@4.17.0`)
    expect(stderr).toContain(`${packageJsonPath} verify must run the Yarn 4 recursive high-severity audit`)
    expect(stderr).toContain(`${packageJsonPath} must pin patched js-yaml 4.2.0 across legacy coverage tooling`)
    expect(stderr).toContain(`${packageJsonPath} must preserve the published Node >=16.0 runtime floor`)
    expect(stderr).toContain(`${yarnConfigPath} must preserve the node-modules linker`)
    expect(stderr).toContain(`${yarnPackageManagerPlanPath} must preserve completed evidence: Node 20`)
  })

  it('rejects weakened hosted workflow and ownership policy', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeHostedVerification(
      projectPath,
      hostedWorkflow
        .replace('  push:\n', '  push:\n    branches: [master]\n    paths: [src/**]\n')
        .replace('  workflow_dispatch:\n', '')
        .replace('          persist-credentials: false\n', '')
        .replace('  contents: read\n', '  contents: write\n')
        .replace('    runs-on: ubuntu-24.04\n', '    runs-on: ubuntu-24.04\n    if: false\n'),
      '* @someone-else\n',
    )
    writeFileSync(path.join(projectPath, '.github', 'workflows', 'extra.yml'), 'name: Extra\n')
    writeReadme(projectPath, [baselinePlanPath, ciPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain('.github/workflows must contain only check.yml')
    expect(stderr).toContain(`${ciWorkflowPath} must validate every pushed branch and pull request`)
    expect(stderr).toContain(`${ciWorkflowPath} must include workflow_dispatch:`)
    expect(stderr).toContain(`${ciWorkflowPath} must include persist-credentials: false`)
    expect(stderr).toContain(`${ciWorkflowPath} must not grant write permissions`)
    expect(stderr).toContain(`${ciWorkflowPath} must not conditionally skip verification`)
    expect(stderr).toContain(`${codeownersPath} must assign all paths to @garethpaul`)
  })

  it('matches README links against slash-separated plan paths when native paths use backslashes', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeReadme(projectPath, [baselinePlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), rootedMakefile)
    const preloadPath = writeWin32PathPreload(projectPath)

    expect(runDocsCheck(projectPath, ['--require', preloadPath])).toBe('Docs plan check passed for 2 plan(s).\n')
  })

  it('reports missing status, command, and Makefile requirements', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(
      projectPath,
      baselinePlanPath,
      `# Baseline Plan

## Status: Draft

## Verification

      - corepack yarn test
`,
    )
    writeReadme(projectPath, [baselinePlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tyarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${baselinePlanPath} must record Status: Completed`)
    expect(stderr).toContain(`${baselinePlanPath} must record corepack yarn verify`)
    expect(stderr).toContain(`${baselinePlanPath} must record make check`)
    expect(stderr).toContain('Makefile must expose corepack yarn verify')
  })

  it('reports when no completed plan markdown files exist', () => {
    const projectPath = createTempProject({ withHostedVerification: false })
    tempProjects.push(projectPath)
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain('docs/plans must contain completed plan markdown files')
    expect(stderr).toContain(`${baselinePlanPath} is missing`)
    expect(stderr).toContain(`${ciPlanPath} is missing`)
  })

  it('reports when the docs plan path is not a directory', () => {
    const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-docs-check-'))
    tempProjects.push(projectPath)
    mkdirSync(path.join(projectPath, 'docs'), { recursive: true })
    writeFileSync(path.join(projectPath, 'docs', 'plans'), 'not a directory')
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain('docs/plans must be a directory')
    expect(stderr).toContain('docs/plans must contain completed plan markdown files')
    expect(stderr).toContain(`${baselinePlanPath} is missing`)
  })

  it('reports when the canonical baseline plan is missing', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    const extraPlanPath = `${planDir}/2026-06-08-extra-plan.md`
    writePlan(projectPath, extraPlanPath, completedPlan('Extra Plan'))
    writeReadme(projectPath, [extraPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${baselinePlanPath} is missing`)
  })

  it('reports when the hosted verification plan is missing', () => {
    const projectPath = createTempProject({ withHostedVerification: false })
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeReadme(projectPath, [baselinePlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${ciPlanPath} is missing`)
  })

  it('reports when README does not reference a docs plan', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeFileSync(path.join(projectPath, 'README.md'), 'No maintenance links yet.\n')
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`README.md must reference ${baselinePlanPath}`)
  })

  it('reports docs plans without dated filenames', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    const undatedPlanPath = `${planDir}/undated-plan.md`
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writePlan(projectPath, undatedPlanPath, completedPlan('Undated Plan'))
    writeReadme(projectPath, [baselinePlanPath, undatedPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${undatedPlanPath} must use a valid YYYY-MM-DD descriptive filename`)
  })

  it('reports docs plans with impossible calendar dates', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    const impossibleMonthPlanPath = `${planDir}/2026-13-01-impossible-month.md`
    const impossibleDayPlanPath = `${planDir}/2026-02-29-impossible-day.md`
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writePlan(projectPath, impossibleMonthPlanPath, completedPlan('Impossible Month Plan'))
    writePlan(projectPath, impossibleDayPlanPath, completedPlan('Impossible Day Plan'))
    writeReadme(projectPath, [baselinePlanPath, impossibleMonthPlanPath, impossibleDayPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${impossibleMonthPlanPath} must use a valid YYYY-MM-DD descriptive filename`)
    expect(stderr).toContain(`${impossibleDayPlanPath} must use a valid YYYY-MM-DD descriptive filename`)
  })

  it('reports README references to missing docs plans', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    const missingPlanPath = `${planDir}/2026-06-09-missing-plan.md`
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeReadme(projectPath, [baselinePlanPath, missingPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`README.md references missing plan ${missingPlanPath}`)
  })

  it('reports duplicate README docs plan references', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeReadme(projectPath, [baselinePlanPath, baselinePlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`README.md must reference ${baselinePlanPath} once, found 2`)
  })

  it('reports missing Home and End keyboard implementation contracts', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writePlan(projectPath, homeEndPlanPath, completedPlan('Home and End Navigation'))
    writeReadme(projectPath, [baselinePlanPath, homeEndPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')
    mkdirSync(path.join(projectPath, 'src', 'lib'), { recursive: true })
    mkdirSync(path.join(projectPath, 'test', 'lib'), { recursive: true })
    writeFileSync(
      path.join(projectPath, 'src', 'lib', 'BookingSelector.js'),
      'export default class BookingSelector {}\n',
    )
    writeFileSync(path.join(projectPath, 'test', 'lib', 'BookingSelector.test.js'), "it('placeholder', () => {})\n")

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain("src/lib/BookingSelector.js must preserve key === 'Home'")
    expect(stderr).toContain('src/lib/BookingSelector.js must preserve getGridEdgeKeyboardNavigationTarget')
    expect(stderr).toContain('test/lib/BookingSelector.test.js must preserve moves to row edges with Home and End')
  })
})
