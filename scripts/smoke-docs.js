'use strict'

const childProcess = require('node:child_process')
const fs = require('node:fs')
const http = require('node:http')
const os = require('node:os')
const path = require('node:path')
const zlib = require('node:zlib')

const docsRoot = path.resolve(process.cwd(), 'dist/docs')
const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'react-booking-selector-docs-smoke-'))
const screenshots = [
  {
    name: 'desktop',
    width: 1440,
    height: 1200,
    filePath: path.join(outputDir, 'desktop.png'),
  },
  {
    name: 'mobile',
    width: 390,
    height: 844,
    filePath: path.join(outputDir, 'mobile.png'),
  },
]
const chromeCandidates = [
  process.env.CHROME_BIN,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
].filter(Boolean)
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
])
const expectedDomSnippets = [
  '<title>React Booking Selector</title>',
  '<main',
  'id="booking-selector-demo-status"',
  'role="status"',
  'role="group"',
  'aria-describedby="booking-selector-demo-status"',
  'aria-label="Booking time slots"',
  'aria-label="Available Monday, April 6, 2020 at 8 am"',
  'aria-label="Blocked Wednesday, April 8, 2020 at 10 am"',
  '0 selected - 3 blocked',
]
const chromeTimeoutMs = 30000

const sendResponse = (response, statusCode, body) => {
  response.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(body)
}

const isInsideDocsRoot = (filePath) => filePath === docsRoot || filePath.startsWith(`${docsRoot}${path.sep}`)

const createDocsServer = () =>
  http.createServer((request, response) => {
    let pathname
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1')
      pathname = decodeURIComponent(requestUrl.pathname)
    } catch {
      sendResponse(response, 400, 'Bad request')
      return
    }
    if (pathname.includes('\0')) {
      sendResponse(response, 400, 'Bad request')
      return
    }
    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    const filePath = path.resolve(docsRoot, relativePath)

    if (!isInsideDocsRoot(filePath)) {
      sendResponse(response, 403, 'Forbidden')
      return
    }

    fs.readFile(filePath, (error, contents) => {
      if (error) {
        sendResponse(response, error.code === 'ENOENT' ? 404 : 500, error.code || 'Read error')
        return
      }
      response.writeHead(200, {
        'content-type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream',
      })
      response.end(contents)
    })
  })

const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })

const findChrome = () => {
  for (const candidate of chromeCandidates) {
    const result = childProcess.spawnSync(candidate, ['--version'], { encoding: 'utf8' })
    if (!result.error && result.status === 0) return candidate
  }
  throw new Error(
    `No Chrome or Chromium binary found. Set CHROME_BIN or install one of: ${chromeCandidates
      .filter((candidate) => candidate !== process.env.CHROME_BIN)
      .join(', ')}`,
  )
}

const runChrome = (chrome, args) =>
  new Promise((resolve, reject) => {
    const chromeProcess = childProcess.spawn(chrome, ['--headless=new', '--disable-gpu', '--no-sandbox', ...args])
    let stdout = ''
    let stderr = ''
    let settled = false
    let timedOut = false
    let killTimeout = null

    const finish = (error, output = '') => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (killTimeout) clearTimeout(killTimeout)
      if (error) reject(error)
      else resolve(output)
    }
    const timeout = setTimeout(() => {
      timedOut = true
      chromeProcess.kill('SIGTERM')
      killTimeout = setTimeout(() => {
        chromeProcess.kill('SIGKILL')
      }, 1000)
    }, chromeTimeoutMs)

    chromeProcess.stdout.setEncoding('utf8')
    chromeProcess.stderr.setEncoding('utf8')
    chromeProcess.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    chromeProcess.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    chromeProcess.on('error', (error) => {
      finish(error)
    })
    chromeProcess.on('close', (status, signal) => {
      if (timedOut) {
        finish(new Error(`Chrome timed out after ${chromeTimeoutMs}ms`))
        return
      }
      if (status !== 0) {
        const detail = [stdout, stderr].filter(Boolean).join('\n')
        finish(new Error(`Chrome exited with ${signal || `status ${status}`}${detail ? `\n${detail}` : ''}`))
        return
      }
      finish(null, stdout)
    })
  })

const getBytesPerPixel = (colorType) => {
  if (colorType === 0) return 1
  if (colorType === 2) return 3
  if (colorType === 6) return 4
  throw new Error(`Unsupported PNG color type ${colorType}`)
}

const paethPredictor = (left, up, upLeft) => {
  const estimate = left + up - upLeft
  const leftDistance = Math.abs(estimate - left)
  const upDistance = Math.abs(estimate - up)
  const upLeftDistance = Math.abs(estimate - upLeft)

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left
  if (upDistance <= upLeftDistance) return up
  return upLeft
}

