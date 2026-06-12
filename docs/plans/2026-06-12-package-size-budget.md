# Package Size Budget

## Status: Completed

## Context

The package checker enforces an exact file allowlist, rejects duplicate and
executable entries, and blocks internal paths. An expected file can still grow
without bound while preserving all of those invariants, allowing accidental
bundled data or generated output to increase install and audit cost.

The reviewed `npm pack --dry-run --json` baseline is 31,226 packed bytes,
142,514 unpacked bytes, and 47,851 bytes for the largest file.

## Priority

Package-size drift is a supply-chain and release-review concern. Byte ceilings
make intentional growth explicit without changing the public API or runtime.

## Requirements

- R1. Reject packed tarballs larger than 64 KiB.
- R2. Reject unpacked package contents larger than 256 KiB.
- R3. Reject any individual packed file larger than 64 KiB.
- R4. Reject missing, negative, fractional, or non-numeric size metadata.
- R5. Keep exact file, duplicate, forbidden-path, and executable-mode checks.
- R6. Cover accepted boundaries and each rejection mode with focused tests.
- R7. Document the package-size budget in README, VISION, CHANGES, and
  SECURITY guidance.

## Scope Boundaries

- Do not change the published file allowlist or package exports.
- Do not optimize or minify application code in this focused change.
- Do not weaken existing package, type, audit, coverage, or docs gates.

## Verification Plan

- `corepack yarn test --runTestsByPath test/scripts/check-package-contents.test.js --runInBand`
- `corepack yarn pack:check`
- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
- focused hostile package-size mutations
- `git diff --check`

## Work Completed

- Preserved packed, unpacked, and per-file byte metadata from
  `npm pack --dry-run --json` after path normalization.
- Added non-negative safe-integer validation for every required size field.
- Enforced 64 KiB packed, 256 KiB unpacked, and 64 KiB per-file ceilings in
  the real `pack:check` path.
- Added focused coverage for malformed metadata, exact-limit acceptance,
  aggregate violations, oversized-file reporting, and production-call wiring.
- Updated package, security, roadmap, and change documentation.

## Verification Completed

- `corepack yarn test --runTestsByPath test/scripts/check-package-contents.test.js --runInBand`
  passed all 26 focused tests.
- `corepack yarn pack:check` passed for 27 files at 31,226 packed bytes and
  142,514 unpacked bytes.
- `corepack yarn docs:check` passed for all 17 completed plans.
- All 11 focused hostile package-size mutations were rejected from a passing
  baseline, covering limit drift, metadata-validation weakening, production
  call removal, file-size collection removal, each enforcement branch, plan
  completion, and README linkage.
- `corepack yarn verify` and `make check` passed with 376 tests, 2 snapshots,
  100% covered files, zero dependency vulnerabilities, clean CJS and ESM
  package typing, and no package-lint findings.
- `git diff --check` passed, and the generated `dist` tree remained unchanged.
