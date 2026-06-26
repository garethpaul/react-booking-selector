# Stale Document Mouseup Ownership Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Prevent a retained listener on an old document from completing a drag owned by the booking grid's current document.

**Architecture:** Use native event ownership already supplied through `currentTarget`; compare it with `documentMouseUpTarget` before selection logic. Preserve the existing retained-document cleanup set and shared listener identity.

**Tech Stack:** React 16, Flow-annotated JavaScript, Jest, Testing Library, Yarn 4, Node.js 20/24.

---

## Status: Completed

### Task 1: Prove stale-owner completion

**Files:**

- Modify: `test/lib/BookingSelector.test.js`

1. Migrate listener ownership after forcing old-document removal to throw.
2. Start an active selection under the new owner.
3. Invoke the retained old handler and assert no draft update occurs.
4. Invoke the current owner and assert normal completion remains.
5. Run the focused Jest test and confirm the stale event fails first.

### Task 2: Validate event ownership

**Files:**

- Modify: `src/lib/BookingSelector.js`

1. Read `currentTarget` defensively from the mouse event.
2. Return before selection logic when a supplied owner differs from the current listener document.
3. Re-run the focused regression and adjacent listener lifecycle tests.

### Task 3: Preserve maintained contracts

**Files:**

- Modify: `scripts/check-docs-plan.js`
- Modify: `scripts/test-booking-selector-review-mutations.js`
- Modify: `README.md`
- Modify: `SECURITY.md`
- Modify: `VISION.md`
- Modify: `AGENTS.md`
- Modify: `CHANGES.md`

1. Register the completed plan exactly once.
2. Require the source guard, regression name, and owner-isolation guidance.
3. Add a hostile mutation that removes the current-owner check.
4. Record local and hosted verification evidence.

### Task 4: Validate and merge

**Files:**

- Verify only.

1. Run focused Jest coverage and hostile mutations.
2. Run `corepack yarn verify` and repository/external `make check`.
3. Confirm generated `dist/` output contains the same ownership guard.
4. Push a focused PR, attempt Codex review, and merge only the exact green head.

## Verification Completed

- The stale-owner regression failed first because the old document callback
  invoked `updateAvailabilityDraft` after ownership moved.
- The focused regression and ten adjacent document-mouseup tests passed.
- The full Jest suite passed 403 tests and two snapshots with 100% statement,
  branch, function, and line coverage.
- Five hostile review mutations were rejected, including removal of the new
  owner guard.
- Real-browser docs smoke, formatting, lint, Flow/Babel/TypeScript package
  checks, recursive high-severity audit, package contents/runtime, Publint, Are
  The Types Wrong, and `git diff --check` passed locally.
- `corepack yarn verify` passed on Node.js 24.12.0, including 403 tests, two
  snapshots, 100% coverage, five rejected hostile mutations, package checks,
  and the real-browser docs smoke.
- Repository and external `make check` passed on the local toolchain; hosted
  validation remains the final closeout gate.
