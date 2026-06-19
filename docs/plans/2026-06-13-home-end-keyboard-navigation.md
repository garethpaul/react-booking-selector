---
title: Home and End Keyboard Navigation
type: feature
status: completed
date: 2026-06-13
---

# Home and End Keyboard Navigation

## Status: Completed

## Context

`BookingSelector` exposes each selectable time slot as a native button and
supports arrow-key movement plus `Enter` and `Space` selection. Keyboard users
cannot jump to the beginning or end of the current hour row or the complete
booking grid, making larger date ranges slower to navigate.

The W3C WAI-ARIA Authoring Practices grid guidance includes `Home`, `End`,
`Control+Home`, and `Control+End` as efficient navigation commands for
interactive grids:
https://www.w3.org/WAI/ARIA/apg/patterns/grid/

## Priority

This is a focused accessibility improvement on top of the existing keyboard
model. It adds efficient navigation without changing selection behavior,
native button semantics, tab order, pointer interactions, or package runtime
compatibility.

## Objectives

- Move `Home` to the first available rendered slot in the current hour row.
- Move `End` to the last available rendered slot in the current hour row.
- Move `Control+Home` to the first available slot in the entire rendered grid.
- Move `Control+End` to the last available slot in the entire rendered grid.
- Skip blocked slots, malformed columns, and daylight-saving placeholders.
- Prevent browser defaults only when a navigation command is handled.
- Preserve arrow navigation, selection keys, callbacks, focus failures, and
  current native-button/group semantics.
- Protect implementation, tests, documentation, completed plan, and generated
  distribution parity in the fail-closed repository gates.

## Implementation Units

### 1. Navigation target calculation

Files:

- `src/lib/BookingSelector.js`
- `test/lib/BookingSelector.test.js`

Requirements:

- Extend the keyboard event shape with the `ctrlKey` modifier.
- Add row-edge lookup using the focused slot index across date columns.
- Add whole-grid lookup in rendered column and slot order.
- Reuse existing validity and blocked-minute helpers rather than introducing a
  second date normalization path.
- Return no target when no eligible slot exists.

### 2. Focus handling

Files:

- `src/lib/BookingSelector.js`
- `test/lib/BookingSelector.test.js`

Requirements:

- Recognize `Home` and `End` as navigation keys.
- Pass modifier state to target calculation.
- Use the existing guarded `focusDateCell` path.
- Call `preventDefault` only after focus moves successfully.
- Leave unsupported modifier combinations and failed focus attempts untouched.

### 3. Contracts and documentation

Files:

- `scripts/check-docs-plan.js`
- `test/scripts/check-docs-plan.test.js`
- `README.md`
- `SECURITY.md`
- `VISION.md`
- `CHANGES.md`
- `docs/plans/2026-06-13-home-end-keyboard-navigation.md`
- generated `dist/lib/BookingSelector.js`
- generated `dist/esm/BookingSelector.js`

Requirements:

- Document row-edge and whole-grid keyboard commands.
- Extend the plan/document contract so the source, tests, README reference, and
  completed plan cannot be silently removed.
- Rebuild both published JavaScript formats and prove generated output is
  reproducible.
- Record completed status and actual verification only after all gates pass.

## Test Scenarios

- `Home` and `End` select the first and last available cells in the focused
  hour row while skipping blocked days and placeholders.
- `Control+Home` and `Control+End` select the first and last available cells in
  rendered grid order while skipping blocked slots.
- An all-blocked target range returns no target and does not prevent defaults.
- Missing dates, malformed columns, invalid current values, and unsupported
  keys remain safe no-ops.
- Focus success prevents the browser default; missing or throwing focus methods
  do not.
- Existing arrow, `Enter`, `Space`, mouse, touch, date normalization, package,
  type, docs, and Node 16 runtime tests remain green.

## Scope Boundaries

- Do not change the outer `role="group"` or introduce roving tab indices.
- Do not change selection payloads, controlled state, or blocked precedence.
- Do not wrap navigation at row or grid boundaries.
- Do not add dependencies or change the Node 16 published runtime floor.
- Do not alter package size ceilings except through measured, intentional
  package-checker updates if generated output crosses an existing budget.

## Verification

- focused Jest keyboard-navigation tests
- `corepack yarn format:check`
- `corepack yarn lint`
- `corepack yarn types:check`
- `corepack yarn test`
- `corepack yarn cover:check`
- `corepack yarn audit --json`
- `corepack yarn pack:check`
- `corepack yarn package:lint`
- `corepack yarn docs:smoke`
- `corepack yarn docs:check`
- `corepack yarn verify`
- `make check`
- `make build`
- `git diff --exit-code -- dist`
- digest-pinned Node 16 package-runtime smoke
- workflow YAML parse
- hostile keyboard-contract mutations
- `git diff --check`

## Work Completed

- Added blocked-aware row-edge target lookup for `Home` and `End`.
- Added blocked-aware whole-grid target lookup for `Control+Home` and
  `Control+End` in rendered column and slot order.
- Routed the new keys through guarded focus handling and prevented browser
  defaults only after focus moved successfully.
- Added helper, DOM interaction, malformed-input, blocked-slot, modifier, and
  failed-focus regressions.
- Extended the plan/document checker and public maintenance documentation, then
  rebuilt CommonJS, ESM, and static documentation output.

## Verification Results

Completed locally on 2026-06-13 with Node 20.19.5 and Yarn 1.22.22:

- focused selector and plan-checker suites: 262 tests and 2 snapshots passed
- full Jest suite: 16 suites, 387 tests, and 2 snapshots passed
- coverage: 100% statements, branches, functions, and lines for covered files
- `corepack yarn format:check`
- `corepack yarn lint`
- `corepack yarn types:check`
- `corepack yarn test`
- `corepack yarn cover:check`
- `corepack yarn audit --json` (zero vulnerabilities)
- `corepack yarn pack:check` (27 files)
- `corepack yarn package:runtime`
- `corepack yarn package:lint` (`publint` and `attw` passed)
- `corepack yarn docs:smoke`
- exact digest-pinned Node 16.20.2 package-runtime smoke with networking disabled
- package measurement: 32,167 packed bytes, 147,974 unpacked bytes, and a
  50,170-byte largest file
- workflow YAML parse
- eight hostile source, modifier, test, plan, and README mutations rejected
- plan-aware correctness, accessibility, testing, maintainability, and public
  library contract review completed with no residual actionable findings
- `git diff --check`
