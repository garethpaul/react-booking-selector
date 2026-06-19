import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

import {
  assertPackageContents,
  assertPackageManifestFiles,
  assertNoExecutablePackageFiles,
  assertPackageSizeLimits,
  expectedPackageFiles,
  expectedPackageManifestFiles,
  getDuplicateValues,
  MAX_PACKED_SIZE_BYTES,
  MAX_PACKAGE_FILE_SIZE_BYTES,
  MAX_UNPACKED_SIZE_BYTES,
  parsePackOutput,
  removePackArtifacts,
} from '../../scripts/check-package-contents'

const createPackJson = (files = expectedPackageFiles, packageOverrides = {}) =>
  JSON.stringify(
    [
      {
        filename: 'react-booking-selector-1.0.2.tgz',
        size: 31_226,
        unpackedSize: 142_514,
        files: files.map((filePath) => ({ path: filePath, size: 1 })),
        ...packageOverrides,
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
    expect(parsed.packageSize).toBe(31_226)
    expect(parsed.unpackedSize).toBe(142_514)
    expect(parsed.fileSizes.map(({ path: filePath }) => filePath).sort()).toEqual(parsed.files)
    expect(parsed.fileSizes.every(({ size }) => size === 1)).toBe(true)
  })

  it('normalizes package paths without requiring an npm tarball filename', () => {
    const parsed = parsePackOutput(
      JSON.stringify([
        {
          size: 1,
          unpackedSize: 1,
          files: [{ path: 'dist\\lib\\index.js', size: 1 }],
        },
      ]),
    )

    expect(parsed.filename).toBe(null)
    expect(parsed.files).toEqual(['dist/lib/index.js'])
    expect(parsed.executableFiles).toEqual([])
  })

  it('reports executable modes from npm pack output', () => {
    const parsed = parsePackOutput(
      JSON.stringify([
        {
          size: 2,
          unpackedSize: 2,
          files: [
            { path: 'README.md', size: 1, mode: 0o644 },
            { path: 'dist/lib/index.js', size: 1, mode: 0o755 },
          ],
        },
      ]),
    )

    expect(parsed.executableFiles).toEqual(['dist/lib/index.js'])
    expect(() => {
      assertNoExecutablePackageFiles(parsed.executableFiles)
    }).toThrow(/Executable package files:[\s\S]*dist\/lib\/index\.js/)
  })

  it('accepts non-executable package modes', () => {
    expect(() => {
      assertNoExecutablePackageFiles([])
    }).not.toThrow()
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
      parsePackOutput(JSON.stringify([{ size: 1, unpackedSize: 1, files: [{}] }]))
    }).toThrow(/file entry without a path/)
  })

  it.each([
    ['missing packed package', { size: undefined }, /Packed package size must be a non-negative safe integer/],
    ['packed package', { size: -1 }, /Packed package size must be a non-negative safe integer/],
    ['unpacked package', { unpackedSize: 1.5 }, /Unpacked package size must be a non-negative safe integer/],
    [
      'missing package file',
      { files: [{ path: 'README.md' }] },
      /Package file size for README\.md must be a non-negative safe integer/,
    ],
    [
      'package file',
      { files: [{ path: 'README.md', size: '1' }] },
      /Package file size for README\.md must be a non-negative safe integer/,
    ],
  ])('rejects malformed %s size metadata', (_label, packageOverrides, expectedError) => {
    expect(() => {
      parsePackOutput(createPackJson(['README.md'], packageOverrides))
    }).toThrow(expectedError)
  })

  it('accepts package sizes at the reviewed limits', () => {
    expect(() => {
      assertPackageSizeLimits({
        packageSize: MAX_PACKED_SIZE_BYTES,
        unpackedSize: MAX_UNPACKED_SIZE_BYTES,
        fileSizes: [{ path: 'dist/lib/BookingSelector.js', size: MAX_PACKAGE_FILE_SIZE_BYTES }],
      })
    }).not.toThrow()
  })

  it('enforces package size limits in the real pack check', () => {
    const checkerSource = readFileSync('scripts/check-package-contents.js', 'utf8')

    expect(checkerSource).toContain('assertPackageSizeLimits(packOutput)')
  })

  it('reports packed, unpacked, and per-file size limit violations', () => {
    expect(() => {
      assertPackageSizeLimits({
        packageSize: MAX_PACKED_SIZE_BYTES + 1,
        unpackedSize: MAX_UNPACKED_SIZE_BYTES + 1,
        fileSizes: [{ path: 'dist/lib/BookingSelector.js', size: MAX_PACKAGE_FILE_SIZE_BYTES + 1 }],
      })
    }).toThrow(
      /Packed package size 65537 exceeds 65536 bytes[\s\S]*Unpacked package size 262145 exceeds 262144 bytes[\s\S]*Oversized package files:[\s\S]*dist\/lib\/BookingSelector\.js: 65537/,
    )
  })

  it('accepts the expected package file list', () => {
    expect(() => {
      assertPackageContents(expectedPackageFiles)
    }).not.toThrow()
  })

  it('accepts the expected package manifest files allowlist', () => {
    expect(() => {
      assertPackageManifestFiles({ files: expectedPackageManifestFiles })
    }).not.toThrow()
  })

  it('reports duplicate package manifest allowlist entries', () => {
    expect(() => {
      assertPackageManifestFiles({ files: [...expectedPackageManifestFiles, 'README.md'] })
    }).toThrow(/Duplicate package files:[\s\S]*README\.md/)
  })

  it('requires a package manifest files allowlist', () => {
    expect(() => {
      assertPackageManifestFiles({})
    }).toThrow(/package\.json must define a files allowlist/)
  })

  it('reports package manifest allowlist drift', () => {
    expect(() => {
      assertPackageManifestFiles({ files: [...expectedPackageManifestFiles, 'src'] })
    }).toThrow(/Unexpected package files:[\s\S]*src/)
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

  it('reports duplicate packed files', () => {
    expect(() => {
      assertPackageContents([...expectedPackageFiles, 'README.md'])
    }).toThrow(/Duplicate package files:[\s\S]*README\.md/)
  })

  it('returns sorted unique duplicate values', () => {
    expect(getDuplicateValues(['dist/lib/index.js', 'README.md', 'README.md', 'dist/lib/index.js'])).toEqual([
      'README.md',
      'dist/lib/index.js',
    ])
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
