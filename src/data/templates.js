// ============================================================================
// Templates - Main Entry Point
// ============================================================================
// Imports, validates, sorts, and exports template data + taxonomy.
// Contributors: edit ./templates/templates.js to add your template.
// ============================================================================

import { sortBy } from "@site/src/utils/arrays";
import { Templates } from "./templates/templates";
import {
  Frameworks,
  Sdks,
  Wallets,
  FrameworkList,
  SdkList,
  WalletList,
} from "./templates/tags";
import { ensureTemplateValid } from "./templates/validation";

// Sort: alphabetically by title, with maintainer picks first.
function sortTemplates() {
  let result = Templates;
  result = sortBy(result, (template) => template.title.toLowerCase());
  result = sortBy(result, (template) => !template.maintainerPick);
  return result;
}

// Validate all templates at build time.
Templates.forEach(ensureTemplateValid);

export const SortedTemplates = sortTemplates();
export {
  Templates,
  Frameworks,
  Sdks,
  Wallets,
  FrameworkList,
  SdkList,
  WalletList,
};
