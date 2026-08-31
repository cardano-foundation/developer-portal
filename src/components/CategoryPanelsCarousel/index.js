import React, { memo } from "react";
import Link from "@docusaurus/Link";

import AppRow from "@site/src/components/AppRow";
import Carousel from "@site/src/components/Carousel";
import { Categories, Showcases } from "@site/src/data/builder-tools/showcase";

import styles from "./styles.module.css";

function selectPanelApps(category, limit) {
  // Newest first. `Showcases` keeps insertion order and entries are appended,
  // so reading from the end gives the most recently added in each category.
  // This used to be maintainer-picks-then-random; the panels are a recency
  // surface, and dropping the randomness also makes the render deterministic.
  const inCategory = [];
  for (let i = Showcases.length - 1; i >= 0 && inCategory.length < limit; i--) {
    if (Showcases[i].category === category) inCategory.push(Showcases[i]);
  }
  return inCategory;
}

const PANEL_APPS_CACHE = new Map();
function getPanelApps(category, limit) {
  const key = `${category}:${limit}`;
  if (!PANEL_APPS_CACHE.has(key)) {
    PANEL_APPS_CACHE.set(key, selectPanelApps(category, limit));
  }
  return PANEL_APPS_CACHE.get(key);
}

const CategoryPanel = memo(function CategoryPanel({ category, limit }) {
  const def = Categories[category];
  if (!def) return null;
  const apps = getPanelApps(category, limit);
  if (apps.length === 0) return null;
  return (
    <article className={styles.panel}>
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{def.label}</h3>
        <Link to={`/tools/?tags=${category}`} className={styles.seeAll}>
          See all
        </Link>
      </header>
      <ul className={styles.panelList}>
        {apps.map((app) => (
          <li key={app.slug}>
            <AppRow app={app} compact />
          </li>
        ))}
      </ul>
    </article>
  );
});

// Category panels on the shared carousel chrome.
function CategoryPanelsCarousel({ categories, labelledBy, header, limit = 5 }) {
  return (
    <Carousel
      items={categories}
      itemKey={(cat) => cat}
      renderItem={(cat) => <CategoryPanel category={cat} limit={limit} />}
      itemClassName={styles.item}
      labelledBy={labelledBy}
      header={header}
    />
  );
}

export default memo(CategoryPanelsCarousel);
