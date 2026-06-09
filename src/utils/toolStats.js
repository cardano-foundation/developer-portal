// ============================================================================
// toolStats - trimmed, stubbed port of cardano-org's appStats.js
// ============================================================================
// Tools are not on-chain apps, so there is no transaction data. The tx-based
// helpers are stubbed to neutral values, which makes every tx-gated UI branch
// (activity badges, "tracked" dot, "Most active") self-hide. The non-tx helpers
// (recent/NEW, blurb, tag matching) are real. Only the exports the tools UI
// actually imports are kept; re-port the rest from appStats.js if ever needed.
// ============================================================================

import {
  Categories,
  Showcases,
  RECENT_APPS_COUNT,
} from "@site/src/data/builder-tools/showcase";

const RECENT_SLUGS = new Set(
  Showcases.slice(-RECENT_APPS_COUNT).map((s) => s.slug)
);

export function getAppStats() {
  return null;
}

export function compareByTxDesc() {
  return 0;
}

export function isTrackable(app) {
  return Categories[app.category]?.trackable ?? false;
}

export function getAppBlurb(app) {
  return app.tagline || app.description || "";
}

export function isRecent(app) {
  return RECENT_SLUGS.has(app.slug);
}

export function appHasTag(app, tag) {
  return app.category === tag || (app.properties || []).includes(tag);
}

export function formatTxCountCompact(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(num);
}
