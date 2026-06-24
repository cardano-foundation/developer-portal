// ============================================================================
// Contracts - Main Entry Point
// ============================================================================
// Imports, validates, sorts, and exports contract data + taxonomy.
// Contributors: edit ./contracts/contracts.js to add a contract.
// ============================================================================

import { sortBy } from "@site/src/utils/jsUtils";
import { Contracts } from "./contracts/contracts";
import {
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "./contracts/tags";
import { ensureContractValid } from "./contracts/validation";

// Sort alphabetically by title.
function sortContracts() {
  return sortBy(Contracts, (contract) => contract.title.toLowerCase());
}

// Validate all contracts at build time.
Contracts.forEach(ensureContractValid);

export const SortedContracts = sortContracts();
export {
  Contracts,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
};
