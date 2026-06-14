# Location-Independent Make Gates

## Status: Planned

## Context

The Make recipes invoke Corepack and Yarn in the caller's current directory.
Using the repository Makefile through an absolute path from another directory
therefore resolves the wrong package and cannot reproduce the package gate.

## Objectives

- Resolve the repository root from the loaded Makefile.
- Run every executable Make recipe from that root, independent of the caller.
- Protect the root derivation and rooted recipes with mutation-sensitive docs
  contracts.
- Preserve the existing lint, test, build, and full verification behavior.

## Scope Boundaries

- Do not change component behavior, package APIs, dependencies, generated
  distribution contents, or hosted workflow coverage.
- Do not run deployment or publishing commands.

## Verification

- every Make alias from the repository root and an unrelated directory
- full `corepack yarn verify` and `make check` on Node 20 and Node 24
- hostile mutations covering root derivation and every rooted recipe
- package manifest, distribution, dependency, workflow, secret, captured-prompt,
  and generated-artifact scans
- `git diff --check`

## Work Planned

- Add an override-protected absolute repository root to the Makefile.
- Root lint, test, build, and verify recipes.
- Extend the docs-plan checker with exact Make and completed-plan evidence
  contracts.
