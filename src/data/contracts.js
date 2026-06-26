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

// Slugs are React keys and stable ids (the split cards rely on them); enforce
// uniqueness at build so a collision fails loudly instead of silently.
const slugs = Contracts.map((c) => c.slug);
const duplicateSlug = slugs.find((slug, i) => slugs.indexOf(slug) !== i);
if (duplicateSlug) {
  throw new Error(
    `Duplicate contract slug "${duplicateSlug}" in contracts.js; slugs must be unique.`
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
