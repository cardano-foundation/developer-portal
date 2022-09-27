import React from 'react';
import clsx from 'clsx';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogPostItems from '@theme/BlogPostItems';
import SearchMetadata from '@theme/SearchMetadata';
import ChangelogItem from '@theme/ChangelogItem';
import type {Props} from '@theme/BlogListPage';

function ChangelogListMetadata(props: Props): JSX.Element {
  const {metadata} = props;
  const {blogTitle, blogDescription} = metadata;
  return (
    <>
      <PageMetadata title={blogTitle} description={blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function ChangelogListContent(props: Props): JSX.Element {
  const {metadata, items, sidebar} = props;

  return (
    <BlogLayout sidebar={sidebar}>
      <h1 style={{fontSize: '3rem'}}>Developer Portal Changelog</h1>
      <BlogPostItems items={items} component={ChangelogItem} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function ChangelogList(props: Props): JSX.Element {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      <ChangelogListMetadata {...props} />
      <ChangelogListContent {...props} />
    </HtmlClassNameProvider>
  );
}
