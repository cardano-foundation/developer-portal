import React from 'react';
import {useBlogPost} from '@docusaurus/theme-common/internal';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import ChangelogItemHeaderAuthors from '@theme/ChangelogItem/Header/Authors';
import styles from './styles.module.css';

// Reduce changelog title size, but only on list view
function ChangelogTitle() {
  const {isBlogPostPage} = useBlogPost();
  return (
    <BlogPostItemHeaderTitle
      className={isBlogPostPage ? undefined : styles.changelogItemTitleList}
    />
  );
}

export default function ChangelogItemHeader(): JSX.Element {
  return (
    <header>
      <ChangelogTitle />
      <BlogPostItemHeaderInfo />
      <ChangelogItemHeaderAuthors />
    </header>
  );
}
