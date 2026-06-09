# Package Manifest Allowlist Check

## Status: Completed

## Context

`pack:check` asserted the files that `npm pack --dry-run --json` would publish,
but it did not fail early if `package.json` broadened the `files` allowlist. A
manifest drift could include source, tests, docs plans, or generated docs in the
publish candidate before the dry-run contents assertion caught the final
package shape.

## Objectives

- Keep the published package surface limited to `dist/lib`, `dist/esm`,
  `docs/readme-overview.svg`, `LICENSE`, and `README.md`.
- Fail `pack:check` when `package.json.files` is missing or drifts.
- Cover the manifest allowlist assertion with package-root Jest tests.
- Keep the broader package dry-run contents check unchanged.

## Work Completed

- Added `assertPackageManifestFiles`.
- Exported the manifest expected-files list for direct Jest coverage.
- Ran the manifest allowlist assertion before `npm pack --dry-run --json`.
- Added tests for accepted, missing, and drifted manifest allowlists.
- Updated README, VISION, and CHANGES.

## Verification

- `corepack yarn test --runTestsByPath test/scripts/check-package-contents.test.js --runInBand`
- `corepack yarn pack:check`
- `corepack yarn verify`
- `make check`
- `git diff --check`

## Follow-Up Candidates

- Keep `package.json.files` and `scripts/check-package-contents.js` paired when
  new published assets are intentionally added.
