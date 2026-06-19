---
title: Listener and Roving Focus Review
status: completed
date: 2026-06-19
---

# Listener and Roving Focus Review

## Problem

The document listener migration retained only the current owner. If removing a
listener from an earlier owner threw, that owner was forgotten and could keep
calling the component after a later migration or unmount. Separately, every
available slot remained in the browser tab order even though the component
implemented grid-style Arrow, Home, and End navigation. Large booking grids
therefore required many Tab presses and had no single keyboard entry point.

## Requirements

1. Retain every document that may still own the component mouseup handler.
2. Retry failed removals during unmount and make callbacks inert as soon as the
   component begins unmounting.
3. Keep exactly one available slot in the tab order, initially the first
   available slot in rendered order.
4. Move the roving tab stop whenever pointer, programmatic, or keyboard focus
   reaches another available slot.
5. Re-home the tab stop when props remove or block its slot.
6. Preserve server rendering, multiple component instances, drag selection,
   disabled-slot behavior, package contents, Node 16 runtime output, and the
   explicit docs deployment boundary.

## Implementation

- Track every successfully registered document and remove a document from that
  set only after listener removal succeeds.
- Reject document mouseup callbacks when the component is not mounted.
- Track the active focus minute outside React render state and update registered
  button `tabIndex` values when focus moves.
- Derive a valid first available tab stop during rendering when grid or blocked
  props invalidate the previous slot.
- Add red-first JSDOM regressions and isolated mutations for listener cleanup,
  stale callbacks, a single grid tab stop, and focus migration.

## Verification Plan

- Run the focused BookingSelector suite and full 100% coverage gate.
- Run `corepack yarn verify` and repository/external-directory `make check` on
  supported development Node releases.
- Rebuild CommonJS, ESM, and docs output and verify checked-in distribution
  reproducibility.
- Run package dry-run contents, Publint, Are The Types Wrong, Node 16 package
  loading, dependency audit, docs browser smoke, and hostile mutations.
- Use hosted pull-request and post-merge checks as authoritative Node 20, Node
  24, Node 16 artifact, and CodeQL evidence.

## Status: Completed

## Verification Completed

- Red-first focused tests reproduced failed-removal orphaning, post-unmount
  callbacks, multiple tab stops, and a tab stop that did not follow focus.
- The focused component suite passed with 252 tests and both snapshots.
- Four isolated hostile mutations were rejected for the unmount guard, retained
  failed removals, the single tab stop, and focus migration.
- The immutable Yarn 4.17.0 install, package build, npm dry-run package surface,
  and high-severity dependency audit passed before the complete gates.
- Node 20 `corepack yarn verify` and Node 24 external-directory `make check`
  passed with 399 tests, both snapshots, and 100% statement, branch, function,
  and line coverage.
- Package contents, runtime smoke, Publint, Are The Types Wrong, and recursive
  high-severity audit gates passed on both supported development Node releases.
- Real-browser emulation at 390x844 and 320x568 rendered 70 slot buttons, one
  available tab stop, and no horizontal document or slot overflow.
- The repository Chrome CLI smoke reached the built docs but macOS headless
  Chrome enforced a 485px minimum layout viewport for the requested 390px
  window. The unchanged hosted Linux gate is authoritative for that script.

## Residual Risks

- No live screen-reader session or cross-origin iframe/portal integration was
  exercised locally.
- Local Docker did not respond before the 60-second limit, so the digest-pinned
  Node 16 package artifact is validated by the protected hosted job.
- No npm publication or Surge deployment was performed; package publishing and
  docs deployment remain explicit maintainer actions.
