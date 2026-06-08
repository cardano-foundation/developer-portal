// ============================================================================
// Builder Tools - showcase data (component-facing surface)
// ============================================================================
// Reads the explicit `category` / `properties` / `maintainerPick` now carried by
// each tools.js entry (no more derivation) and shapes them for the app-store
// components: adds a `slug` and re-exports the taxonomy. Icons are not sourced
// yet, so `icon` is null and AppIcon renders a colored-initial fallback.
// ============================================================================

import {
  BuilderTools,
  SortedBuilderTools,
  Categories,
  Properties,
  Tags,
  CategoryList,
  PropertyList,
  LanguageList,
  InterfaceList,
} from "@site/src/data/builder-tools";

export {
  Categories,
  Properties,
  Tags,
  CategoryList,
  PropertyList,
  LanguageList,
  InterfaceList,
};

// "NEW" badge + "Recently added" use the last N entries in insertion order.
export const RECENT_APPS_COUNT = 5;

// MUST byte-match slugify() in plugins/tools-routes/index.js (detail routes).
function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function adapt(tool) {
  return {
    title: tool.title,
    description: tool.description,
    website: tool.website,
    getstarted: tool.getstarted ?? null,
    slug: slugify(tool.title),
    category: tool.category,
    properties: tool.properties || [],
    maintainerPick: !!tool.maintainerPick,
    icon: null,
  };
}

// `Showcases` keeps insertion order (drives "recently added" / NEW).
// `SortedShowcases` is maintainer-picks-first then alphabetical (drives "Featured").
export const Showcases = BuilderTools.map(adapt);
export const SortedShowcases = SortedBuilderTools.map(adapt);
