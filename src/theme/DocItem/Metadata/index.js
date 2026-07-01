// Eject swizzle of @docusaurus/theme-classic DocItem/Metadata.
// Points each doc's og:image / twitter:image at its build-time OG card.
// scripts/generate-og.js writes one card per doc under docs/ plus a manifest keyed
// by the page's source path; this looks the page up there. Every doc is in the
// manifest, so the generated card is the default; a page with no card falls through
// to assets.image / frontMatter.image / the site default.
// Full eject (not a wrapper): the stock component computes `image` internally and
// exposes no prop to override it. DocItem/Metadata is a safe-ish swizzle target, but
// re-check this against upstream on Docusaurus major upgrades.
import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import ogCards from '@site/static/img/og/docs/manifest.json';

export default function DocItemMetadata() {
  const {metadata, frontMatter, assets} = useDoc();
  // metadata.source is the aliased path, e.g. "@site/docs/developers/curriculum/…md";
  // the manifest is keyed by the repo-relative path.
  const source = metadata.source.replace(/^@site\//, '');
  const image = ogCards[source] ?? assets.image ?? frontMatter.image;
  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={image}
    />
  );
}