const parsePng = (filePath) => {
  const png = fs.readFileSync(filePath)
  if (!png.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${filePath} is not a PNG file`)
  }

  let offset = pngSignature.length
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  const idatChunks = []

  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    const data = png.subarray(dataStart, dataEnd)

    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
    } else if (type === 'IDAT') {
      idatChunks.push(data)
    } else if (type === 'IEND') {
      break
    }

    offset = dataEnd + 4
  }

  if (bitDepth !== 8) throw new Error(`${filePath} uses unsupported PNG bit depth ${bitDepth}`)
  const bytesPerPixel = getBytesPerPixel(colorType)
  const stride = width * bytesPerPixel
  const inflated = zlib.inflateSync(Buffer.concat(idatChunks))
  const pixels = Buffer.alloc(height * stride)
  let sourceOffset = 0
  let targetOffset = 0

  for (let y = 0; y < height; y += 1) {
    const filterType = inflated[sourceOffset]
    sourceOffset += 1
    const scanline = inflated.subarray(sourceOffset, sourceOffset + stride)
    sourceOffset += stride

    for (let x = 0; x < stride; x += 1) {
      const rawValue = scanline[x]
      const left = x >= bytesPerPixel ? pixels[targetOffset + x - bytesPerPixel] : 0
      const up = y > 0 ? pixels[targetOffset - stride + x] : 0
      const upLeft = y > 0 && x >= bytesPerPixel ? pixels[targetOffset - stride + x - bytesPerPixel] : 0
      let predictor = 0

      if (filterType === 1) predictor = left
      else if (filterType === 2) predictor = up
      else if (filterType === 3) predictor = Math.floor((left + up) / 2)
      else if (filterType === 4) predictor = paethPredictor(left, up, upLeft)
      else if (filterType !== 0) throw new Error(`${filePath} uses unsupported PNG filter ${filterType}`)

      pixels[targetOffset + x] = (rawValue + predictor) & 0xff
    }

    targetOffset += stride
  }

  return { width, height, pixels, bytesPerPixel }
}

const getDistinctPixelCount = ({ pixels, bytesPerPixel }) => {
  const distinctPixels = new Set()
  const totalPixels = pixels.length / bytesPerPixel
  const sampleEvery = Math.max(1, Math.floor(totalPixels / 50000))

  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += sampleEvery) {
    const offset = pixelIndex * bytesPerPixel
    const values = []
    for (let channel = 0; channel < bytesPerPixel; channel += 1) {
      values.push(pixels[offset + channel])
    }
    distinctPixels.add(values.join(','))
    if (distinctPixels.size >= 8) return distinctPixels.size
  }

  return distinctPixels.size
}

const assertScreenshot = (screenshot) => {
  const stats = fs.statSync(screenshot.filePath)
  if (stats.size < 1000) throw new Error(`${screenshot.name} screenshot is unexpectedly small`)

  const parsedPng = parsePng(screenshot.filePath)
  if (parsedPng.width !== screenshot.width || parsedPng.height !== screenshot.height) {
    throw new Error(
      `${screenshot.name} screenshot is ${parsedPng.width}x${parsedPng.height}, expected ${screenshot.width}x${screenshot.height}`,
    )
  }

  const distinctPixelCount = getDistinctPixelCount(parsedPng)
  if (distinctPixelCount < 8) {
    throw new Error(`${screenshot.name} screenshot looks blank; found ${distinctPixelCount} distinct sampled pixels`)
  }
}

const assertDom = (dom) => {
  expectedDomSnippets.forEach((snippet) => {
    if (!dom.includes(snippet)) throw new Error(`Docs DOM is missing expected content: ${snippet}`)
  })

  const buttonCount = (dom.match(/<button\b/gu) || []).length
  if (buttonCount !== 70) throw new Error(`Expected 70 booking slot buttons, found ${buttonCount}`)
}

const main = async () => {
  if (!fs.existsSync(path.join(docsRoot, 'index.html'))) {
    throw new Error('dist/docs/index.html is missing. Run corepack yarn docs:build before smoke-docs.js.')
  }

  const chrome = findChrome()
  const server = createDocsServer()
  const port = await listen(server)
  const url = `http://127.0.0.1:${port}`

  try {
    for (const screenshot of screenshots) {
      await runChrome(chrome, [
        `--window-size=${screenshot.width},${screenshot.height}`,
        `--screenshot=${screenshot.filePath}`,
        url,
      ])
      assertScreenshot(screenshot)
    }

    const dom = await runChrome(chrome, ['--dump-dom', url])
    assertDom(dom)
    process.stdout.write(`Docs smoke passed. Screenshots: ${outputDir}\n`)
  } finally {
    await close(server)
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exit(1)
})
