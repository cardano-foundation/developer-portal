import { difference } from "@site/src/utils/jsUtils";
import { OnchainList, OffchainList, CategoryList } from "./tags";
import { SOURCE_IDS } from "./sources";

// Fail-fast on common errors (runs at build via src/data/contracts.js).
export function ensureContractValid(contract) {
  function checkFields() {
    const validKeys = [
      "title",
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

  // source is optional: set it when the contract comes from a listed source; a
  // standalone contract omits it and is credited by its repo owner.
  function checkSource() {
    if (contract.source && !SOURCE_IDS.includes(contract.source)) {
      throw new Error(
        `bad source=[${contract.source}]. Available: ${SOURCE_IDS.join(", ")}`
      );
    }
  }

  // repoUrl must be a GitHub url so the maker credit can derive an owner.
  function checkRepoUrl() {
    let host;
    try {
      host = new URL(contract.repoUrl).hostname.replace(/^www\./, "");
    } catch (e) {
      throw new Error(`repoUrl is not a valid url: ${contract.repoUrl}`);
    }
    if (host !== "github.com") {
      throw new Error(`repoUrl must be a github.com url, got ${host}`);
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
    ["title", "description", "repoUrl"].forEach(checkRequired);
    checkCategory();
    checkSource();
    checkRepoUrl();
    checkLangs("onchain", OnchainList);
    checkLangs("offchain", OffchainList);
  } catch (e) {
    throw new Error(`Contract with title=${contract.title} contains errors:\n${e.message}`);
  }
}
