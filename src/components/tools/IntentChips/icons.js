import React from "react";

// Line glyphs for the intent tiles, one per intent id.
//
// Authored inline rather than pulled from static/img/icons: that set is solid
// (FontAwesome-derived) and reads much heavier than these tiles want. Stroke
// weight and size are uniform across all eight so the row stays even, and
// everything paints in currentColor so the glyph follows the tile's own hover
// and selected colours without extra rules.
function Glyph({ children }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// Keyed by intent id so a new intent fails visibly (no glyph) rather than
// silently borrowing the wrong one.
const ICONS = {
  // angle brackets: writing code
  "smart-contracts": (
    <Glyph>
      <polyline points="8 7 3 12 8 17" />
      <polyline points="16 7 21 12 16 17" />
    </Glyph>
  ),
  // two opposed arrows: sending a transaction
  sdk: (
    <Glyph>
      <polyline points="3 9 21 9" />
      <polyline points="17 5 21 9 17 13" />
      <polyline points="21 15 3 15" />
      <polyline points="7 11 3 15 7 19" />
    </Glyph>
  ),
  // magnifier: querying
  api: (
    <Glyph>
      <circle cx="11" cy="11" r="6" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </Glyph>
  ),
  // stacked layers: indexed data
  indexer: (
    <Glyph>
      <polygon points="12 3 22 8 12 13 2 8" />
      <polyline points="2 12 12 17 22 12" />
      <polyline points="2 16 12 21 22 16" />
    </Glyph>
  ),
  // server unit: running a node
  node: (
    <Glyph>
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="18" height="7" rx="1.5" />
      <line x1="7" y1="7.5" x2="7.01" y2="7.5" />
      <line x1="7" y1="16.5" x2="7.01" y2="16.5" />
    </Glyph>
  ),
  // card: a wallet
  wallet: (
    <Glyph>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M16 12h3" />
      <path d="M2.5 10h19" />
    </Glyph>
  ),
  // linked nodes: operating a pool
  operations: (
    <Glyph>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <line x1="10.5" y1="7" x2="6.5" y2="15.8" />
      <line x1="13.5" y1="7" x2="17.5" y2="15.8" />
    </Glyph>
  ),
  // terminal: setting up an environment
  "dev-env": (
    <Glyph>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <polyline points="7 10 9.5 12.5 7 15" />
      <line x1="12.5" y1="15" x2="17" y2="15" />
    </Glyph>
  ),
};

export default function IntentIcon({ id }) {
  return ICONS[id] ?? null;
}
