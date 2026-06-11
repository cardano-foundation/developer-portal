import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import AppRow from "@site/src/components/AppRow";
import { Categories, Showcases } from "@site/src/data/builder-tools/showcase";

import styles from "./styles.module.css";

function selectPanelApps(category, limit) {
  // Maintainer picks first, then random for some freshness. Cached below so
  // order stays stable until the next full page load.
  return Showcases.filter((app) => app.category === category)
    .sort((a, b) => {
      if (a.maintainerPick !== b.maintainerPick) return a.maintainerPick ? -1 : 1;
      return Math.random() - 0.5;
    })
    .slice(0, limit);
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
        <Link to={`/tools?tags=${category}`} className={styles.seeAll}>
          See all
        </Link>
      </header>
      <ul className={styles.panelList}>
        {apps.map((app) => (
          <li key={app.slug}>
            <AppRow app={app} hideCategory />
          </li>
        ))}
      </ul>
    </article>
  );
});

const useIsomorphicLayoutEffect = ExecutionEnvironment.canUseDOM
  ? useLayoutEffect
  : useEffect;

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z"
      />
    </svg>
  );
}

function CategoryPanelsCarousel({ categories, ariaLabel, limit = 5 }) {
  const scrollerRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanScrollPrev(node.scrollLeft > 1);
    setCanScrollNext(node.scrollLeft < max - 1);
    const lastIndex = categories.length - 1;
    if (max <= 0 || lastIndex <= 0) {
      setActiveIndex(0);
      return;
    }
    const progress = node.scrollLeft / max;
    setActiveIndex(Math.round(progress * lastIndex));
  }, [categories.length]);

  useIsomorphicLayoutEffect(() => {
    const node = scrollerRef.current;
    if (!node) return undefined;
    node.scrollLeft = 0;
    updateScrollState();
    const frame = requestAnimationFrame(updateScrollState);
    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, categories.length]);

  const scrollBy = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    const firstItem = node.firstElementChild;
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 320;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 16;
    node.scrollBy({ left: direction * (itemWidth + gap), behavior: "smooth" });
    requestAnimationFrame(updateScrollState);
  };

  return (
    <div className={styles.carousel} aria-label={ariaLabel} role="region">
      <button
        type="button"
        className={clsx(styles.arrow, styles.arrowPrev)}
        onClick={() => scrollBy(-1)}
        disabled={!canScrollPrev}
        aria-label="Previous"
      >
        <ChevronLeft />
      </button>
      <ul
        ref={scrollerRef}
        className={clsx(
          styles.scroller,
          canScrollPrev && styles.canPrev,
          canScrollNext && styles.canNext
        )}
      >
        {categories.map((cat) => (
          <li key={cat} className={styles.item}>
            <CategoryPanel category={cat} limit={limit} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={clsx(styles.arrow, styles.arrowNext)}
        onClick={() => scrollBy(1)}
        disabled={!canScrollNext}
        aria-label="Next"
      >
        <ChevronRight />
      </button>
      <div className={styles.dots} aria-hidden>
        {categories.map((cat, i) => (
          <span
            key={cat}
            className={clsx(styles.dot, i === activeIndex && styles.dotActive)}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryPanelsCarousel);
