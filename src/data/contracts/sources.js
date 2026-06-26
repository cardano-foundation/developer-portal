// ============================================================================
// Contracts - sources (the collections this page aggregates from)
// ============================================================================
// This page aims to be an aggregator, not a new canonical directory. Most entries
// are pulled from a few open Cardano sources that are themselves collections (the
// Cardano Foundation monitoring repo, the MeshJS contract library, the
// aiken-lang/awesome-aiken list). It is also open to indexing standalone contracts
// not captured by any of them.
//
// A contract carries two facts on purpose:
//   - `source`  (optional) names which of these collections we aggregated it from.
//               It drives the "via <source>" credit on the card and the
//               "Aggregated from" strip. A standalone contract omits it and is
//               credited by its repo owner instead.
//   - `repoUrl` links straight to the contract's OWN code, which we never re-host.
// They coincide for catalogs that host their own code (monitoring, MeshJS,
// Anastasia) and diverge for a list like awesome-aiken (source = the list,
// repoUrl = the project's own repo, e.g. Minswap). Add or propose a source here.
//
// Declaration order is the strip's editorial order (which avatars represent the
// page), NOT a ranking by count. MeshJS is deliberately last: its GitHub mark is
// near-invisible on a light background, so it folds into the "+N more" overflow.
// ============================================================================

export const SOURCES = {
  monitoring: {
    label: "CF monitoring",
    url: "https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring",
  },
  anastasia: {
    label: "Anastasia Labs",
    url: "https://github.com/Anastasia-Labs",
  },
  awesomeAiken: {
    label: "awesome-aiken",
    url: "https://github.com/aiken-lang/awesome-aiken",
  },
  meshjs: {
    label: "MeshJS",
    url: "https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src",
  },
};

// Valid `source` ids. validation.js checks a contract's `source` against this
// when one is set (a standalone contract may omit it).
export const SOURCE_IDS = Object.keys(SOURCES);
