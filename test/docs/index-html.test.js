import { readFileSync } from 'fs'
import path from 'path'

const getDocsHtml = () => readFileSync(path.join(process.cwd(), 'src/docs/index.html'), 'utf8')

const getDocsDocument = () => {
  const docsDocument = document.implementation.createHTMLDocument('')
  docsDocument.documentElement.innerHTML = getDocsHtml()
  return docsDocument
}

const getProcessShimScript = () => getDocsDocument().querySelector('script').textContent

it('defines polished docs metadata', () => {
  const docsDocument = getDocsDocument()

  expect(docsDocument.title).toBe('React Booking Selector')
  expect(docsDocument.querySelector('meta[name="description"]').getAttribute('content')).toBe(
    'A grid-based booking selector.',
  )
})

it('initializes the docs process shim without clobbering existing globals', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const processGlobal = { browser: true }
  const windowGlobal = { process: processGlobal }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process).toBe(processGlobal)
  expect(windowGlobal.process.browser).toBe(true)
  expect(windowGlobal.process.env.NODE_ENV).toBe('production')
})

it('preserves an existing docs NODE_ENV value', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const windowGlobal = { process: { env: { NODE_ENV: 'development' } } }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process.env.NODE_ENV).toBe('development')
})

it('replaces primitive docs process shims before assigning env values', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const windowGlobal = { process: 'browser-process' }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process).toEqual({ env: { NODE_ENV: 'production' } })
})

it('replaces primitive docs process env values before assigning NODE_ENV', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const processGlobal = { env: 'browser-env' }
  const windowGlobal = { process: processGlobal }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process).toBe(processGlobal)
  expect(windowGlobal.process.env).toEqual({ NODE_ENV: 'production' })
})

it('recovers when an existing docs process shim cannot receive env values', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const windowGlobal = { process: Object.freeze({}) }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process).toEqual({ env: { NODE_ENV: 'production' } })
})

it('recovers when an existing docs process env getter throws', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const processGlobal = {}
  Object.defineProperty(processGlobal, 'env', {
    get() {
      throw new Error('Cannot read process.env')
    },
  })
  const windowGlobal = { process: processGlobal }

  runProcessShim(windowGlobal)

  expect(windowGlobal.process).toEqual({ env: { NODE_ENV: 'production' } })
})

it('does not throw when the docs process fallback assignment throws', () => {
  const runProcessShim = new Function('window', getProcessShimScript())
  const windowGlobal = {}
  Object.defineProperty(windowGlobal, 'process', {
    get() {
      throw new Error('Cannot read process')
    },
    set() {
      throw new Error('Cannot replace process')
    },
  })

  expect(() => {
    runProcessShim(windowGlobal)
  }).not.toThrow()
})
