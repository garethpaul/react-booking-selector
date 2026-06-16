---
title: Document Mouseup Listener Migration
status: completed
date: 2026-06-16
---

# Document Mouseup Listener Migration

## Problem

`BookingSelector` attaches its drag-completion `mouseup` listener to the
rendered grid's owner document during mount, but it does not retain that exact
document. If the grid moves to another document, later updates do not attach the
listener to the new owner and unmount cleanup targets the current document
instead of the original one. The old listener can leak while drag completion in
the new document is missed.

## Priority

Keep document-level interaction ownership aligned with the rendered grid. This
is necessary for iframe, portal, preview, and other multi-document hosts and
prevents stale component callbacks after relocation or unmount.

## Requirements

1. Retain the exact document that successfully received the `mouseup` listener.
2. On update, leave an unchanged owner document alone; when ownership changes,
   remove from the old document before adding to the new one.
3. On unmount, remove from the retained listener document even if `gridRef`
   currently points elsewhere or is null.
4. Preserve defensive behavior when document lookup, listener registration, or
   listener removal is unavailable or throws.
5. Add mutation-sensitive lifecycle tests, maintained guidance, changelog, and
   completed-plan contracts without changing selection semantics or packaging.

## Implementation Units

### U1. Listener ownership lifecycle

**File:** `src/lib/BookingSelector.js`

Track the attached document separately from `gridRef`, centralize synchronization
and cleanup, call synchronization on mount and update, and detach the retained
target on unmount.

### U2. Regression coverage

**File:** `test/lib/BookingSelector.test.js`

Cover unchanged-owner no-op behavior, owner-document migration ordering, and
unmount cleanup after the grid reference moves or clears.

### U3. Maintained contracts

**Files:** `scripts/check-docs-plan.js`, `README.md`, `SECURITY.md`, `AGENTS.md`,
`VISION.md`, `CHANGES.md`, and this plan.

Register the plan and enforce source, tests, guidance, and completed evidence.

## Verification Plan

- Focused BookingSelector lifecycle tests
- Complete repository and external-directory `make check`
- Package contents, runtime smoke, types, lint, formatting, coverage, and docs
  smoke through the existing canonical gate
- Isolated hostile mutations for retained ownership, migration, cleanup, tests,
  guidance, and plan status
- Exact diff, generated-artifact, whitespace, mode, and credential audits

## Scope Boundaries

- Do not change selection, keyboard, touch, date, styling, package, or docs
  deployment behavior.
- Do not add dependencies or weaken the existing 100% coverage requirement.

## Status: Completed

## Work Completed

- Retained the exact document that successfully received the component's
  mouseup listener.
- Migrated ownership on update only when the rendered grid's document changes,
  removing from the old target before attaching to the new target.
- Removed the listener from the retained document on unmount even when
  `gridRef` later moves or clears.
- Added lifecycle, static, guidance, changelog, and completed-plan contracts.

## Verification Completed

- The focused lifecycle tests passed as part of the 248-test BookingSelector
  suite with both snapshots passing.
- The complete 392-test suite passed with 100% statement, branch, function, and
  line coverage.
- A finalized tracked-file mirror passed `corepack yarn verify` and repository
  `make check`; external-directory make check passed as well.
- Package audit reported no suggestions; the 27-file package allowlist, runtime
  smoke, Publint, and Are The Types Wrong checks passed.
- Six isolated hostile mutations were rejected for retained ownership, update
  migration, unmount cleanup, missing tests, erased guidance, and plan status.
- Exact diff, generated-artifact, whitespace, file-mode, and added-line
  credential audits passed before the canonical final gates.
- Live assistive-technology and cross-origin iframe sessions were not exercised.
