# Yarn 4 Package Manager Migration

## Status: Planned

## Context

The repository pins Yarn Classic 1.22.22. On Node 24, Corepack loads Yarn's
deprecated `url.parse` path before any repository script runs, so otherwise
successful verification emits DEP0169. The current Yarn CLI release is 4.17.0
and supports the repository's Node 20+ development baseline.

The published package still supports Node 16. Yarn 4 itself requires Node
18.12 or newer, so package-manager modernization must separate development
tooling from runtime compatibility validation rather than silently raising the
package's consumer floor.

## Priority

Medium toolchain maintenance. Remove the known Node 24 package-manager
deprecation while retaining reproducible installs and explicit Node 16 package
runtime evidence.

## Requirements

- Pin Yarn 4.17.0 through `packageManager` and migrate the reviewed lockfile.
- Keep classic `node_modules` installation semantics for existing tooling.
- Replace Yarn Classic-only install and audit flags with Yarn 4 equivalents.
- Keep repository verification green on Node 20 and Node 24 without DEP0169.
- Preserve the published `node >=16.0` runtime floor by testing a built package
  tarball under Node 16 without invoking Yarn 4 there.
- Keep lifecycle scripts disabled during dependency installation and package
  runtime setup.
- Add fail-closed contracts for the package-manager version, linker mode,
  immutable install, audit command, and Node 16 artifact boundary.
- Record completed local, mutation, and hosted verification evidence.

## Scope Boundaries

- Do not change component behavior, package exports, peer dependencies, or the
  published Node runtime range.
- Do not upgrade application or development dependencies as part of the lock
  format migration.
- Do not publish the package or deploy documentation.

## Implementation Units

1. Migrate `package.json`, `yarn.lock`, and Yarn configuration to Yarn 4.17.0
   with the `node-modules` linker.
2. Update package scripts, workflow installation, audit, and Node 16 runtime
   verification around a package artifact produced on a supported build node.
3. Extend static, unit, documentation, and completed-plan contracts for the
   new package-manager boundary.

## Verification

- immutable Yarn 4 install on Node 20 and Node 24
- full repository and external-directory `make check`
- package build, pack-content, type, audit, and runtime gates
- Node 16 CommonJS and ESM loading from the built package artifact
- Node 24 deprecation tracing with no Yarn DEP0169 output
- hostile package version, linker, mutable-install, audit, runtime-boundary,
  documentation, and plan-status mutations
- exact diff, generated artifact, credential-pattern, and whitespace audits

## Source

- Yarn 4.17.0 package metadata:
  https://www.npmjs.com/package/@yarnpkg/cli-dist/v/4.17.0

## Completion Evidence

Pending implementation and validation.
