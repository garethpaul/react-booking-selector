## React Booking Selector Vision

React Booking Selector is a controlled React component for selecting time slots
on a day-by-hour booking grid.

The repository is useful as a reusable UI package with configurable date
ranges, blocked cells, color props, render-prop customization, and square or
linear drag-selection schemes.

The goal is to keep the component predictable, accessible, and easy to package
for modern React applications.

Current baseline: `make check` wraps `corepack yarn verify`, which checks canonical `docs/plans`
coverage, linting, TypeScript declarations, Jest behavior coverage, dependency
audit output, and npm package dry-run contents.

The current focus is:

Priority:

- Preserve the controlled `selection`, `blocked`, and `onChange` API
- Keep square and linear selection behavior deterministic
- Maintain package build, docs, lint, and test scripts
- Keep styling customizable without hiding selection state
- Keep completed maintenance plans under `docs/plans`

Next priorities:

- Add focused tests for keyboard, mouse, and touch selection flows
- Improve accessibility labels and keyboard navigation documentation
- Document date/timezone expectations for `Date` inputs
- Keep peer dependency ranges aligned with supported React versions

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
