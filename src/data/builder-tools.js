// ============================================================================
// Builder Tools - Main Entry Point
// ============================================================================
// This file imports, validates, sorts, and exports builder tools data.
// Contributors: edit ./builder-tools/tools.js to add your tool.
// ============================================================================

import { sortBy } from "../utils/jsUtils";
import { Showcases } from "./builder-tools/tools";
import { Tags, TagList, LanguagesOrTechnologiesTags, DomainsTags } from "./builder-tools/tags";
import { ensureShowcaseValid } from "./builder-tools/validation";

// Sort showcases: alphabetically by title, with favorites first
function sortShowcases() {
  let result = Showcases;
  result = sortBy(result, (showcase) => showcase.title.toLowerCase());
  result = sortBy(result, (showcase) => !showcase.tags.includes("favorite"));
  return result;
}

// Validate all showcases
Showcases.forEach(ensureShowcaseValid);

// Exports
export const SortedShowcases = sortShowcases();
export { Showcases, Tags, TagList, LanguagesOrTechnologiesTags, DomainsTags };
