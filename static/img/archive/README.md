# Archived assets

Images that were once live on the portal and got replaced by a redesign.
They are kept instead of deleted so the site's visual history stays
recoverable without digging through git, and because some may return in a
future surface.

Nothing in this directory is referenced by the site. That is intentional:
if a dead-asset sweep flags these files, leave them alone. When something
here comes back into use, move it out of the archive first.

Current contents:

- `blog-og/` — the 37 hand-made blog social cards, browser screenshots of
  the pre-2026 site, replaced by the cards `scripts/generate-og.js` writes at
  build time.
- `home/` — the pre-2026 landing page artwork: hero background and the
  old card illustrations, replaced by `static/img/home/rebrand/`, plus
  the starburst SVG from the old /tools hero, retired when SiteHero
  became a navy band.
- `home/cards/` — the two card illustrations the templates and contracts
  page headers used, retired when both pages moved onto SiteHero.
- `home/dev-portal-hero-*.webp` — a two-variant landing hero that was never
  wired up; the landing page builds its hero artwork in CSS instead.
- `icons/link-solid.svg` — an external-link glyph with no remaining callers.
- `site-og/` — the two hand-made 1200x630 social cards (site-wide fallback and
  Builder Tools), replaced by the generated `static/img/og/pages/` cards.
