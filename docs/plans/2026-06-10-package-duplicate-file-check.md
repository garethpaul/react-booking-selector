# Package Duplicate File Check

## Status: Completed

## Context

`pack:check` compared the package manifest allowlist and `npm pack --dry-run`
contents against expected file sets. That caught missing, unexpected, and
forbidden files, but duplicate entries could still make the package surface
noisier and hide manifest drift during review.

## Objectives

- Reject duplicate file entries in `package.json.files`.
- Reject duplicate file paths reported by `npm pack --dry-run --json`.
- Preserve the existing missing, unexpected, and forbidden file checks.
- Cover duplicate detection with focused Jest tests.

## Work Completed

- Added shared duplicate-value detection to `scripts/check-package-contents.js`.
- Wired duplicate detection into `assertPackageContents`.
- Added package checker tests for manifest duplicates, packed-file duplicates,
  and sorted duplicate reporting.
- Updated README, VISION, and CHANGES maintenance notes.

## Verification

- `corepack yarn test --runTestsByPath test/scripts/check-package-contents.test.js --runInBand`
- `corepack yarn pack:check`
- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
- `git diff --check`
