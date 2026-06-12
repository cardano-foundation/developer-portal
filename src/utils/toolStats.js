// Shared helpers for the builder-tools listing: NEW badge for recently added
// tools, card blurbs, and category/property matching for the filter panel.

import {
  Showcases,
  RECENT_APPS_COUNT,
} from "@site/src/data/builder-tools/showcase";

const RECENT_SLUGS = new Set(
  Showcases.slice(-RECENT_APPS_COUNT).map((s) => s.slug)
);

export function getAppBlurb(app) {
  return app.tagline || app.description || "";
}

export function isRecent(app) {
  return RECENT_SLUGS.has(app.slug);
}

export function appHasTag(app, tag) {
  return app.category === tag || (app.properties || []).includes(tag);
}
