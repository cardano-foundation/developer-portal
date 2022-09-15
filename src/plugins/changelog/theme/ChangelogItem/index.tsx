import React from 'react';
import ChangelogItemHeader from '@theme/ChangelogItem/Header';
import type { Props } from '@theme/BlogPostItem';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemContent from '@theme/BlogPostItem/Content';

import styles from './styles.module.css';

export default function ChangelogItem({ children }: Props): JSX.Element {
  return (
    <BlogPostItemContainer className={styles.changelogItemContainer}>
      <ChangelogItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
    </BlogPostItemContainer>
  );
}
