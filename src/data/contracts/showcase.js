// ============================================================================
// Contracts - showcase data (component-facing surface)
// ============================================================================
// Shapes the raw contract entries for the listing component and re-exports the
// taxonomy. The slug is explicit on each entry, so this adapter is a thin pass
// through that keeps a single import surface for the page.
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

function adapt(contract) {
  return {
    ...contract,
    onchain: contract.onchain || [],
    offchain: contract.offchain || [],
  };
}

export const ContractShowcases = Contracts.map(adapt);
export const SortedContractShowcases = SortedContracts.map(adapt);
