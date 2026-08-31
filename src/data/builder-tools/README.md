# Builder Tools: how the code fits together

The `/tools` page is an app-store-style directory of developer tools. This note maps where everything lives and the contracts that keep it working.

## Feature map

- `src/data/builder-tools/`, the data layer: `tools.js` (the entries), `tags.js` (taxonomy: categories + language/interface properties), `validation.js` (build-time checks), `slug.js` (the `/tools/<slug>` derivation), `catalog.js` (adapter, see below).
- `src/data/builder-tools.js`, entry point: imports the entries, validates each at build time, exports the sorted list.
- `src/pages/tools/index.js`, the `/tools` page (hero, intents, filters, sort, category browse, picks).
- `plugins/tools-routes/`, Docusaurus plugin that generates a static `/tools/<slug>` route per tool, rendered by `src/components/ToolDetail/`.
- `src/components/`, the UI: `ToolTile`, `ToolRow`, `ToolIcon`, `ToolTileCarousel`, `CategoryPanelsCarousel`, `ToolFilterPanel`, `PageCTA`, `SiteHero`, plus the filter/sort controls in `src/components/tools/` (`IntentChips`, `ToolSort`, `Tooltip`, `InfoDot`, and the `tagQueryString.js` URL helpers).
- `src/utils/toolDisplay.js`, shared listing helpers: recent/NEW badge and card blurb.

## Data flow

`tools.js` (entries) → `builder-tools.js` (validate + sort) → `catalog.js` (adds the URL `slug`, shapes entries for the components) → page + components.

## Relationship to cardano.org

The UX began as a port of the `/apps` feature in the cardano-org repo, originally kept name-for-name in sync. The two implementations have since diverged (this side moved to shared Infima primitives and portal component names), so treat cardano-org as this feature's ancestor, not a mirror: port ideas deliberately, not diffs.

## Contracts to not break

- The `/tools/<slug>` derivation lives in `slug.js`, shared by `catalog.js` and `plugins/tools-routes`, so generated routes and detail-page lookups can't diverge.
- The `?tags=` URL format is owned by `src/components/tools/tagQueryString.js`; the filter panel, the intent chips, and the page all read it through those helpers.
- `category` and `properties` values must exist in `tags.js`; `yarn build` fails otherwise (see `validation.js`).

## Adding or curating tools

Contributor guide: `docs/contribute/portal-contribute.md` (what belongs here, taxonomy, curation and removal, maintainer picks). Entry format: header comment in `tools.js`.
