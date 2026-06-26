# Stale document mouseup ownership design

## Status: Completed

## Problem

When a rendered booking grid moves between documents, listener synchronization
removes the old document's `mouseup` handler before attaching to the new owner.
If that removal throws, the old handler is intentionally retained for later
cleanup. While the component remains mounted, however, a mouseup dispatched by
that stale document still reaches `handleDocumentMouseUpEvent` and can finish a
selection currently owned by the new document.

## Options considered

1. Inspect `event.target.ownerDocument`. This fails for null targets and for
   document targets whose owner document is not useful.
2. Store a separate closure for every document that captures its owner. This is
   robust but adds handler maps and changes every add/remove identity contract.
3. Compare the native listener event's `currentTarget` with the currently
   retained `documentMouseUpTarget`. Browser event dispatch sets
   `currentTarget` to the document whose listener is running, while direct unit
   calls can continue omitting it.

## Decision

Use option 3. Reject a document mouseup when it identifies a non-current
listener owner before inspecting the selection or event target. Keep the
existing retry set and listener identity unchanged.

## Verification

- Simulate failed removal during first-to-second-document migration.
- Invoke the retained old handler with the old document as `currentTarget` and
  prove it cannot update or complete the new owner's selection.
- Prove the current document event still completes the same selection.
- Add mutation-sensitive plan/source/test contracts and run the canonical gate.

## Verification Completed

- The focused regression failed before implementation because the stale owner
  invoked `updateAvailabilityDraft`.
- Adjacent document-listener tests and five hostile mutations passed after the
  owner check was added.
- `corepack yarn verify` passed on Node.js 24.12.0, and repository/external
  `make check` passed on the local toolchain.
