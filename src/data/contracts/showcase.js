// ============================================================================
// Contracts - showcase data (component-facing surface)
// ============================================================================
// Shapes the raw contract entries for the listing component and re-exports the
// taxonomy. adapt() fills default onchain/offchain arrays and derives the
// "via <source>" label from the repo owner, keeping a single import surface for
// the page.
// ============================================================================

import {
  Contracts,
  SortedContracts,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "@site/src/data/contracts";

export {
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
};

// The card shows where a codebase lives ("via <source>"). Derive it from the
// repo owner so contributors don't repeat a source field on every entry; add a
// nicer display label here when a new owner shows up.
const SOURCE_LABELS = {
  "cardano-foundation": "CF monitoring",
  MeshJS: "MeshJS",
  "Anastasia-Labs": "Anastasia Labs",
};

function sourceLabel(contract) {
  try {
    const owner = new URL(contract.repoUrl).pathname.split("/").filter(Boolean)[0];
    return SOURCE_LABELS[owner] || owner;
  } catch (e) {
    return null;
  }
}

function adapt(contract) {
  return {
    ...contract,
    onchain: contract.onchain || [],
    offchain: contract.offchain || [],
    source: sourceLabel(contract),
  };
}

export const ContractShowcases = Contracts.map(adapt);
export const SortedContractShowcases = SortedContracts.map(adapt);
