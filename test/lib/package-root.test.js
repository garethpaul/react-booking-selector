import { execFileSync } from 'child_process'
import { readFileSync } from 'fs'

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
  const verifyCommands = packageJson.scripts.verify.split(' && ')
  expect(verifyCommands.filter((command) => command === 'yarn docs:smoke')).toHaveLength(1)
  expect(verifyCommands.indexOf('yarn docs:smoke')).toBe(verifyCommands.indexOf('yarn docs:check') + 1)
  expect(packageJson.scripts.verify).toContain('yarn package:runtime')
  expect(packageJson.scripts.verify).toContain('yarn npm audit --all --recursive --severity high')
  expect(makefile).toMatch(/^\.DEFAULT_GOAL := check$/m)
  expect(makefile).toMatch(/^override SHELL := \/bin\/sh$/m)
  expect(makefile).toMatch(/^override \.SHELLFLAGS := -c$/m)
  expect(makefile).toContain('$(error MAKEFLAGS must not be overridden for repository verification)')
  expect(makefile).toContain('override REPOSITORY_MAKE_SHORT_FLAGS :=')
  expect(makefile).toContain(
    '$(error non-executing or error-ignoring MAKEFLAGS are not supported for repository verification)',
  )
  expect(makefile).toMatch(
    /^ifneq \(\$\(strip \$\(MAKEFILES\)\),\)\n\$\(error MAKEFILES must be empty; repository verification requires this Makefile to be loaded alone\)$/m,
  )
  expect(makefile).toMatch(
    /^ifneq \(\$\(origin MAKEFILE_LIST\),file\)\n\$\(error MAKEFILE_LIST must not be overridden\)$/m,
  )
  expect(makefile).toMatch(/^override REPOSITORY_MAKEFILE := \$\(value MAKEFILE_LIST\)$/m)
  expect(makefile).toMatch(/^override REPO_ROOT := \$\(shell path=/m)
  expect(makefile).toContain('/usr/bin/sed')
  expect(makefile).toContain('[ -f "$$path" ] || exit 1')
  expect(makefile).toContain('/usr/bin/dirname')
  expect(makefile).toContain('/bin/pwd -P')
  expect(makefile).toMatch(/^export REPO_ROOT$/m)
  expect(makefile).toMatch(
    /^ifeq \(\$\(strip \$\(REPO_ROOT\)\),\)\n\$\(error repository Makefile path could not be resolved\)$/m,
  )
  expect(makefile).toMatch(/^build check lint root-test test verify: __repository-make-authority$/m)
  expect(makefile).toMatch(/^__repository-make-authority::$/m)
  expect(makefile).toContain('additional Makefiles are not supported for repository verification')
  expect(makefile).toMatch(/^check: verify$/m)
  expect(makefile).toMatch(/^lint:\n\tcd "\$\$REPO_ROOT" && corepack yarn lint$/m)
  expect(makefile).toMatch(/^test:\n\tcd "\$\$REPO_ROOT" && corepack yarn test$/m)
  expect(makefile).toMatch(/^build:\n\tcd "\$\$REPO_ROOT" && corepack yarn build$/m)
  expect(makefile).toMatch(/^root-test:\n\tcd "\$\$REPO_ROOT" && scripts\/test-makefile-root\.sh$/m)
  expect(makefile).toMatch(/^verify: root-test\n\tcd "\$\$REPO_ROOT" && corepack yarn verify$/m)
})

it('uses the node-modules linker for repository tooling', () => {
  expect(readFileSync('.yarnrc.yml', 'utf8')).toBe('nodeLinker: node-modules\n')
})

it('keeps local repository metadata out of verification inputs', () => {
  const activeGitignorePatterns = new Set(
    readFileSync('.gitignore', 'utf8')
      .split(/\r?\n/u)
      .filter((line) => line && !line.startsWith('#')),
  )
  const trackedMetadataFiles = execFileSync('/usr/bin/git', ['ls-files', '--', '.vscode', '.explore'], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)

  expect(activeGitignorePatterns).toContain('.vscode/')
  expect(activeGitignorePatterns).toContain('.explore/')
  for (const metadataPath of ['.vscode/', '.explore/', '.explore/REPO_MAP.md']) {
    expect(() =>
      execFileSync('/usr/bin/git', ['check-ignore', '--quiet', metadataPath], {
        stdio: 'ignore',
      }),
    ).not.toThrow()
  }
  expect(trackedMetadataFiles).toEqual([])
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
