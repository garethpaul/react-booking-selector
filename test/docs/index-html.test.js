import { readFileSync } from 'fs'
import path from 'path'

const getProcessShimScript = () => {
  const html = readFileSync(path.join(process.cwd(), 'src/docs/index.html'), 'utf8')
  const [, script] = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)
  return script
}

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
