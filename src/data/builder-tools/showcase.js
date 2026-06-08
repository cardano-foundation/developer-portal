// ============================================================================
// Builder Tools - showcase adapter (DISPOSABLE)
// ============================================================================
// UX-only pass: this module bridges the EXISTING builder-tools data (tools.js +
// tags.js, both frozen) into the shape the ported app-store components expect
// (single `category` + additive `properties`, `maintainerPick`, `slug`).
//
// The mapping here is intentionally mechanical and rough. It is meant to be
// thrown away and replaced when the real taxonomy / tag rework happens. Do not
// build durable logic on top of it.
//   - category   = the tool's first DomainsTags tag (fallback "other")
//   - properties = its remaining tags (languages + any extra domains), minus "favorite"
//   - maintainerPick = tags.includes("favorite")  (the old "Our favorites")
// ============================================================================

import {
  BuilderTools,
  SortedBuilderTools,
  Tags as TagMeta,
  DomainsTags,
  LanguagesOrTechnologiesTags,
} from "@site/src/data/builder-tools";

// Which domain categories lead "Browse by category" (prominent) vs. the lower
// "Browse tools by category" band (compact). Rough split, refine on the data day.
const PROMINENT = new Set([
  "smartcontracts",
  "transactionbuilder",
  "serialization",
  "wallet",
  "nft",
  "governance",
  "provider",
  "indexer",
  "nodeclient",
]);

function buildCategories() {
  const cats = {};
  DomainsTags.forEach((tag) => {
    const meta = TagMeta[tag] || {};
    cats[tag] = {
      label: meta.label || tag,
      description: meta.description || "",
      color: meta.color || "#607D8B",
      // Tools have no on-chain tx data, so nothing is "trackable". This single
      // flag is what disables the whole activity/most-active subsystem.
      trackable: false,
      prominent: PROMINENT.has(tag),
    };
  });
  cats.other = {
    label: "Other",
    description: "Tools that don't fit a primary category yet.",
    color: "#607D8B",
    trackable: false,
    prominent: false,
  };
  return cats;
}

function buildProperties() {
  const props = {};
  LanguagesOrTechnologiesTags.forEach((tag) => {
    const meta = TagMeta[tag] || {};
    props[tag] = {
      label: meta.label || tag,
      description: meta.description || "",
      color: meta.color || "#888",
    };
  });
  return props;
}

export const Categories = buildCategories();
export const Properties = buildProperties();

// Backwards-compat union for components that look up tag metadata by name
// without caring which axis it belongs to.
export const Tags = { ...Categories, ...Properties };

export const CategoryList = Object.keys(Categories);
export const PropertyList = Object.keys(Properties);

// "NEW" badge + "Recently added" use the last N entries in insertion order.
export const RECENT_APPS_COUNT = 5;

function slugify(title) {
  return String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function adapt(tool) {
  const category = tool.tags.find((t) => DomainsTags.includes(t)) || "other";
  const properties = tool.tags.filter((t) => t !== "favorite" && t !== category);
  return {
    title: tool.title,
    description: tool.description,
    website: tool.website,
    getstarted: tool.getstarted ?? null,
    slug: slugify(tool.title),
    category,
    properties,
    maintainerPick: tool.tags.includes("favorite"),
    icon: null, // no icons this pass: AppIcon renders a colored-initial fallback
  };
}

// `Showcases` keeps insertion order (drives "recently added" / NEW).
// `SortedShowcases` is favorites-first then alphabetical (drives "Featured").
export const Showcases = BuilderTools.map(adapt);
export const SortedShowcases = SortedBuilderTools.map(adapt);
