# Verify Chain Contract Implementation Plan

**Goal:** Make the repository gate fail closed when a link is dropped from the canonical `verify` chain, including the links that carry the test suite and the hostile-mutation harness.

**Architecture:** `make check` reaches every quality command only through `package.json`'s `verify` chain. The checks that would notice a missing link (`test/lib/package-root.test.js`) run inside that chain via `yarn cover:check`, so removing `cover:check` also removes the only observer of the removal. Assert the chain from `scripts/test-makefile-root.sh`, which `make` runs as a prerequisite of `verify` before `corepack yarn verify` and which therefore survives an emptied chain. Compare parsed `scripts` values so duplicate JSON keys cannot satisfy the contract with dead text. Add a complementary failure-suppression scan to `scripts/check-docs-plan.js`. Do not change component behavior, publication, deployment, or the set of commands the gate runs.

**Tech Stack:** Node.js 20/24, Yarn 4, Jest, GNU Make.

---

## Status: Completed

### Task 1: Prove the Missing Gate

**Files:**

- Verify only.

1. Remove `yarn cover:check` and `yarn review:mutations` from `verify` and confirm `make check` still exits 0 with no test suite executed.
2. Replace `exit $status` with `exit 0` in `cover:check`, break a unit-tested pure function, and confirm `make check` prints the failures and still exits 0.

### Task 2: Assert the Chain on the Surviving Channel

**Files:**

- Modify: `scripts/test-makefile-root.sh`

1. Read `verify` and `cover:check` from `package.json` with a JSON parser.
2. Fail closed when the ordered chain or the `cover:check` exit-status propagation drifts from the reviewed contract.

### Task 3: Reject Failure Suppression in Package Scripts

**Files:**

- Modify: `scripts/check-docs-plan.js`

1. Compare the parsed `verify` chain against the reviewed ordered contract.
2. Pin the reviewed command for each script that wires the gate to a checker.
3. Reject `|| true`, `|| exit 0`, `|| :`, `; true`, `--passWithNoTests`, and `continue-on-error` in any package script.

### Task 4: Synchronize Maintainer Documentation

**Files:**

- Modify: `README.md`
- Modify: `CHANGES.md`
- Modify: `docs/plans/2026-07-17-verify-chain-contract.md`

1. Link this plan exactly once from the README plan inventory.
2. Record the red/green evidence and review status.

### Task 5: Validate the Full Gate

**Files:**

- Verify only.

1. Run `corepack yarn verify`.
2. Run `make check` and `make build` from the checkout.
3. Confirm the checked-in `dist/` tree remains unchanged.

## Verification Completed

- Before the change, stripping `yarn cover:check` and `yarn review:mutations`
  from `verify` left `make check` exiting 0 with zero test suites executed. The
  only assertions covering the chain live in `test/lib/package-root.test.js`,
  which runs inside `yarn cover:check`, so the removal also removed its own
  detector. Stripping `yarn docs:smoke` alone was caught at
  `test/lib/package-root.test.js:45`; stripping it together with
  `yarn cover:check` was not caught at all.
- Before the change, rewriting `cover:check` to end in `exit 0` and breaking
  `getDuplicateValues` in `scripts/check-package-contents.js` produced
  `Tests: 3 failed, 400 passed` beside `Package contents check passed` and
  `All good!` at `make check` exit 0.
- After the change, `scripts/test-makefile-root.sh` rejects the dropped links,
  the reordered chain, the `exit 0` neuter, a duplicate `verify` JSON key whose
  last value guts the chain, and a `|| true` neuter. `make check` exits 2 for
  each, before `corepack yarn verify` runs.
- Removing `yarn docs:check` from `verify` to disable the `check-docs-plan.js`
  contract is rejected by the root-test channel, which `make` runs as a
  prerequisite of `verify`.
- The packed, unpacked, and per-file size ceilings in
  `scripts/check-package-contents.js` were probed and left unchanged: widening
  `MAX_PACKED_SIZE_BYTES` to `128 * 1024` is rejected by the literal byte counts
  asserted in the size-violation test, and respelling the same value as `65536`
  is correctly accepted.
- `make check` passed with 403 tests across 16 suites, five rejected hostile
  mutations, Prettier, ESLint, type checks, audit, package-contents,
  package-runtime, publint, and attw. `make build` passed and
  `git diff --exit-code -- dist` reported no change.
- Hosted Node 20/24 checks remain required before merge.
