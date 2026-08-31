// ============================================================================
// Builder Tools - catalog (component-facing surface)
// ============================================================================
// Reads the explicit `category` / `properties` / `maintainerPick` now carried by
// each tools.js entry (no more derivation) and shapes them for the tools
// components: adds a `slug` and re-exports the taxonomy. Most entries carry an
// `icon`; where it is null ToolIcon renders a letter-avatar fallback instead.
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
export const RECENT_TOOLS_COUNT = 5;

// Slug derivation lives in ./slug.js, shared with plugins/tools-routes.
import { slugify } from "./slug";

function adapt(tool) {
  return {
    title: tool.title,
    description: tool.description,
    website: tool.website,
    docs: tool.docs ?? null,
    repository: tool.repository ?? null,
    slug: slugify(tool.title),
    category: tool.category,
    properties: tool.properties || [],
    maintainerPick: !!tool.maintainerPick,
    icon: tool.icon ?? null,
  };
}

// `Tools` keeps insertion order (drives "recently added" / NEW).
// `SortedTools` is maintainer-picks-first then alphabetical (drives "Featured").
export const Tools = BuilderTools.map(adapt);
export const SortedTools = SortedBuilderTools.map(adapt);
