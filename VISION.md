## React Booking Selector Vision

React Booking Selector is a controlled React component for selecting time slots
on a day-by-hour booking grid.

The repository is useful as a reusable UI package with configurable date
ranges, blocked cells, color props, render-prop customization, and square or
linear drag-selection schemes.

The goal is to keep the component predictable, accessible, and easy to package
for modern React applications.

Current baseline: `make check` wraps `corepack yarn verify`, which checks every
canonical `docs/plans` record, linting, TypeScript declarations, Jest behavior
coverage, dependency audit output, strict npm package dry-run contents, and
package contract linting.

The current focus is:

Priority:

- Preserve the controlled `selection`, `blocked`, and `onChange` API
- Keep square and linear selection behavior deterministic
- Maintain package build, docs, lint, and test scripts
- Maintain Makefile wrappers for lint, test, build, verify, and check gates
- Keep styling customizable without hiding selection state
- Emit minute-unique selection payloads that match the grid comparison model
- Keep every completed maintenance plan under `docs/plans` verified by `docs:check`
- Keep every canonical maintenance plan linked exactly once from README with
  slash-separated `docs/plans` paths
- Keep canonical maintenance plan filenames dated and sortable
- Keep date, selection, touch, and docs-smoke helpers defensive against
  malformed or invalid inputs

Next priorities:

- Keep `docs:smoke` in the gate for layout-sensitive changes, including its
  screenshot, DOM, and horizontal overflow checks, and add baseline visual
  regression coverage before larger styling changes.
- Keep daylight-saving-time placeholder behavior and keyboard navigation covered
  as the day/hour grid evolves.
- Keep peer dependency ranges aligned with supported React and styled-components
  majors.
- Revisit the ESLint 10 major when the active parser and plugin peer ranges
  support it.

Contribution rules:

- One PR = one focused API, selection, styling, accessibility, or docs change.
- Add tests for behavior changes.
- Avoid breaking public props without migration notes.
- Keep docs examples aligned with package exports.

## Security And Responsible Use

Canonical security policy and reporting:

- [`SECURITY.md`](SECURITY.md)

Booking grids often represent availability and scheduling data. The component
should remain a local UI primitive and should not introduce network behavior,
tracking, or storage concerns.

## What We Will Not Merge (For Now)

- Hidden analytics or remote availability fetches
- Public prop changes without migration guidance
- Selection algorithm rewrites without tests
- Generated build artifacts unrelated to a release

This list is a roadmap guardrail, not a permanent rule.
Strong user demand and strong technical rationale can change it.
