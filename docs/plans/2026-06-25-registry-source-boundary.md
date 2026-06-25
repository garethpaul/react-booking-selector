# Registry Source Boundary

## Status: Completed

## Goal

Prevent consumers from assuming the npm `latest` package contains the current
default-branch component, package exports, accessibility behavior, or supported
peer dependency ranges.

## Evidence

- The npm registry `latest` dist-tag resolves to version `1.0.2`, published on
  April 12, 2020.
- The registry package declares React `>=15.5 && <=16.0`, styled-components
  `>=2.0 || >=3.0`, and Node `>8.0`.
- The current default branch still carries version `1.0.2` metadata but declares
  React 18/19, styled-components 5/6, Node 16+, CommonJS and ESM exports,
  TypeScript declarations, keyboard navigation, and current hosted verification.
- The historical registry tarball publishes source, tests, editor metadata,
  old docs bundles, and no current exports or TypeScript declaration surface.

## Decisions

- Label the existing install command as historical registry-package guidance.
- State that npm `latest` is not the current default-branch source.
- Direct current-source evaluation to a reviewed repository commit and local
  build rather than inventing an unverified Git dependency command.
- Require a new version and reviewed publish before claiming a current registry
  release.
- Add an exact dependency-free README contract to `docs:check`.

## Verification

- Run `node scripts/check-docs-plan.js` before the README change and capture the
  missing boundary failures.
- Exercise hostile mutations that remove the registry age, source distinction,
  historical-install label, or future-release requirement.
- Run the focused docs-plan tests, complete package verification, hosted Node
  16/20/24 gates, and exact-head review before merge.

## Risks

- The root package version remains equal to the registry version; this change
  prevents overclaims but does not publish current source.
- Repository source needs the documented Node 20+/Yarn 4 development toolchain;
  users should not mistake a source checkout for a ready registry artifact.

## Verification Result

- The first `node scripts/check-docs-plan.js` run rejected the missing plan and
  all five README boundary fragments.
- After adding the plan, the checker rejected the five missing fragments,
  incomplete status, missing `corepack yarn verify` and `make check` evidence,
  and absent README plan reference.
- The first green attempt exposed raw Markdown line-wrap sensitivity; normalized
  prose matching fixed that without weakening exact content.
- Four hostile mutations rejected weakened registry age, source distinction,
  historical-install labeling, and future-release requirements. The first
  source mutation did not alter wrapped Markdown, so a whitespace-aware rerun
  provided the intended rejection evidence.
- `node scripts/check-docs-plan.js` and `git diff --check` passed locally. This
  host has Node 18 and no Corepack, so complete package verification remains a
  hosted Node 20/24 responsibility.
- Exact-head Codex review found that shorthand `styled-components 2/3` implied
  an upper bound absent from the published `>=2.0 || >=3.0` range. README and
  the checker now state its effective `>=2.0` meaning precisely.
