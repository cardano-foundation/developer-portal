# Archived site social cards

The two hand-made social cards the site carried before every page got a
generated one: `og-developer-portal.jpg` was the site-wide og:image (landing
page, talent pool, and every page without a card of its own) and
`og-builder-tools.jpg` covered the Builder Tools browse and detail pages and,
by reuse, the template detail pages.

Both are 1200x630 exports from an early pass at the 2026 brand: centred type,
no lockup, and a background that predates the `_template/bg-*.jpg` set the
generator uses. Once docs and blog cards were generated at build time these were
the only cards left on the old design, which is why they were retired.

Those pages now read their card from `static/img/og/pages/`, written by
`scripts/generate-og.js` on every build. Nothing here is referenced by the site.
