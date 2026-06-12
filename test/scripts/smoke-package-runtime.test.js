import { execFileSync } from 'child_process'
import path from 'path'

it('loads both package entry modes in the active Node runtime', () => {
  const output = execFileSync(process.execPath, [path.join(process.cwd(), 'scripts/smoke-package-runtime.js')], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  expect(output).toBe(`Package runtime smoke passed on ${process.version}.\n`)
})
