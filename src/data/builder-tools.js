// ============================================================================
// Builder Tools - Main Entry Point
// ============================================================================
// Imports, validates, sorts, and exports builder tools data + taxonomy.
// Contributors: edit ./builder-tools/tools.js to add your tool.
// ============================================================================

import { sortBy } from "@site/src/utils/jsUtils";
import { BuilderTools } from "./builder-tools/tools";
import {
  Categories,
  Properties,
  Tags,
  CategoryList,
  PropertyList,
  LanguageList,
  InterfaceList,
} from "./builder-tools/tags";
import { ensureBuilderToolValid } from "./builder-tools/validation";

// Sort: alphabetically by title, with maintainer picks first.
function sortBuilderTools() {
  let result = BuilderTools;
  result = sortBy(result, (tool) => tool.title.toLowerCase());
  result = sortBy(result, (tool) => !tool.maintainerPick);
  return result;
}

// Validate all builder tools at build time.
BuilderTools.forEach(ensureBuilderToolValid);

export const SortedBuilderTools = sortBuilderTools();
export {
  BuilderTools,
  Categories,
  Properties,
  Tags,
  CategoryList,
  PropertyList,
  LanguageList,
  InterfaceList,
};
