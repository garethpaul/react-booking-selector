# Node 16 Package Runtime Verification

## Status: Completed

## Context

The published package declares `node >=16`, and package tooling verifies its
exports and type declarations on current Node releases. Hosted execution runs
the complete development gate on Node 20 and 24, but no job currently loads
the checked-in CommonJS and ESM package entries on the advertised Node 16
runtime floor.

## Priority

Package consumers execute the generated entry points rather than the source or
development toolchain. A syntax or conditional-exports regression can pass the
modern build matrix while breaking supported Node 16 applications.

## Objectives

- Add one dependency-light smoke command for the checked-in CommonJS and ESM
  package entry points.
- Run that command in a dedicated hosted Node 16 job.
- Keep installs lockfile-frozen and lifecycle-script-free.
- Keep the complete format, lint, type, test, audit, package, and reproducible
  build gate on Node 20 and 24.
- Protect the workflow, smoke command, tests, documentation, and completed plan
  with repository contracts.

## Work Completed

- Added `package:runtime` to load the checked-in CommonJS and ESM package
  entries and assert their public export shapes.
- Added a focused Jest regression for the runtime smoke command.
- Added a dedicated hosted Node 16.20.2 job using an immutable container digest,
  frozen lockfile installation, and disabled lifecycle scripts.
- Extended workflow and package-script contracts plus maintenance
  documentation.

## Verification

- `corepack yarn jest test/scripts/smoke-package-runtime.test.js test/scripts/check-docs-plan.test.js test/lib/package-root.test.js --runInBand`
- `corepack yarn package:runtime`
- `corepack yarn verify`
- `make check`
- The exact Node 16.20.2 container digest executed
  `node scripts/smoke-package-runtime.js` with networking disabled and loaded
  both entry modes successfully. The hosted job runs the same command through
  Yarn after its frozen online install.
- Two focused hostile mutations removed the Node 16 job and the ESM entry-mode
  probe; repository contracts rejected both.
- Workflow YAML parse and `git diff --check`
