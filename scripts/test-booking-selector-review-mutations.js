'use strict'

const childProcess = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const repositoryRoot = process.cwd()
const sourcePath = path.join(repositoryRoot, 'src/lib/BookingSelector.js')
const source = fs.readFileSync(sourcePath, 'utf8')
const mutations = [
  {
    name: 'stale document mouseup owner guard',
    find:
      '    const listenerDocument = getEventCurrentTarget(event)\n' +
      '    if (listenerDocument && listenerDocument !== this.documentMouseUpTarget) return\n',
    replace: '',
    testName: 'ignores stale document mouseup after failed listener migration cleanup',
  },
  {
    name: 'unmounted document event guard',
    find: '    if (!this.componentMounted) return\n',
    replace: '',
    testName: 'ignores orphaned document events after unmount',
  },
  {
    name: 'failed listener removal retention',
    find: '    } catch {\n      // Retain failed removals so unmount can retry every document that may still own the handler.\n    }',
    replace: '    } catch {\n      this.documentMouseUpTargets.delete(browserDocument)\n    }',
    testName: 'retains failed document listener removals for unmount cleanup',
  },
  {
    name: 'single roving tab stop',
    find: '        tabIndex={!blocked && dateMinuteKey(time) === this.focusedMinuteKey ? 0 : -1}\n',
    replace: '        tabIndex={blocked ? -1 : 0}\n',
    testName: 'keeps one available grid cell in the tab order',
  },
  {
    name: 'focused cell tab-stop migration',
    find: '        onFocus={() => {\n          this.handleCellFocusEvent(time)\n        }}\n',
    replace: '',
    testName: 'moves the roving tab stop when a different cell receives focus',
  },
]

const copyFixture = (fixtureRoot) => {
  for (const entry of ['src', 'test']) {
    fs.cpSync(path.join(repositoryRoot, entry), path.join(fixtureRoot, entry), { recursive: true })
  }
  for (const entry of ['.babelrc', 'package.json', 'setupTests.js']) {
    fs.copyFileSync(path.join(repositoryRoot, entry), path.join(fixtureRoot, entry))
  }
  fs.symlinkSync(path.join(repositoryRoot, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'dir')
}

for (const mutation of mutations) {
  const occurrences = source.split(mutation.find).length - 1
  if (occurrences !== 1) {
    throw new Error(`${mutation.name} mutation expected one source match, found ${occurrences}`)
  }

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'react-booking-selector-mutation-'))
  try {
    copyFixture(fixtureRoot)
    fs.writeFileSync(
      path.join(fixtureRoot, 'src/lib/BookingSelector.js'),
      source.replace(mutation.find, mutation.replace),
    )
    const result = childProcess.spawnSync(
      process.execPath,
      [
        path.join(repositoryRoot, 'node_modules/jest/bin/jest.js'),
        'test/lib/BookingSelector.test.js',
        '--runInBand',
        '--coverage=false',
        '--testNamePattern',
        mutation.testName,
      ],
      { cwd: fixtureRoot, encoding: 'utf8' },
    )
    if (result.error) throw result.error
    if (result.status === 0) {
      throw new Error(`${mutation.name} mutation survived:\n${result.stdout}${result.stderr}`)
    }
    process.stdout.write(`Rejected mutation: ${mutation.name}\n`)
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true })
  }
}
