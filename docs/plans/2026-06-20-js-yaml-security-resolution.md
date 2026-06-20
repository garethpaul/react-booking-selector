# js-yaml Security Resolution

## Status: Completed

## Context

Dependabot reported that `@istanbuljs/load-nyc-config` retained
`js-yaml 3.14.2`, affected by GHSA-h67p-54hq-rp68, while the earliest patched
release is `js-yaml 4.2.0`. The repository already used js-yaml 4 through its
current ESLint graph, so a root Yarn resolution could consolidate the parser
without changing the published component API.

## Work Completed

- Added an exact `js-yaml 4.2.0` root resolution.
- Regenerated the Yarn 4 immutable lock so every js-yaml path uses the patched
  release.
- Added package and documentation checks that reject removal or weakening of
  the security resolution.
- Documented the dependency boundary in `SECURITY.md` and `CHANGES.md`.

## Verification Completed

- `corepack yarn install --immutable` reproduced the reviewed lockfile.
- `corepack yarn verify` passed the complete package verification graph.
- `corepack yarn why js-yaml` showed only `js-yaml 4.2.0`.
- `make check` passed on Node 20 and Node 24.
- An external-directory `make check` passed on Node 24.
- Formatting, lint, types, 400 tests, coverage, hostile mutations, package
  contents, Node 16 runtime smoke, Publint, and package type checks passed.
- `git diff --check` and repository integrity checks passed.
