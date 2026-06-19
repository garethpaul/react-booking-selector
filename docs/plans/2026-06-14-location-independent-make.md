# Location-Independent Make Gates

## Status: Completed

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

## Work Completed

- Added an override-protected absolute repository root to the Makefile.
- Rooted lint, test, build, and verify recipes.
- Extended the docs-plan checker with exact Make and completed-plan evidence
  contracts.

## Verification Results

- Node 20.19.5 and Node 24.16.0 passed full `corepack yarn verify` and
  `make check` runs from both the repository root and an unrelated directory
  with `REPO_ROOT=/tmp` supplied on the command line.
- Each full run passed 387 tests, two snapshots, coverage thresholds, audit,
  package contents and size checks, Node 16 runtime smoke, and package lint.
- Five hostile mutations rejected removal of override protection and every
  rooted executable recipe.
- Exact-base checks preserved source, package metadata, lockfile, workflow, and
  generated distribution output; no generated or untracked artifacts remained.
- `git diff --check` and secret, captured-prompt, dependency, workflow, and
  generated-artifact scans passed.
- Node 24 emitted the existing dependency-level `url.parse()` deprecation
  warning; the full supported gate still passed without suppressing it.
