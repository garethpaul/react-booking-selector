# Docs Smoke Verify Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Make the repository-standard `verify` and `make check` gates execute the existing real-browser documentation smoke test.

**Architecture:** Keep `scripts/smoke-docs.js` as the single owner of Chrome discovery, screenshot integrity, DOM, and responsive layout checks. Add its existing `docs:smoke` package script to the canonical `verify` sequence, with a root-contract test that fails if the gate is removed. Do not add pixel-golden infrastructure, new dependencies, component behavior, publication, or deployment changes.

**Tech Stack:** Node.js 20/24, Yarn 4, Jest, headless Chrome/Chromium, GNU Make.

---

## Status: Completed

### Task 1: Prove the Missing Gate

**Files:**

- Modify: `test/lib/package-root.test.js`

1. Add an assertion that `package.json`'s `verify` script includes `yarn docs:smoke` exactly once after `yarn docs:check`.
2. Run the focused package-root test and confirm it fails because the smoke command is absent.

### Task 2: Add the Canonical Smoke Gate

**Files:**

- Modify: `package.json`

1. Add `yarn docs:smoke` immediately after `yarn docs:check` in `verify`.
2. Run the focused package-root test and confirm it passes.
3. Run `corepack yarn docs:smoke` with the supported Node 24 toolchain.

### Task 3: Synchronize Maintainer Documentation

**Files:**

- Modify: `README.md`
- Modify: `VISION.md`
- Modify: `CHANGES.md`
- Modify: `docs/plans/2026-06-26-docs-smoke-verify-gate.md`

1. State that the canonical verification gate executes the real-browser smoke checks.
2. Link this plan exactly once from the README plan inventory.
3. Move the roadmap item from future work into the maintained baseline.
4. Record the red/green evidence, browser version, hosted validation requirement, and review status.
5. Mark this plan completed only after all local validation passes.

### Task 4: Validate the Full Gate

**Files:**

- Verify only.

1. Run `corepack yarn verify` under Node 24.
2. Run `/usr/bin/make check` from the checkout and via its absolute Makefile path from `/tmp`.
3. Run `git diff --check` and confirm the checked-in `dist/` tree remains unchanged.
4. Push a focused PR, attempt Codex review, and merge only the exact green head.

## Verification Completed

- The package-root contract failed with zero `yarn docs:smoke` commands before
  the gate changed, then passed with exactly one command immediately after
  `yarn docs:check`.
- A Chrome-minimum-width regression failed at a 500px mobile layout before the
  iframe-owned viewport change, then passed at the requested 390px and 320px
  widths.
- Google Chrome 149.0.7827.155 completed the desktop, mobile, and narrow-mobile
  screenshots plus DOM and horizontal-overflow checks.
- Focused Jest coverage passed 25 tests across the package-root and docs-smoke
  suites.
- Node 24 `corepack yarn verify`, checkout-local `make check`, and the absolute
  Makefile gate from `/tmp` passed with 401 tests, four rejected hostile
  mutations, audit, package-runtime, package-content, publint, and type checks.
- The checked-in `dist/` tree remained unchanged. Hosted Node 20/24 checks remain
  required before merge.
