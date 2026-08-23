# Builder Tools: how the code fits together

The `/tools` page is a port of the cardano.org/apps app-store UX, adapted to developer tools. This note maps where everything lives and the contracts that keep it working.

## Feature map

- `src/data/builder-tools/`, the data layer: `tools.js` (the catalog), `tags.js` (taxonomy: categories + language/interface properties), `validation.js` (build-time checks), `showcase.js` (adapter, see below).
- `src/data/builder-tools.js`, entry point: imports the catalog, validates every entry at build time, exports the sorted list.
- `src/pages/tools/index.js`, the `/tools` page (hero, intents, filters, sort, category browse, picks).
- `plugins/tools-routes/`, Docusaurus plugin that generates a static `/tools/<slug>` route per tool, rendered by `src/components/ToolDetail/`.
- `src/components/`, the ported UI: `AppTile`, `AppRow`, `AppIcon`, `AppTileCarousel`, `CategoryPanelsCarousel`, `AppFilterPanel`, `PageCTA`, `Layout/SiteHero`, plus the filter/sort controls in `src/components/showcase/` (`IntentChips`, `ShowcaseSort`, `ShowcaseTooltip`, `InfoDot`, and the `tagQueryString.js` URL helpers).
- `src/utils/toolStats.js`, shared listing helpers: recent/NEW badge, card blurb, and category/property matching for the filter panel. (cardano-org's `appStats.js` tx metrics were not ported; tools have no on-chain tx data.)

## Data flow

`tools.js` (catalog) → `builder-tools.js` (validate + sort) → `showcase.js` (adds the URL `slug`, shapes entries for the components) → page + components.

## Parity with cardano.org

Component names, folder layout, and data export names (`AppTile`, `AppRow`, `showcase/*`, `Showcases`, `SortedShowcases`, ...) are intentionally kept 1:1 with the `/apps` feature in the cardano-org repo. That's what lets an improvement in one repo port to the other with minimal friction. The names read app-flavored on purpose; don't rename one side alone.

## Contracts to not break

- `slugify()` in `plugins/tools-routes/index.js` must byte-match the one in `showcase.js`. If they diverge, detail routes 404.
- The `?tags=` URL format is owned by `src/components/showcase/tagQueryString.js`; the filter panel, the intent chips, and the page all read it through those helpers.
- `category` and `properties` values must exist in `tags.js`; `yarn build` fails otherwise (see `validation.js`).

## Adding or curating tools

Contributor guide: `docs/contribute/portal-contribute.md` (what belongs here, taxonomy, curation and removal, maintainer picks). Entry format: header comment in `tools.js`.
