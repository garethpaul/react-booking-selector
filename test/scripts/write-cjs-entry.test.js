import { execFileSync } from 'child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const scriptPath = path.join(process.cwd(), 'scripts/write-cjs-entry.js')

describe('write-cjs-entry script', () => {
  const tempProjects = []

  afterEach(() => {
    while (tempProjects.length > 0) {
      rmSync(tempProjects.pop(), { force: true, recursive: true })
    }
  })

  it('writes the CommonJS package entry wrapper', () => {
    const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-cjs-entry-'))
    tempProjects.push(projectPath)
    mkdirSync(path.join(projectPath, 'dist', 'lib'), { recursive: true })

    execFileSync(process.execPath, [scriptPath], { cwd: projectPath })

    expect(readFileSync(path.join(projectPath, 'dist', 'lib', 'index.js'), 'utf8')).toBe(`"use strict";

const BookingSelector = require("./BookingSelector.js").default;

module.exports = BookingSelector;
module.exports.BookingSelector = BookingSelector;
module.exports.default = BookingSelector;
module.exports.__esModule = true;
`)
  })

  it('creates the package entry output directory when needed', () => {
    const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-cjs-entry-'))
    tempProjects.push(projectPath)

    execFileSync(process.execPath, [scriptPath], { cwd: projectPath })

    expect(readFileSync(path.join(projectPath, 'dist', 'lib', 'index.js'), 'utf8')).toContain(
      'module.exports = BookingSelector;',
    )
  })
})
