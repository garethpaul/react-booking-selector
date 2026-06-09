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
  {
    name: 'small-mobile',
    width: 320,
    height: 568,
    filePath: path.join(outputDir, 'small-mobile.png'),
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
const layoutCheckPath = '/__smoke__/layout.html'
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
  'aria-label="GitHub repository, opens in a new tab"',
  'href="https://github.com/garethpaul/react-booking-selector"',
  'rel="noopener noreferrer"',
  'target="_blank"',
  '0 selected - 3 blocked',
]
const chromeTimeoutMs = 30000

const sendResponse = (response, statusCode, body) => {
  response.writeHead(statusCode, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(body)
}

const createLayoutCheckHtml = (targetPath = '/') => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Docs Layout Smoke</title>
    <style>
      html,
      body,
      iframe {
        width: 100%;
        height: 100%;
        margin: 0;
        border: 0;
      }
    </style>
  </head>
  <body>
    <pre id="layout-result">pending</pre>
    <iframe id="docs-frame"></iframe>
    <script>
      const result = document.getElementById('layout-result')
      const frame = document.getElementById('docs-frame')
      const writeResult = (payload) => {
        result.textContent = JSON.stringify(payload)
      }
      const measureLayout = () => {
        try {
          const doc = frame.contentDocument
          const root = doc.documentElement
          const body = doc.body
          const viewportWidth = frame.contentWindow.innerWidth
          const slotCells = Array.from(doc.querySelectorAll('button.rgdp__grid-cell'))
          const cellBounds = slotCells.map((cell) => cell.getBoundingClientRect())
          const maxCellRight = cellBounds.reduce((maxRight, rect) => Math.max(maxRight, rect.right), 0)
          const minCellLeft = cellBounds.reduce((minLeft, rect) => Math.min(minLeft, rect.left), viewportWidth)
          writeResult({
            status: 'ok',
            viewportWidth,
            rootClientWidth: root.clientWidth,
            rootScrollWidth: root.scrollWidth,
            bodyClientWidth: body ? body.clientWidth : 0,
            bodyScrollWidth: body ? body.scrollWidth : 0,
            buttonCount: slotCells.length,
            minCellLeft,
            maxCellRight,
          })
        } catch (error) {
          writeResult({ status: 'error', message: error.message })
        }
      }
      frame.addEventListener('load', () => {
        setTimeout(measureLayout, 0)
      })
      frame.src = '${targetPath}'
      setTimeout(() => {
        if (result.textContent === 'pending') {
          writeResult({ status: 'error', message: 'Timed out waiting for docs layout' })
        }
      }, 3000)
    </script>
  </body>
</html>`

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
    if (pathname === layoutCheckPath) {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      response.end(createLayoutCheckHtml('/'))
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
  let hasHeader = false
  let hasTerminator = false
  const idatChunks = []

  while (offset < png.length) {
    if (offset + 12 > png.length) {
      throw new Error(`${filePath} has a truncated PNG chunk header`)
    }
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    if (dataEnd + 4 > png.length) {
      throw new Error(`${filePath} has a truncated ${type} PNG chunk`)
    }
    const data = png.subarray(dataStart, dataEnd)

    if (type === 'IHDR') {
      if (length < 13) throw new Error(`${filePath} has a truncated PNG header`)
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      hasHeader = true
    } else if (type === 'IDAT') {
      idatChunks.push(data)
    } else if (type === 'IEND') {
      hasTerminator = true
      break
    }

    offset = dataEnd + 4
  }

  if (!hasHeader) throw new Error(`${filePath} is missing PNG header`)
  if (!hasTerminator) throw new Error(`${filePath} is missing PNG terminator`)
  if (width <= 0 || height <= 0) throw new Error(`${filePath} has invalid PNG dimensions ${width}x${height}`)
  if (idatChunks.length === 0) throw new Error(`${filePath} is missing PNG image data`)
  if (bitDepth !== 8) throw new Error(`${filePath} uses unsupported PNG bit depth ${bitDepth}`)
  const bytesPerPixel = getBytesPerPixel(colorType)
  const stride = width * bytesPerPixel
  let inflated
  try {
    inflated = zlib.inflateSync(Buffer.concat(idatChunks))
  } catch (error) {
    throw new Error(`${filePath} has invalid PNG image data: ${error.message}`)
  }
  const expectedInflatedLength = height * (stride + 1)
  if (inflated.length !== expectedInflatedLength) {
    throw new Error(`${filePath} has ${inflated.length} decoded PNG bytes, expected ${expectedInflatedLength}`)
  }
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

const decodeHtmlText = (value) =>
  value
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&amp;/gu, '&')

const parseLayoutResult = (dom) => {
  const resultMatch = dom.match(/<pre id="layout-result">([\s\S]*?)<\/pre>/u)
  if (!resultMatch) throw new Error('Docs layout smoke result is missing')

  try {
    return JSON.parse(decodeHtmlText(resultMatch[1].trim()))
  } catch (error) {
    throw new Error(`Docs layout smoke result is invalid JSON: ${error.message}`)
  }
}

const assertLayout = (screenshot, dom) => {
  const layout = parseLayoutResult(dom)
  if (layout.status !== 'ok') {
    throw new Error(`${screenshot.name} layout smoke failed: ${layout.message || 'unknown error'}`)
  }
  if (layout.viewportWidth > screenshot.width || layout.viewportWidth < screenshot.width - 40) {
    throw new Error(
      `${screenshot.name} layout viewport is ${layout.viewportWidth}px, expected near ${screenshot.width}px`,
    )
  }
  if (layout.buttonCount !== 70) {
    throw new Error(`${screenshot.name} layout expected 70 booking slot buttons, found ${layout.buttonCount}`)
  }

  const maxDocumentWidth = Math.max(layout.rootScrollWidth, layout.bodyScrollWidth)
  const maxClientWidth = Math.max(layout.rootClientWidth, layout.bodyClientWidth)
  if (maxDocumentWidth > maxClientWidth + 1) {
    throw new Error(
      `${screenshot.name} layout has horizontal overflow: scroll width ${maxDocumentWidth}px, client width ${maxClientWidth}px`,
    )
  }
  if (layout.minCellLeft < -1 || layout.maxCellRight > layout.viewportWidth + 1) {
    throw new Error(
      `${screenshot.name} slot cells leave the viewport: left ${layout.minCellLeft}px, right ${layout.maxCellRight}px`,
    )
  }
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

    for (const screenshot of screenshots) {
      const layoutDom = await runChrome(chrome, [
        `--window-size=${screenshot.width},${screenshot.height}`,
        '--virtual-time-budget=5000',
        '--dump-dom',
        `${url}${layoutCheckPath}`,
      ])
      assertLayout(screenshot, layoutDom)
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
