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

// repoUrl is each card's React key; enforce uniqueness at build so a duplicate
// (the same codebase listed twice) fails loudly instead of silently.
const repoUrls = Contracts.map((c) => c.repoUrl);
const duplicateRepoUrl = repoUrls.find((url, i) => repoUrls.indexOf(url) !== i);
if (duplicateRepoUrl) {
  throw new Error(
    `Duplicate contract repoUrl "${duplicateRepoUrl}" in contracts.js; each entry must link to a distinct repo.`
  );
}

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
