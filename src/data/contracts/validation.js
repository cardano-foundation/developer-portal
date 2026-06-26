import { difference } from "@site/src/utils/jsUtils";
import { OnchainList, OffchainList, CategoryList } from "./tags";

// Fail-fast on common errors (runs at build via src/data/contracts.js).
export function ensureContractValid(contract) {
  function checkFields() {
    const validKeys = [
      "title",
      "slug",
      "description",
      "category",
      "onchain",
      "offchain",
      "repoUrl",
      "reference",
      "source",
    ];
    const unknownKeys = difference(Object.keys(contract), validKeys);
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown attribute names=[${unknownKeys.join(",")}]`);
    }
  }

  function checkRequired(field) {
    if (!contract[field]) throw new Error(`${field} is missing`);
  }

  function checkCategory() {
    if (!CategoryList.includes(contract.category)) {
      throw new Error(
        `bad category=[${contract.category}]. Available: ${CategoryList.join(", ")}`
      );
    }
  }

  function checkLangs(field, list) {
    const value = contract[field];
    if (value === undefined) {
      // onchain/offchain may be omitted entirely for reference-only entries.
      if (contract.reference) return;
      throw new Error(`${field} must be an array (it may be empty)`);
    }
    if (!Array.isArray(value)) {
      throw new Error(`${field} must be an array`);
    }
    const unknown = difference(value, list);
    if (unknown.length > 0) {
      throw new Error(`unknown ${field}=[${unknown.join(", ")}]. Available: ${list.join(", ")}`);
    }
  }

  try {
    checkFields();
    ["title", "slug", "description", "repoUrl"].forEach(checkRequired);
    checkCategory();
    checkLangs("onchain", OnchainList);
    checkLangs("offchain", OffchainList);
  } catch (e) {
    throw new Error(`Contract with title=${contract.title} contains errors:\n${e.message}`);
  }
}
