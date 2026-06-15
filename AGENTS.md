# AGENTS.md

## Repository purpose

`react-booking-selector` is a controlled React component for selecting date and time slots on a day-by-hour booking grid. It supports blocked slots, square or linear drag selection, keyboard navigation, custom colors, and custom cell rendering.

## Project structure

- `Makefile` - repository verification targets
- `scripts` - baseline checks and helper scripts
- `docs` - plans, notes, and generated README assets
- `src` - primary source code
- `test` - tests and fixtures
- `package.json` - Node package metadata and scripts

## Development commands

- Install dependencies: `corepack yarn install`
- Full baseline: `make check`
- Combined verification: `make verify`
- Lint/static checks: `make lint`
- Tests: `make test`
- Build: `make build`
- package script `start`: `yarn start`
- package script `build`: `yarn build`
- package script `lint`: `yarn lint`
- package script `format:check`: `yarn format:check`
- package script `types:check`: `yarn types:check`
- package script `test`: `yarn test`
- package script `cover`: `yarn cover`
- package script `verify`: `yarn verify`
- If a command above skips because a platform toolchain is missing, verify on a machine with that SDK before claiming platform behavior is tested.

## Coding conventions

- The published package supports Node >=16.0; use Node >=20.0 and the pinned Yarn 4.17.0 for repository scripts and verification.
- Validate Node 16 compatibility against a package artifact built on a supported development Node release; do not run Yarn 4 under Node 16.
- Package module type is `commonjs`.
- ESLint is configured; keep lint fixes in source instead of generated output.
- Keep React components controlled and covered by component tests when props or rendering behavior changes.

## Testing guidance

- Test-related files detected: `setupTests.js`, `test/`, `test/docs/App.test.js`, `test/docs/index-html.test.js`, `test/docs/readme-overview.test.js`, `test/lib/__snapshots__/BookingSelector.test.js.snap`, `test/lib/BookingSelector.node.test.js`, `test/lib/BookingSelector.test.js`, `test/lib/date-utils.test.js`, `test/lib/index.test.js`
- Start with the narrowest relevant test or Make target, then run `make check` before handing off if the change is not documentation-only.
- Keep README verification notes in sync when commands, fixtures, or supported toolchains change.

## PR / change guidance

- Keep diffs focused on the requested repository and avoid unrelated modernization or formatting churn.
- Preserve public APIs, sample behavior, file formats, and documented environment variables unless the task explicitly changes them.
- Update tests, README notes, or docs/plans when behavior, security posture, or validation commands change.
- Call out skipped platform validation, legacy toolchain assumptions, and any risky files touched in the final summary.

## Safety and gotchas

- `dist/` contains generated or packaged output; prefer changing source and rebuilding.
- Deployment or publish scripts exist; do not run them unless explicitly asked.

## Agent workflow

1. Inspect the README, Makefile, manifests, and the files directly related to the request.
2. Make the smallest source or docs change that satisfies the task; avoid generated, vendored, or local-environment files unless required.
3. Run the narrowest useful validation first, then `make check` or the documented package/platform gate when available.
4. If a required SDK, service credential, or external runtime is unavailable, record the skipped command and why.
5. Summarize changed files, commands run, and remaining risks or follow-up validation.
