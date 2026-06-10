# Hosted Verification

## Status: Completed

## Context

The package already had comprehensive local verification for documentation plans, formatting, linting, types, Jest coverage, dependency audit, package contents, package metadata, and build output. Pushes and pull requests did not run those gates or confirm that checked-in CommonJS, ESM, and documentation bundles regenerate without drift.

## Work Completed

- Added a fixed-runner GitHub Actions matrix for Node 20 and Node 24.
- Installed the frozen Yarn 1 lockfile with dependency lifecycle scripts disabled.
- Ran the canonical `make check` gate, rebuilt library and documentation output, and rejected changes under `dist`.
- Limited the workflow token to read-only contents access and pinned checkout and Node setup actions to reviewed commits.
- Extended the docs-plan checker to preserve the runner, permissions, action pins, runtime matrix, install policy, canonical gates, clean distribution check, and failure policy.

## Verification

- `corepack yarn install --frozen-lockfile --ignore-scripts`
- `corepack yarn verify`
- `corepack yarn build`
- `make check`
- `git diff --exit-code -- dist`
