import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const scriptPath = path.join(process.cwd(), 'scripts/smoke-docs.js')

const fakeChromeScript = `#!/usr/bin/env node
'use strict'

const fs = require('fs')
const http = require('http')
const zlib = require('zlib')

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const createChunk = (type, data) => {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  return Buffer.concat([length, Buffer.from(type), data, Buffer.alloc(4)])
}

const createPng = (width, height, blank = false, complete = true) => {
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

  const chunks = [pngSignature, createChunk('IHDR', ihdr), createChunk('IDAT', zlib.deflateSync(Buffer.concat(rows)))]
  if (complete) chunks.push(createChunk('IEND', Buffer.alloc(0)))
  return Buffer.concat(chunks)
}

const writePng = (filePath, width, height, blank = false) => {
  fs.writeFileSync(filePath, createPng(width, height, blank))
}

const writeIncompletePng = (filePath, width, height) => {
  fs.writeFileSync(filePath, createPng(width, height, false, false))
}

const args = process.argv.slice(2)

const requestSmokePath = (targetUrl, callback) => {
  const requestPath = process.env.FAKE_CHROME_REQUEST_PATH
  if (!requestPath) {
    callback()
    return
  }

  const expectedStatus = Number(process.env.FAKE_CHROME_EXPECT_STATUS || 200)
  http
    .get(new URL(requestPath, targetUrl), (response) => {
      response.resume()
      response.on('end', () => {
        if (response.statusCode !== expectedStatus) {
          process.stderr.write('Expected smoke server status ' + expectedStatus + ', received ' + response.statusCode)
          process.exit(1)
        }
        callback()
      })
    })
    .on('error', (error) => {
      process.stderr.write(error.message)
      process.exit(1)
    })
}

if (args.includes('--version')) {
  process.stdout.write('Fake Chrome 1.0\\n')
  process.exit(0)
}

const screenshotArg = args.find((arg) => arg.startsWith('--screenshot='))
if (screenshotArg) {
  const windowSizeArg = args.find((arg) => arg.startsWith('--window-size='))
  const [width, height] = windowSizeArg.replace('--window-size=', '').split(',').map(Number)
  requestSmokePath(args[args.length - 1], () => {
    const screenshotPath = screenshotArg.replace('--screenshot=', '')
    if (process.env.FAKE_CHROME_INCOMPLETE_SCREENSHOTS === '1') {
      writeIncompletePng(screenshotPath, width, height)
    } else {
      writePng(screenshotPath, width, height, process.env.FAKE_CHROME_BLANK_SCREENSHOTS === '1')
    }
    process.exit(0)
  })
}

if (args.includes('--dump-dom')) {
  requestSmokePath(args[args.length - 1], () => {
    const targetUrl = new URL(args[args.length - 1])
    if (targetUrl.pathname === '/__smoke__/layout.html') {
      const windowSizeArg = args.find((arg) => arg.startsWith('--window-size='))
      const [width] = windowSizeArg.replace('--window-size=', '').split(',').map(Number)
      const layout = {
        status: 'ok',
        viewportWidth: width,
        rootClientWidth: width,
        rootScrollWidth: process.env.FAKE_CHROME_LAYOUT_OVERFLOW === '1' ? width + 20 : width,
        bodyClientWidth: width,
        bodyScrollWidth: width,
        buttonCount: 70,
        minCellLeft: 0,
        maxCellRight: width,
      }
      if (process.env.FAKE_CHROME_LAYOUT_MISSING_METRIC === '1') {
        delete layout.maxCellRight
      }
      process.stdout.write(
        '<!doctype html><html><body><pre id="layout-result">' +
          JSON.stringify(layout) +
          '</pre></body></html>',
      )
      process.exit(0)
    }

    const buttons = [
      '<button aria-label="Available Monday, April 6, 2020 at 8 am"></button>',
      '<button aria-label="Blocked Wednesday, April 8, 2020 at 10 am"></button>',
      ...Array.from({ length: 68 }, () => '<button></button>'),
    ].join('')
    process.stdout.write(
      '<!doctype html><html><head><title>React Booking Selector</title></head><body><main>' +
        '<p id="booking-selector-demo-status" role="status">0 selected - 3 blocked</p>' +
        '<div role="group" aria-describedby="booking-selector-demo-status" aria-label="Booking time slots">' +
        buttons +
        '</div>' +
        '<a aria-label="GitHub repository, opens in a new tab" href="https://github.com/garethpaul/react-booking-selector" rel="noopener noreferrer" target="_blank">GitHub</a>' +
        '</main></body></html>',
    )
    process.exit(0)
  })
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
    expect(existsSync(path.join(screenshotDirectory[1], 'desktop.png'))).toBe(true)
    expect(existsSync(path.join(screenshotDirectory[1], 'mobile.png'))).toBe(true)
    expect(existsSync(path.join(screenshotDirectory[1], 'small-mobile.png'))).toBe(true)
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

  it('fails clearly when screenshots are incomplete PNG files', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    expect(() => {
      runSmoke(projectPath, fakeChromePath, { FAKE_CHROME_INCOMPLETE_SCREENSHOTS: '1' })
    }).toThrow(/desktop\.png is missing PNG terminator/u)
  })

  it('fails when a checked viewport has horizontal layout overflow', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    expect(() => {
      runSmoke(projectPath, fakeChromePath, { FAKE_CHROME_LAYOUT_OVERFLOW: '1' })
    }).toThrow(/desktop layout has horizontal overflow/u)
  })

  it('fails when the layout smoke result is missing a metric', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    expect(() => {
      runSmoke(projectPath, fakeChromePath, { FAKE_CHROME_LAYOUT_MISSING_METRIC: '1' })
    }).toThrow(/desktop layout metric maxCellRight is not a finite number/u)
  })

  it('handles malformed docs server request paths', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    const output = runSmoke(projectPath, fakeChromePath, {
      FAKE_CHROME_EXPECT_STATUS: '400',
      FAKE_CHROME_REQUEST_PATH: '/%E0%A4%A',
    })

    expect(output).toContain('Docs smoke passed. Screenshots:')
  })

  it('handles decoded null bytes in docs server request paths', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    const output = runSmoke(projectPath, fakeChromePath, {
      FAKE_CHROME_EXPECT_STATUS: '400',
      FAKE_CHROME_REQUEST_PATH: '/%00',
    })

    expect(output).toContain('Docs smoke passed. Screenshots:')
  })

  it('blocks encoded traversal outside the docs root', () => {
    const projectPath = createTempProject()
    tempPaths.push(projectPath)
    const fakeChromePath = writeFakeChrome(projectPath)

    const output = runSmoke(projectPath, fakeChromePath, {
      FAKE_CHROME_EXPECT_STATUS: '403',
      FAKE_CHROME_REQUEST_PATH: '/..%2fpackage.json',
    })

    expect(output).toContain('Docs smoke passed. Screenshots:')
  })
})
