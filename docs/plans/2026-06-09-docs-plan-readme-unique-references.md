# Docs Plan README Unique References

## Status: Completed

## Context

`docs:check` already required README to link every canonical plan under
`docs/plans/` and rejected README links to deleted plans, but duplicate plan
links could still accumulate as maintenance notes were appended over time.
Duplicate references make the README plan index harder to scan and can hide
which plan entry is intended to be canonical.

## Plan

- Count README references to each canonical `docs/plans/*.md` path.
- Fail `docs:check` when README references the same plan more than once.
- Add black-box regression coverage for duplicate README plan links.
- Record the completed guard in README, VISION, CHANGES, and this plan.

## Verification

- corepack yarn verify
- make check
