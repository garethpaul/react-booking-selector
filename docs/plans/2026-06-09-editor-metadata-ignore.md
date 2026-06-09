# Editor Metadata Ignore

## Status: Completed

## Context

The repository tracked a local VS Code settings file and included a hidden
`.vscode/**/*.json` glob in the Prettier scripts. The editor settings are local
machine preferences, and the hidden-directory glob can make format checks fail
with a no-match error once the file is removed.

## Objectives

- Remove tracked VS Code editor settings.
- Ignore `.vscode/` for future local editor state.
- Remove `.vscode/**/*.json` from the format and format-check scripts.
- Add a Jest contract so editor metadata stays out of verification inputs.

## Work Completed

- Deleted `.vscode/settings.json`.
- Added `.vscode/` to `.gitignore`.
- Removed `.vscode/**/*.json` from `format` and `format:check`.
- Added package-root test coverage for the ignore rule, tracked editor files,
  and format script inputs.
- Updated README, VISION, and CHANGES.

## Verification

- `corepack yarn verify`
- `make check`
- `git diff --check`

## Follow-Up Candidates

- Add workspace setup recommendations to documentation without committing
  editor-specific settings.
- Keep package verification focused on source, tests, docs, and generated
  package outputs.
