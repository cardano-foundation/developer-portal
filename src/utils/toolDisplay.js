// Shared helpers for the builder-tools listing: NEW badge for recently added
// tools and card blurbs.

import {
  Showcases,
  RECENT_TOOLS_COUNT,
} from "@site/src/data/builder-tools/showcase";

const RECENT_SLUGS = new Set(
  Showcases.slice(-RECENT_TOOLS_COUNT).map((s) => s.slug)
);

export function getToolBlurb(tool) {
  return tool.tagline || tool.description || "";
}

export function isRecent(tool) {
  return RECENT_SLUGS.has(tool.slug);
}
