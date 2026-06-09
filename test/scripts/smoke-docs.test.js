import { execFileSync } from 'child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const scriptPath = path.join(process.cwd(), 'scripts/smoke-docs.js')

const fakeChromeScript = `#!/usr/bin/env node
'use strict'

const fs = require('fs')
const zlib = require('zlib')

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const createChunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  return Buffer.concat([length, Buffer.from(type), data, Buffer.alloc(4)])
}

const writePng = (filePath, width, height, blank = false) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2

  const rows = []
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3)
    row[0] = 0
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 3
      row[offset] = blank ? 255 : x % 256
      row[offset + 1] = blank ? 255 : y % 256
      row[offset + 2] = blank ? 255 : (x + y) % 256
    }
    rows.push(row)
  }

  fs.writeFileSync(
    filePath,
    Buffer.concat([
      pngSignature,
      createChunk('IHDR', ihdr),
      createChunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
      createChunk('IEND', Buffer.alloc(0)),
    ]),
  )
}

const args = process.argv.slice(2)

if (args.includes('--version')) {
  process.stdout.write('Fake Chrome 1.0\\n')
  process.exit(0)
}

const screenshotArg = args.find((arg) => arg.startsWith('--screenshot='))
if (screenshotArg) {
  const windowSizeArg = args.find((arg) => arg.startsWith('--window-size='))
  const [width, height] = windowSizeArg.replace('--window-size=', '').split(',').map(Number)
  writePng(screenshotArg.replace('--screenshot=', ''), width, height, process.env.FAKE_CHROME_BLANK_SCREENSHOTS === '1')
  process.exit(0)
}

if (args.includes('--dump-dom')) {
  const buttons = Array.from({ length: 70 }, () => '<button></button>').join('')
  process.stdout.write(
    '<!doctype html><html><head><title>React Booking Selector</title></head><body><main>' +
      '<p id="booking-selector-demo-status" role="status">0 selected - 3 blocked</p>' +
      '<div role="group" aria-describedby="booking-selector-demo-status" aria-label="Booking time slots">' +
      buttons +
      '</div></main></body></html>',
  )
  process.exit(0)
}
`

const createTempProject = () => {
  const projectPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-docs-smoke-test-'))
  mkdirSync(path.join(projectPath, 'dist', 'docs'), { recursive: true })
  writeFileSync(path.join(projectPath, 'dist', 'docs', 'index.html'), '<div id="app"></div>')
  return projectPath
}

const writeFakeChrome = (projectPath) => {
  const fakeChromePath = path.join(projectPath, 'fake-chrome')
  writeFileSync(fakeChromePath, fakeChromeScript, { mode: 0o755 })
  return fakeChromePath
}

const runSmoke = (projectPath, fakeChromePath, env = {}) =>
  execFileSync(process.execPath, [scriptPath], {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      CHROME_BIN: fakeChromePath,
      TMPDIR: projectPath,
      ...env,
    },
  })

describe('smoke-docs script', () => {
  const tempPaths = []

  afterEach(() => {
    while (tempPaths.length > 0) {
      rmSync(tempPaths.pop(), { force: true, recursive: true })
    }
  })

  it('passes with a compatible Chrome binary', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    const output = runSmoke(projectPath, fakeChromePath)
    const screenshotDirectory = output.match(/Screenshots: (.+)\n/u)

    expect(screenshotDirectory).not.toBe(null)
    tempPaths.push(screenshotDirectory[1])
    expect(output).toContain('Docs smoke passed. Screenshots:')
  })

  it('fails when screenshots look blank', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    expect(() => {
      runSmoke(projectPath, fakeChromePath, { FAKE_CHROME_BLANK_SCREENSHOTS: '1' })
    }).toThrow(/desktop screenshot looks blank/u)
  })
})
