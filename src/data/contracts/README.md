# Contract library: how the code fits together

The Contracts tab at
[developers.cardano.org/templates/contracts](https://developers.cardano.org/templates/contracts) is a
use-case index: each entry is a smart-contract pattern (escrow, vesting, HTLC...) shown with the on-chain
and off-chain implementations that exist for it. The portal does not host the code; each card links out to
where the implementations live. This note maps the data layer and how to add an entry.

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
- **Off-chain** is the SDK or language that builds and submits the transactions (MeshJS, Evolution,
  PyCardano, CCL Java, Blaze, TypeScript).

A chip means an implementation in that language exists at the linked source. It is not a claim that the
implementation currently passes its tests; for that, see the upstream repo's own status.

## Provenance

Most entries mirror the Cardano Foundation
[cardano-template-and-ecosystem-monitoring](https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring)
repo, which implements the most common use cases across many on-chain and off-chain frameworks. A few
entries point at other curated sources (MeshJS, Anastasia Labs) via `repoUrl` / `altSources`. This page is
a curated index over those sources, not a mirror of their code. To add a new implementation of an existing
use case, contribute it upstream first, then reflect it here.

## Adding a contract

1. **Add the entry.** Append to `src/data/contracts/contracts.js` (field reference in the header there).
2. **Extend the taxonomy if needed.** If your `category`, on-chain, or off-chain language is not already in
   `src/data/contracts/tags.js`, add it there first. The build validation lists the allowed values if you
   miss this.
3. **Validate.** Run `yarn build`. A fail-fast check catches missing or invalid fields and points at the
   problem. Then eyeball `/templates/contracts`.

Unlike the app-starter templates (whose slug is derived from the project folder), a contract `slug` is set
explicitly on the entry. It is a stable key for the card, so keep it unique and do not rename it casually.

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
  altSources: [{ label: "MeshJS", url: "https://meshjs.dev/smart-contracts/escrow" }],
}
```

- `category`, `onchain`, and `offchain` must use ids that exist in `tags.js`; the gallery's filters are
  built from that taxonomy.
- Mark `reference: true` for a use case that is a written specification with no runnable code yet. The card
  shows a muted "Reference" chip and you may omit `onchain` / `offchain`.

## What belongs here

A curated index of canonical, maintained use-case implementations. Point at the established source; do not
fork code into the portal. Anything better suited to its own repository belongs there.
