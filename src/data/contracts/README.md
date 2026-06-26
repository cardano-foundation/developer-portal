# Contract library: a curated aggregator

The Contracts tab at
[developers.cardano.org/templates/contracts](https://developers.cardano.org/templates/contracts) is a
best attempt at a **aggregator**, and not necessarily a new canonical directory. Each card is one codebase for a smart-contract use
case (escrow, vesting, an AMM...). We mirror a few open Cardano sources that are themselves collections,
and we are also open to indexing standalone contracts not captured by any of them.

## The model: `source` vs `repoUrl`

Every entry carries up to two provenance facts:

- **`source`** (optional) names which collection we aggregated the entry from. It drives the "via
 SOURCE" credit on the card and the "Aggregated from" strip in the page header. The sources are a small,
 curated set (see `sources.js`) listed. A standalone contract not from a
  listed source omits it and is credited by its own repo owner instead, staying out of the strip.
- **`repoUrl`** (required) links to the contract's OWN code, which we never re-host.

For self-hosting catalogs (monitoring, MeshJS, Anastasia) `source` and `repoUrl` point at the same place.
For a list like awesome-aiken they diverge: the source is the list, but the `repoUrl` is the project's own
repo (Minswap, SundaeSwap, Jpg Store...). That divergence, plus the standalone case, is why they are
separate fields. We point at the established repository.

## Where the data lives

- `src/data/contracts/contracts.js`, the catalog: one entry per codebase (field reference in its header).
- `src/data/contracts/sources.js`, the sources: the collections we aggregate from (`SOURCES`, `SOURCE_IDS`).
- `src/data/contracts/tags.js`, the taxonomy: `Categories`, `OnchainLangs`, `OffchainLangs`.
- `src/data/contracts/validation.js`, build-time fail-fast checks (a valid `source` when set, a GitHub `repoUrl`).
- `src/data/contracts/showcase.js`, the component-facing adapter.
- `src/data/contracts.js`, the entry point: validates every entry at build and exports the sorted list.
- `src/pages/templates/contracts.js`, the `/templates/contracts` page.

Data flow: `contracts.js` (catalog) -> `contracts.js` entry (validate + sort) -> `showcase.js` (adapter)
-> page. `sources.js` and `tags.js` are the two source-of-truth lookups, imported by validation and showcase.

## What the on-chain / off-chain chips mean

- **On-chain** is the language the validator is written in (Aiken, Scalus).
- **Off-chain** is the SDK that builds and submits the transactions (MeshJS, Evolution, PyCardano,
  CCL Java, Blaze). Each value is a named SDK, not a bare language: MeshJS, Evolution, and Blaze are all
  TypeScript, so tag the SDK a contract actually uses, not the language.

A chip means an implementation in that language exists at the linked source. It is not a claim that the
implementation currently passes its tests; for that, see the upstream repo's own status. Entries pulled
from the awesome-aiken list reference the on-chain Aiken side, so they carry no off-chain chip.

## Adding a contract

1. **Add the entry.** Append to `src/data/contracts/contracts.js` (field reference in the header there).
2. **Set its `repoUrl`.** The single canonical GitHub link to where this codebase lives. A different
   codebase of the same use case is its own entry, not a second link.
3. **Set its `source`, or omit it.** If the contract comes from a listed collection, set `source` to a
   `SOURCES` id from `sources.js` (`monitoring`, `anastasia`, `awesomeAiken`, `meshjs`); it then shows
   "via &lt;source&gt;" and counts toward the strip. For a standalone contract not from a listed source, leave
   `source` off; it shows "via &lt;its repo owner&gt;" and stays out of the strip. The build fails only if
   `source` is set to an unknown id.
4. **Extend the taxonomy if needed.** If your `category`, on-chain, or off-chain language is not already in
   `tags.js`, add it there first. Validation lists the allowed values if you miss this.
5. **Validate.** Run `yarn build`. The fail-fast check catches missing or invalid fields and points at the
   problem. Then eyeball `/templates/contracts`.

Each card is identified by its `repoUrl` (every entry links to a distinct repo), so there is no id to
manage. To list the same use case from two sources, add two entries with the same `title` and different
repos (e.g. the CF monitoring escrow and the MeshJS escrow); the "via &lt;source&gt;" label keeps the cards
apart.

## Adding a source

Sources are the few collections this page aggregates from (the avatars in the header strip). To add one,
add an entry to `SOURCES` in `src/data/contracts/sources.js` with a `label` and a `url` (the avatar is
taken from the url owner's GitHub avatar), then tag contracts with that source id. Keep the set small and
curated. To get a contract listed you can land it in one of those sources upstream (for example, open a PR
on [awesome-aiken](https://github.com/aiken-lang/awesome-aiken)), propose a new source, or add it directly
as a standalone entry (no `source`).
