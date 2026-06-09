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

const writeReadme = (projectPath, planPaths) => {
  writeFileSync(path.join(projectPath, 'README.md'), planPaths.map((planPath) => `See ${planPath}.`).join('\n'))
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
    const extraPlanPath = path.join('docs', 'plans', '2026-06-08-extra-plan.md')
    const leapDayPlanPath = path.join('docs', 'plans', '2024-02-29-leap-day-plan.md')
    writePlan(projectPath, extraPlanPath, completedPlan('Extra Plan'))
    writePlan(projectPath, leapDayPlanPath, completedPlan('Leap Day Plan'))
    writeReadme(projectPath, [baselinePlanPath, extraPlanPath, leapDayPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    expect(runDocsCheck(projectPath)).toBe('Docs plan check passed for 3 plan(s).\n')
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
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain('docs/plans must contain completed plan markdown files')
    expect(stderr).toContain(`${baselinePlanPath} is missing`)
  })

  it('reports when the canonical baseline plan is missing', () => {
    const projectPath = createTempProject()
    tempProjects.push(projectPath)
    const extraPlanPath = path.join('docs', 'plans', '2026-06-08-extra-plan.md')
    writePlan(projectPath, extraPlanPath, completedPlan('Extra Plan'))
    writeReadme(projectPath, [extraPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`${baselinePlanPath} is missing`)
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
    const undatedPlanPath = path.join('docs', 'plans', 'undated-plan.md')
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
    const impossibleMonthPlanPath = path.join('docs', 'plans', '2026-13-01-impossible-month.md')
    const impossibleDayPlanPath = path.join('docs', 'plans', '2026-02-29-impossible-day.md')
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
    const missingPlanPath = path.join('docs', 'plans', '2026-06-09-missing-plan.md')
    writePlan(projectPath, baselinePlanPath, completedPlan('Baseline Plan'))
    writeReadme(projectPath, [baselinePlanPath, missingPlanPath])
    writeFileSync(path.join(projectPath, 'Makefile'), 'verify:\n\tcorepack yarn verify\n')

    const stderr = runDocsCheckFailure(projectPath)

    expect(stderr).toContain(`README.md references missing plan ${missingPlanPath}`)
  })
})
