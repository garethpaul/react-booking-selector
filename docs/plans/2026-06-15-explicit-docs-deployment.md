# Require Explicit Documentation Deployment

## Status: Planned

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

## Verification Plan

- Run focused package-root and docs-plan tests.
- Run the full immutable Yarn 4 package gate from the repository and an
  unrelated caller directory on Node 20.
- Run the complete gate on Node 24 and the packed artifact runtime on the
  digest-pinned, network-disabled Node 16 container.
- Run isolated mutations for automatic lifecycle hooks, explicit deployment
  preservation, documentation, and completed plan evidence.
- Audit the exact diff, generated artifacts, credential patterns, package and
  lockfile drift, workflow changes, and `git diff --check` before commit.

## References

- npm lifecycle scripts: https://docs.npmjs.com/cli/using-npm/scripts/
- npm package scripts field: https://docs.npmjs.com/files/package.json/
- npm `npx` command behavior: https://docs.npmjs.com/cli/commands/npx/

## Risks

- Maintainers accustomed to automatic docs deployment must run the explicit
  command after publication when a documentation release is desired. Canonical
  documentation will record this deliberate two-step release sequence.
