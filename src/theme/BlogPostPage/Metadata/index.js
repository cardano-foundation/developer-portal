// Wrapper swizzle of @docusaurus/theme-classic BlogPostPage/Metadata.
// Points each post's og:image / twitter:image at its build-time OG card.
// scripts/generate-og.js writes one card per post under blog/ plus a manifest
// keyed by the post's source path; this looks the post up there.
//
// A wrapper rather than an eject: the stock component computes `image` internally
// and exposes no prop to override it, but PageMetadata renders through Helmet,
// which dedupes by property and lets the last render win. So we render the
// original untouched and append an image-only PageMetadata on top. That keeps the
// title, description, keywords and every article:* tag owned upstream, where they
// go on improving across Docusaurus upgrades.
//
// Posts carry no image frontmatter, so the manifest is the only source; the guard
// covers a post added since the last card generation.
import React from 'react';
import Original from '@theme-original/BlogPostPage/Metadata';
import {PageMetadata} from '@docusaurus/theme-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import ogCards from '@site/static/img/og/blog/manifest.json';

export default function BlogPostPageMetadata(props) {
  const {metadata} = useBlogPost();
  // metadata.source is the aliased path, e.g. "@site/blog/2026-02-06-february.md";
  // the manifest is keyed by the repo-relative path.
  const card = ogCards[metadata.source.replace(/^@site\//, '')];
  return (
    <>
      <Original {...props} />
      {card && <PageMetadata image={card} />}
    </>
  );
}
