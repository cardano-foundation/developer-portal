# Contract library: how the code fits together

The Contracts tab at
[developers.cardano.org/templates/contracts](https://developers.cardano.org/templates/contracts) is a
use-case index: each card is one codebase for a smart-contract pattern (escrow, vesting, HTLC...), shown
with the on-chain and off-chain implementations that exist in it. When a use case has more than one codebase
(say the CF monitoring escrow and MeshJS's escrow), each is its own card, tagged with a "via <source>" label
so they are easy to tell apart. The portal does not host the code; each card links out to where the
implementation lives. This note maps the data layer and how to add an entry.

## Where the data lives

- `src/data/contracts/contracts.js`, the catalog: one entry per use case (field reference in its header).
- `src/data/contracts/tags.js`, the taxonomy: `Categories`, `OnchainLangs`, `OffchainLangs`.
- `src/data/contracts/validation.js`, build-time fail-fast checks.
- `src/data/contracts/showcase.js`, the component-facing adapter.
- `src/data/contracts.js`, the entry point: validates every entry at build and exports the sorted list.
- `src/pages/templates/contracts.js`, the `/templates/contracts` page.

Data flow: `contracts.js` (catalog) -> `contracts.js` entry (validate + sort) -> `showcase.js` (adapter)
-> page.

## What the on-chain / off-chain chips mean

- **On-chain** is the language the validator is written in (Aiken, Scalus).
- **Off-chain** is the SDK that builds and submits the transactions (MeshJS, Evolution, PyCardano,
  CCL Java, Blaze). Each value is a named SDK, not a bare language: MeshJS, Evolution, and Blaze are all
  TypeScript, so tag the SDK a contract actually uses, not the language.

A chip means an implementation in that language exists at the linked source. It is not a claim that the
implementation currently passes its tests; for that, see the upstream repo's own status.

## Provenance

Most entries mirror the Cardano Foundation
[cardano-template-and-ecosystem-monitoring](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring)
repo, which implements the most common use cases across many on-chain and off-chain frameworks. Others point
at MeshJS or Anastasia Labs. Each codebase is its own entry, and the "via <source>" label on the card is
derived from the repo owner (see `SOURCE_LABELS` in `showcase.js`). The same off-chain SDK can honestly
appear on more than one card: the monitoring repo ships a MeshJS escrow AND MeshJS's own library has one, so
both cards list MeshJS. This page is a curated index over those sources, not a mirror of their code. To add a
new implementation, contribute it upstream first, then reflect it here.

## Adding a contract

1. **Add the entry.** Append to `src/data/contracts/contracts.js` (field reference in the header there).
2. **Extend the taxonomy if needed.** If your `category`, on-chain, or off-chain language is not already in
   `src/data/contracts/tags.js`, add it there first. The build validation lists the allowed values if you
   miss this.
3. **Validate.** Run `yarn build`. A fail-fast check catches missing or invalid fields and points at the
   problem. Then eyeball `/templates/contracts`.

Unlike the app-starter templates (whose slug is derived from the project folder), a contract `slug` is set
explicitly on the entry. It is a stable key for the card, so keep it unique and do not rename it casually.
To add a second codebase for an existing use case, append another entry with the same `title` and a unique
slug (e.g. `escrow-meshjs`); the source label keeps the cards apart.

### Entry reference

```js
{
  // Required
  title: "Escrow",                       // display name
  slug: "escrow",                        // stable, explicit, unique key
  description: "Hold assets from two parties until both sign off.", // one sentence
  category: "payments",                  // one id from Categories (tags.js)
  repoUrl: `${MONITORING_BASE}/escrow`,  // where to view the implementations

  // Optional
  onchain: ["aiken"],                                    // ids from OnchainLangs (tags.js)
  offchain: ["ccl", "evolution", "meshjs", "pycardano"], // ids from OffchainLangs (tags.js)
}
```

- `category`, `onchain`, and `offchain` must use ids that exist in `tags.js`; the gallery's filters are
  built from that taxonomy.
- A card links to one place (`repoUrl`). A different codebase of the same use case is its own entry, not a
  second link.
- Mark `reference: true` for a use case that is a written specification with no runnable code yet. The card
  shows a muted "Reference" chip and you may omit `onchain` / `offchain`.

## What belongs here

A curated index of canonical, maintained use-case implementations. Point at the established source; do not
fork code into the portal. Anything better suited to its own repository belongs there.
