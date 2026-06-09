import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

import {
  assertPackageContents,
  expectedPackageFiles,
  parsePackOutput,
  removePackArtifacts,
} from '../../scripts/check-package-contents'

const createPackJson = (files = expectedPackageFiles) =>
  JSON.stringify(
    [
      {
        filename: 'react-booking-selector-1.0.2.tgz',
        files: files.map((filePath) => ({ path: filePath })),
      },
    ],
    null,
    2,
  )

describe('check-package-contents script', () => {
  const tempPaths = []

  afterEach(() => {
    while (tempPaths.length > 0) {
      rmSync(tempPaths.pop(), { force: true, recursive: true })
    }
  })

  it('parses npm dry-run JSON after prepack output', () => {
    const parsed = parsePackOutput(`yarn run v1.22.22\nDone in 1.23s.\n${createPackJson()}\n`)

    expect(parsed.filename).toBe('react-booking-selector-1.0.2.tgz')
    expect(parsed.files).toEqual([...expectedPackageFiles].sort())
  })

  it('normalizes package paths without requiring an npm tarball filename', () => {
    const parsed = parsePackOutput(
      JSON.stringify([
        {
          files: [{ path: 'dist\\lib\\index.js' }],
        },
      ]),
    )

    expect(parsed.filename).toBe(null)
    expect(parsed.files).toEqual(['dist/lib/index.js'])
  })

  it('reports malformed npm dry-run JSON', () => {
    expect(() => {
      parsePackOutput('yarn run v1.22.22\nDone in 1.23s.\n')
    }).toThrow(/Unable to parse npm pack --json output/)
  })

  it('reports npm dry-run output without exactly one files list', () => {
    expect(() => {
      parsePackOutput(JSON.stringify([]))
    }).toThrow(/exactly one package with a files list/)
  })

  it('reports npm dry-run file entries without paths', () => {
    expect(() => {
      parsePackOutput(JSON.stringify([{ files: [{}] }]))
    }).toThrow(/file entry without a path/)
  })

  it('accepts the expected package file list', () => {
    expect(() => {
      assertPackageContents(expectedPackageFiles)
    }).not.toThrow()
  })

  it('reports missing and unexpected package files', () => {
    const actualFiles = expectedPackageFiles
      .filter((filePath) => filePath !== 'README.md')
      .concat('src/lib/BookingSelector.js')

    expect(() => {
      assertPackageContents(actualFiles)
    }).toThrow(
      /Missing package files:[\s\S]*README\.md[\s\S]*Unexpected package files:[\s\S]*src\/lib\/BookingSelector\.js/,
    )
  })

  it('reports forbidden package paths explicitly', () => {
    expect(() => {
      assertPackageContents([...expectedPackageFiles, 'dist/docs/index.html'])
    }).toThrow(/Forbidden package files:[\s\S]*dist\/docs\/index\.html/)
  })

  it('removes package tarball artifacts', () => {
    const tempPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-pack-check-'))
    tempPaths.push(tempPath)
    const generatedTarball = path.join(tempPath, 'react-booking-selector-1.0.2.tgz')
    const namedTarball = path.join(tempPath, 'custom-output.tgz')
    const unrelatedTarball = path.join(tempPath, 'other-package-1.0.0.tgz')
    writeFileSync(generatedTarball, '')
    writeFileSync(namedTarball, '')
    writeFileSync(unrelatedTarball, '')

    removePackArtifacts(tempPath, ['custom-output.tgz'])

    expect(existsSync(generatedTarball)).toBe(false)
    expect(existsSync(namedTarball)).toBe(false)
    expect(existsSync(unrelatedTarball)).toBe(true)
  })

  it('removes generated package tarballs with default cleanup options', () => {
    const tempPath = mkdtempSync(path.join(tmpdir(), 'react-booking-selector-pack-check-'))
    tempPaths.push(tempPath)
    const generatedTarball = path.join(tempPath, 'react-booking-selector-1.0.2.tgz')
    writeFileSync(generatedTarball, '')

    removePackArtifacts(tempPath)

    expect(existsSync(generatedTarball)).toBe(false)
  })
})
