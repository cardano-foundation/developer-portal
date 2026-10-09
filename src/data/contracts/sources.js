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
// page), NOT a ranking by count. The first MAX_SOURCE_AVATARS sources render as
// local-icon avatars (see `icon`); the rest fold into the "+N more" overflow.
// We self-host the icons under /img/... rather than hot-linking GitHub avatars,
// which the deployed portal's Content-Security-Policy (netlify.toml `img-src`)
// blocks. Anastasia Labs is deliberately last because we don't host a logo for
// it, so it lives in the text-only overflow and needs no `icon`.
// ============================================================================

export const SOURCES = {
  monitoring: {
    label: "CF monitoring",
    url: "https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring",
    icon: "/img/tools/cardano-foundation.png",
  },
  awesomeAiken: {
    label: "awesome-aiken",
    url: "https://github.com/aiken-lang/awesome-aiken",
    icon: "/img/tools/aiken.png",
  },
  meshjs: {
    label: "MeshJS",
    url: "https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src",
    icon: "/img/tools/mesh.png",
  },
  // Overflow-only (no icon): folds into the "+N more" link, not shown as an avatar.
  anastasia: {
    label: "Anastasia Labs",
    url: "https://github.com/Anastasia-Labs",
  },
};

// How many sources show as avatars before the rest fold into "+N more". Single
// source of truth, shared by the page (rendering) and catalog.js (validation).
export const MAX_SOURCE_AVATARS = 3;

// Valid `source` ids. validation.js checks a contract's `source` against this
// when one is set (a standalone contract may omit it).
export const SOURCE_IDS = Object.keys(SOURCES);
