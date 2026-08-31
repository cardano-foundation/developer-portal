// Wrapper swizzle of @docusaurus/theme-classic BlogListPage.
// Points the blog index (and its /blog/page/N pagination) at the blog social card
// that scripts/generate-og.js writes under static/img/og/pages/. Individual posts
// get their own card through BlogPostPage/Metadata; tag and archive pages fall
// back to the site-wide landing card from docusaurus.config.js.
//
// The stock component sets title and description only, so appending an image-only
// PageMetadata after it adds og:image / twitter:image without touching anything
// upstream owns (Helmet lets the last render win per tag).
import React from 'react';
import Original from '@theme-original/BlogListPage';
import {PageMetadata} from '@docusaurus/theme-common';
import ogCards from '@site/static/img/og/pages/manifest.json';

export default function BlogListPage(props) {
  return (
    <>
      <Original {...props} />
      <PageMetadata image={ogCards.blog} />
    </>
  );
}
