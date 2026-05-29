// Wrapper swizzle of @docusaurus/theme-classic DocBreadcrumbs.
// Renders the breadcrumb trail and the "Copy page" dropdown on one row, so the
// dropdown uses the breadcrumb row's existing space instead of displacing the H1.
// DocBreadcrumbs is an "unsafe" swizzle target — re-check on Docusaurus major
// upgrades. Pure pass-through, so prop changes won't break it.
import React from 'react';
import OriginalDocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import CopyMarkdownActions from '@site/src/components/CopyMarkdownActions';

export default function DocBreadcrumbsWrapper(props) {
  return (
    <div className="docbreadcrumbs-with-actions">
      <OriginalDocBreadcrumbs {...props} />
      <CopyMarkdownActions />
    </div>
  );
}
