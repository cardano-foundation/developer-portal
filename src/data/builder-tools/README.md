# Builder Tools — how the code fits together

The `/tools` page is a port of the cardano.org/apps app-store UX, adapted to developer tools. This note maps where everything lives and the contracts that keep it working.

## Feature map

- `src/data/builder-tools/` — the data layer: `tools.js` (the catalog), `tags.js` (taxonomy: categories + language/interface properties), `validation.js` (build-time checks), `showcase.js` (adapter, see below).
- `src/data/builder-tools.js` — entry point: imports the catalog, validates every entry at build time, exports the sorted list.
- `src/pages/tools/index.js` — the `/tools` page (hero, intents, filters, sort, category browse, picks).
- `plugins/tools-routes/` — Docusaurus plugin that generates a static `/tools/<slug>` route per tool, rendered by `src/components/ToolDetail/`.
- `src/components/` — the ported UI: `AppTile`, `AppRow`, `AppIcon`, `AppTileCarousel`, `CategoryPanelsCarousel`, `AppFilterPanel`, `PageCTA`, `Layout/SiteHero`, plus the filter/sort controls in `src/components/showcase/` (`IntentChips`, `ShowcaseSort`, `ShowcaseTagSelect`, `ShowcaseTooltip`, `InfoDot`).
- `src/utils/toolStats.js` — trimmed, stubbed port of cardano-org's `appStats.js`. Tools have no on-chain tx data, so the tx helpers return neutral values and every tx-gated UI branch self-hides; the real helpers are recent/NEW, blurb, and tag matching.

## Data flow

`tools.js` (catalog) → `builder-tools.js` (validate + sort) → `showcase.js` (adds the URL `slug`, shapes entries for the components) → page + components.

## Parity with cardano.org

Component names, folder layout, and data export names (`AppTile`, `AppRow`, `showcase/*`, `Showcases`, `SortedShowcases`, ...) are intentionally kept 1:1 with the `/apps` feature in the cardano-org repo. That's what lets an improvement in one repo port to the other with minimal friction. The names read app-flavored on purpose; don't rename one side alone.

## Contracts to not break

- `slugify()` in `plugins/tools-routes/index.js` must byte-match the one in `showcase.js`. If they diverge, detail routes 404.
- `prepareUserState()` exported from `src/pages/tools/index.js` is imported by `ShowcaseTagSelect`; keep it exported as a hoisted function declaration.
- `category` and `properties` values must exist in `tags.js`; `yarn build` fails otherwise (see `validation.js`).

## Adding or curating tools

Contributor guide: `docs/contribute/portal-contribute.md` (what belongs here, taxonomy, curation and removal, maintainer picks). Entry format: header comment in `tools.js`.
