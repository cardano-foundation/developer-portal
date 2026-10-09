import React, { memo } from "react";
import Link from "@docusaurus/Link";

import ToolRow from "@site/src/components/ToolRow";
import Carousel from "@site/src/components/Carousel";
import { Categories, Tools } from "@site/src/data/builder-tools/catalog";

import styles from "./styles.module.css";

function selectPanelTools(category, limit) {
  // Newest first. `Tools` keeps insertion order and entries are appended,
  // so reading from the end gives the most recently added in each category.
  // This used to be maintainer-picks-then-random; the panels are a recency
  // surface, and dropping the randomness also makes the render deterministic.
  const inCategory = [];
  for (let i = Tools.length - 1; i >= 0 && inCategory.length < limit; i--) {
    if (Tools[i].category === category) inCategory.push(Tools[i]);
  }
  return inCategory;
}

const PANEL_TOOLS_CACHE = new Map();
function getPanelTools(category, limit) {
  const key = `${category}:${limit}`;
  if (!PANEL_TOOLS_CACHE.has(key)) {
    PANEL_TOOLS_CACHE.set(key, selectPanelTools(category, limit));
  }
  return PANEL_TOOLS_CACHE.get(key);
}

const CategoryPanel = memo(function CategoryPanel({ category, limit }) {
  const def = Categories[category];
  if (!def) return null;
  const tools = getPanelTools(category, limit);
  if (tools.length === 0) return null;
  return (
    <article className={styles.panel}>
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{def.label}</h3>
        <Link to={`/tools/?tags=${category}`} className={styles.seeAll}>
          See all
        </Link>
      </header>
      <ul className={styles.panelList}>
        {tools.map((tool) => (
          <li key={tool.slug}>
            <ToolRow tool={tool} compact />
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
