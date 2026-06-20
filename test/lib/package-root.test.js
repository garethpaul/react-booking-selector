import { execFileSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'

import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'
import packageJson from 'react-booking-selector/package.json'

it('exports BookingSelector from the package root', () => {
  expect(NamedBookingSelector).toBe(BookingSelector)
})

it('exports package metadata', () => {
  expect(packageJson.name).toBe('react-booking-selector')
  expect(packageJson.description).toBe('A grid-based booking selector.')
  expect(packageJson.peerDependencies.react).toBe('^18.0.0 || ^19.0.0')
  expect(packageJson.peerDependencies['styled-components']).toBe('^5.1.0 || ^6.0.0')
  expect(packageJson.packageManager).toBe('yarn@4.17.0')
  expect(packageJson.engines.node).toBe('>=16.0')
})

it('marks the published package as side-effect free', () => {
  expect(packageJson.sideEffects).toBe(false)
})

it('pins the patched YAML parser across legacy coverage tooling', () => {
  expect(packageJson.resolutions['js-yaml']).toBe('4.2.0')
})

it('keeps documentation deployment explicit and separate from publishing', () => {
  expect(packageJson.scripts.prepublish).toBeUndefined()
  expect(packageJson.scripts.publish).toBeUndefined()
  expect(packageJson.scripts.postpublish).toBeUndefined()
  expect(packageJson.scripts.prepack).toBe('corepack yarn build')
  expect(packageJson.scripts['docs:deploy']).toBe(
    'yarn docs:build && npx --yes surge@0.27.4 dist/docs --domain react-booking-selector.surge.sh',
  )
})

it('exposes repository Makefile gate wrappers', () => {
  const makefile = readFileSync('Makefile', 'utf8')

  expect(packageJson.scripts.test).toBe('yarn lib:build && jest --runInBand')
  expect(packageJson.scripts['package:runtime']).toBe('node scripts/smoke-package-runtime.js')
  expect(packageJson.scripts['docs:normalize-html']).toBe('node scripts/normalize-docs-html.js')
  expect(packageJson.scripts.verify).toContain('yarn package:runtime')
  expect(packageJson.scripts.verify).toContain('yarn npm audit --all --recursive --severity high')
  expect(makefile).toMatch(/^\.DEFAULT_GOAL := check$/m)
  expect(makefile).toMatch(/^override REPO_ROOT := \$\(abspath \$\(dir \$\(lastword \$\(MAKEFILE_LIST\)\)\)\)$/m)
  expect(makefile).toMatch(/^check: verify$/m)
  expect(makefile).toMatch(/^lint:\n\tcd "\$\(REPO_ROOT\)" && corepack yarn lint$/m)
  expect(makefile).toMatch(/^test:\n\tcd "\$\(REPO_ROOT\)" && corepack yarn test$/m)
  expect(makefile).toMatch(/^build:\n\tcd "\$\(REPO_ROOT\)" && corepack yarn build$/m)
  expect(makefile).toMatch(/^verify:\n\tcd "\$\(REPO_ROOT\)" && corepack yarn verify$/m)
})

it('uses the node-modules linker for repository tooling', () => {
  expect(readFileSync('.yarnrc.yml', 'utf8')).toBe('nodeLinker: node-modules\n')
})

it('keeps local editor metadata out of verification inputs', () => {
  const gitignore = readFileSync('.gitignore', 'utf8')
  const trackedEditorFiles = execFileSync('git', ['ls-files', '.vscode'], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((filePath) => filePath && existsSync(filePath))

  expect(gitignore).toContain('.vscode/')
  expect(trackedEditorFiles).toEqual([])
  expect(packageJson.scripts.format).not.toContain('.vscode')
  expect(packageJson.scripts['format:check']).not.toContain('.vscode')
})

it('keeps package entry metadata aligned with the generated builds', () => {
  expect(packageJson.type).toBe('commonjs')
  expect(packageJson.main).toBe('dist/lib/index.js')
  expect(packageJson.module).toBe('dist/esm/index.js')
  expect(packageJson.types).toBe('dist/lib/index.d.ts')
  expect(packageJson.exports['.']).toEqual({
    import: {
      types: './dist/esm/index.d.mts',
      default: './dist/esm/index.js',
    },
    require: {
      types: './dist/lib/index.d.cts',
      default: './dist/lib/index.js',
    },
    default: './dist/esm/index.js',
  })
  expect(packageJson.exports['./package.json']).toBe('./package.json')
})

it('supports direct CommonJS require interop', () => {
  const output = execFileSync(
    process.execPath,
    [
      '-e',
      "const BookingSelector = require('react-booking-selector'); console.log(`${typeof BookingSelector}:${BookingSelector.default === BookingSelector}:${BookingSelector.BookingSelector === BookingSelector}:${BookingSelector.__esModule === true}`)",
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  expect(output.trim()).toBe('function:true:true:true')
})

it('supports the package ESM import condition', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'; console.log(`${typeof BookingSelector}:${BookingSelector === NamedBookingSelector}`)",
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  expect(output.trim()).toBe('function:true')
})

it('keeps the runtime-floor smoke fail-closed for both package entry modes', () => {
  const runtimeSmoke = readFileSync('scripts/smoke-package-runtime.js', 'utf8')

  expect(runtimeSmoke).toContain("require('react-booking-selector')")
  expect(runtimeSmoke).toContain(
    "import BookingSelector, { BookingSelector as NamedBookingSelector } from 'react-booking-selector'",
  )
  expect(runtimeSmoke).toContain("commonJsResult !== 'function:true:true:true'")
  expect(runtimeSmoke).toContain("esmResult !== 'function:true'")
})
