// ============================================================================
// Builder Tools - Main Entry Point
// ============================================================================
// This file imports, validates, sorts, and exports builder tools data.
// Contributors: edit ./builder-tools/tools.js to add your tool.
// ============================================================================

import { sortBy } from "@site/src/utils/jsUtils";
import { BuilderTools } from "./builder-tools/tools";
import { Tags, TagList, LanguagesOrTechnologiesTags, DomainsTags } from "./builder-tools/tags";
import { ensureBuilderToolValid } from "./builder-tools/validation";

// Sort builder tools: alphabetically by title, with favorites first
function sortBuilderTools() {
  let result = BuilderTools;
  result = sortBy(result, (tool) => tool.title.toLowerCase());
  result = sortBy(result, (tool) => !tool.tags.includes("favorite"));
  return result;
}

// Validate all builder tools
BuilderTools.forEach(ensureBuilderToolValid);

// Exports
export const SortedBuilderTools = sortBuilderTools();
export { BuilderTools, Tags, TagList, LanguagesOrTechnologiesTags, DomainsTags };
