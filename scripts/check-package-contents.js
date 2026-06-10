'use strict'

const childProcess = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const expectedPackageFiles = [
  'LICENSE',
  'README.md',
  'dist/esm/BookingSelector.js',
  'dist/esm/colors.js',
  'dist/esm/date-utils.js',
  'dist/esm/index.d.mts',
  'dist/esm/index.d.ts',
  'dist/esm/index.js',
  'dist/esm/package.json',
  'dist/esm/selection-schemes/index.js',
  'dist/esm/selection-schemes/linear.js',
  'dist/esm/selection-schemes/square.js',
  'dist/esm/styled.js',
  'dist/esm/typography.js',
  'dist/lib/BookingSelector.js',
  'dist/lib/colors.js',
  'dist/lib/date-utils.js',
  'dist/lib/index.d.cts',
  'dist/lib/index.d.ts',
  'dist/lib/index.js',
  'dist/lib/selection-schemes/index.js',
  'dist/lib/selection-schemes/linear.js',
  'dist/lib/selection-schemes/square.js',
  'dist/lib/styled.js',
  'dist/lib/typography.js',
  'docs/readme-overview.svg',
  'package.json',
]

const expectedPackageManifestFiles = ['dist/lib', 'dist/esm', 'docs/readme-overview.svg', 'LICENSE', 'README.md']

const forbiddenPackagePathPrefixes = [
  '.cache/',
  '.parcel-cache/',
  'coverage/',
  'dev/',
  'dist/docs/',
  'docs/plans/',
  'scripts/',
  'src/',
  'test/',
]

/* istanbul ignore next -- the real pack:check command exercises platform-specific npm resolution. */
const getNpmCommand = () => (process.platform === 'win32' ? 'npm.cmd' : 'npm')

const parsePackOutput = (output) => {
  const jsonStart = output.lastIndexOf('\n[')
  const jsonText = (jsonStart === -1 ? output : output.slice(jsonStart + 1)).trim()
  let parsed

  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    throw new Error(`Unable to parse npm pack --json output: ${error.message}`)
  }

  if (!Array.isArray(parsed) || parsed.length !== 1 || !parsed[0] || !Array.isArray(parsed[0].files)) {
    throw new Error('npm pack --json output did not contain exactly one package with a files list')
  }

  return {
    filename: typeof parsed[0].filename === 'string' ? parsed[0].filename : null,
    files: parsed[0].files
      .map((file) => {
        if (!file || typeof file.path !== 'string') {
          throw new Error('npm pack --json output contained a file entry without a path')
        }
        return file.path.replace(/\\/gu, '/')
      })
      .sort(),
  }
}

const getSetDifference = (left, right) => {
  const rightSet = new Set(right)
  return left.filter((value) => !rightSet.has(value))
}

const getDuplicateValues = (values) => {
  const seenValues = new Set()
  const duplicateValues = new Set()
  for (const value of values) {
    if (seenValues.has(value)) {
      duplicateValues.add(value)
    } else {
      seenValues.add(value)
    }
  }
  return Array.from(duplicateValues).sort()
}

const assertPackageContents = (actualPackageFiles, expectedFiles = expectedPackageFiles) => {
  const actualFiles = [...actualPackageFiles].sort()
  const sortedExpectedFiles = [...expectedFiles].sort()
  const missingFiles = getSetDifference(sortedExpectedFiles, actualFiles)
  const unexpectedFiles = getSetDifference(actualFiles, sortedExpectedFiles)
  const duplicateFiles = getDuplicateValues(actualFiles)
  const forbiddenFiles = actualFiles.filter((file) =>
    forbiddenPackagePathPrefixes.some((prefix) => file.startsWith(prefix)),
  )
  const errors = []

  if (duplicateFiles.length > 0) {
    errors.push(`Duplicate package files:\n${duplicateFiles.join('\n')}`)
  }
  if (missingFiles.length > 0) {
    errors.push(`Missing package files:\n${missingFiles.join('\n')}`)
  }
  if (unexpectedFiles.length > 0) {
    errors.push(`Unexpected package files:\n${unexpectedFiles.join('\n')}`)
  }
  if (forbiddenFiles.length > 0) {
    errors.push(`Forbidden package files:\n${forbiddenFiles.join('\n')}`)
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }
}

const assertPackageManifestFiles = (packageJson) => {
  if (!packageJson || !Array.isArray(packageJson.files)) {
    throw new Error('package.json must define a files allowlist')
  }

  assertPackageContents(packageJson.files, expectedPackageManifestFiles)
}

const removePackArtifacts = (cwd, filenames = []) => {
  const knownFilenames = new Set(filenames.filter(Boolean))
  fs.readdirSync(cwd)
    .filter((name) => knownFilenames.has(name) || /^react-booking-selector-.*\.tgz$/u.test(name))
    .forEach((name) => {
      fs.rmSync(path.join(cwd, name), { force: true })
    })
}

/* istanbul ignore next -- covered by the real pack:check command instead of nested npm pack inside Jest. */
const runNpmPackDryRun = (cwd = process.cwd()) => {
  const result = childProcess.spawnSync(getNpmCommand(), ['pack', '--dry-run', '--json'], {
    cwd,
    encoding: 'utf8',
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '')
    process.stderr.write(result.stderr || '')
    throw new Error(`npm pack --dry-run --json exited with ${result.signal || `status ${result.status}`}`)
  }

  return result.stdout || ''
}

/* istanbul ignore next -- covered by the real pack:check command instead of nested npm pack inside Jest. */
const main = () => {
  let packOutput = null

  try {
    assertPackageManifestFiles(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')))
    const output = runNpmPackDryRun()
    packOutput = parsePackOutput(output)
    assertPackageContents(packOutput.files)
    process.stdout.write(`Package contents check passed for ${packOutput.files.length} file(s).\n`)
  } finally {
    removePackArtifacts(process.cwd(), packOutput && packOutput.filename ? [packOutput.filename] : [])
  }
}

/* istanbul ignore next -- CLI error handling is covered by the real pack:check command. */
if (require.main === module) {
  try {
    main()
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exit(1)
  }
}

module.exports = {
  assertPackageContents,
  assertPackageManifestFiles,
  expectedPackageFiles,
  expectedPackageManifestFiles,
  getDuplicateValues,
  parsePackOutput,
  removePackArtifacts,
}
