# Require Explicit Documentation Deployment

## Status: Completed

## Context

`package.json` currently maps `postpublish` to `corepack yarn docs:deploy`.
Package-manager lifecycle semantics therefore couple every package publication
to a second external action that builds documentation, downloads and executes
Surge through `npx --yes`, and attempts a production documentation deployment.
The package may already be published when that unrelated deployment fails.

Documentation deployment should remain available as an explicit maintainer
command, but publishing the package must not trigger it automatically.

## Priority

High release safety. Separate registry publication from external deployment so
each privileged action is intentional, independently observable, and can fail
without misrepresenting the state of the other.

## Requirements

- R1. Remove the `postpublish` lifecycle hook from `package.json`.
- R2. Preserve the explicit `docs:deploy` command and its pinned Surge version.
- R3. Preserve `prepack`, package builds, package contents, and all runtime and
  accessibility behavior.
- R4. Add fail-closed tests and repository checks that reject any automatic
  `prepublish`, `publish`, or `postpublish` documentation deployment hook.
- R5. Document that package publication and documentation deployment are
  separate explicit maintainer actions.
- R6. Record completed package, mutation, audit, and hosted verification
  evidence without publishing or deploying anything.

## Scope Boundaries

- Do not run `npm publish`, `yarn npm publish`, Surge, or any deployment command.
- Do not change package versions, package contents, dependencies, lockfiles,
  workflow permissions, deployment domains, or credentials.
- Do not remove the explicit `docs:deploy` command.

## Implementation Units

### U1. Remove the automatic release hook

- **Files:** `package.json`
- Delete only `scripts.postpublish`; retain `prepack` and `docs:deploy` exactly.

### U2. Protect release-script separation

- **Files:** `test/lib/package-root.test.js`,
  `scripts/check-docs-plan.js`
- Require `postpublish`, `publish`, and `prepublish` to be absent.
- Require the explicit `docs:deploy` command to retain the pinned Surge package
  and reviewed domain.
- Ensure mutations that restore an automatic hook or weaken the explicit
  command are rejected.

### U3. Document and verify the release boundary

- **Files:** canonical maintenance documentation and this plan.
- Explain that package publication does not deploy documentation and that
  maintainers must invoke `corepack yarn docs:deploy` separately.
- Run package, content, type, runtime, audit, documentation, and mutation gates
  without contacting the registry or deployment service.

## Completion Evidence

- The focused package-root and docs-plan tests passed with 28 assertions.
- `corepack yarn verify` and `make check` passed on Node 20.19.5 from the
  repository and through the absolute Makefile path from an unrelated caller
  directory.
- The complete immutable package gate passed on Node 24.16.0 with
  `NODE_OPTIONS=--trace-deprecation` and no deprecation output.
- The package tarball built on Node 20 loaded both CommonJS and ESM entries on
  the digest-pinned, network-disabled Node 16 runtime without package lifecycle
  scripts.
- Twelve isolated hostile mutations were rejected across automatic publish
  hooks, prepack preservation, pinned explicit deployment, regression tests,
  static checks, documentation, plan linking, and completed evidence.
- Final generated-artifact, credential-pattern, package, lockfile, workflow,
  and `git diff --check` audits passed without publishing or deploying.

## References

- npm lifecycle scripts: https://docs.npmjs.com/cli/using-npm/scripts/
- npm package scripts field: https://docs.npmjs.com/files/package.json/
- npm `npx` command behavior: https://docs.npmjs.com/cli/commands/npx/

## Risks

- Maintainers accustomed to automatic docs deployment must run the explicit
  command after publication when a documentation release is desired. Canonical
  documentation will record this deliberate two-step release sequence.
