import { execFileSync } from 'child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const scriptPath = path.join(process.cwd(), 'scripts/check-docs-plan.js')
const baselinePlanPath = path.join('docs', 'plans', '2026-06-08-react-booking-selector-baseline.md')

const completedPlan = (title) => `# ${title}

## Status: Completed

## Verification

- corepack yarn verify
- make check
`

const createTempProject = () => {
  const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-docs-check-'))
  mkdirSync(path.join(projectPath, 'docs', 'plans'), { recursive: true })
  return projectPath
}

const writePlan = (projectPath, planPath, contents) => {
  writeFileSync(path.join(projectPath, planPath), contents)
}

const runDocsCheck = (projectPath) =>
  execFileSync(process.execPath, [scriptPath], {
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
    writePlan(projectPath, path.join('docs', 'plans', '2026-06-08-extra-plan.md'), completedPlan('Extra Plan'))
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    expect(runDocsCheck(projectPath)).toBe('Docs plan check passed for 2 plan(s).\n')
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
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tyarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${baselinePlanPath} must record Status: Completed`)
    expect(stderr).toContain(`${baselinePlanPath} must record corepack yarn verify`)
    expect(stderr).toContain(`${baselinePlanPath} must record make check`)
    expect(stderr).toContain('Makefile must expose corepack yarn verify')
  })
})
