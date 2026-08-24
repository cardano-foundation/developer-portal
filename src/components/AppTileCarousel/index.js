import React, { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import clsx from "clsx";

import AppTile from "@site/src/components/AppTile";

import styles from "./styles.module.css";

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

// `header` is the section's own heading content, rendered on the template's
// header row with the arrows at its trailing edge; `labelledBy` names the
// region from that heading, so screen readers don't hear the title twice.
// `variant="pick"` switches the tiles to the horizontal pick card and
// `onBlue` dresses the chrome for the Cardano Blue band.
function AppTileCarousel({ apps, labelledBy, header, variant, onBlue }) {
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
    const lastIndex = apps.length - 1;
    if (max <= 0 || lastIndex <= 0) {
      setActiveIndex(0);
      return;
    }
    // Index from the item stride, so the active dot tracks the leading
    // card. The stride never reaches the last index while later cards are
    // still visible, so the scroll end snaps to it explicitly.
    const firstItem = node.firstElementChild;
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 393;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 20;
    setActiveIndex(
      node.scrollLeft >= max - 1
        ? lastIndex
        : Math.min(lastIndex, Math.round(node.scrollLeft / (itemWidth + gap)))
    );
  }, [apps.length]);

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
  }, [updateScrollState, apps.length]);

  const scrollBy = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    const firstItem = node.firstElementChild;
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : 393;
    const gap = parseFloat(getComputedStyle(node).columnGap) || 20;
    node.scrollBy({ left: direction * (itemWidth + gap), behavior: "smooth" });
    requestAnimationFrame(updateScrollState);
  };

  return (
    <div
      className={clsx(styles.carousel, onBlue && styles.carouselOnBlue)}
      aria-labelledby={labelledBy}
      role="region"
    >
      <div className={styles.headerRow}>
        <div className={styles.headerContent}>{header}</div>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollBy(-1)}
            disabled={!canScrollPrev}
            aria-label="Previous"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scrollBy(1)}
            disabled={!canScrollNext}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      <ul
        ref={scrollerRef}
        className={clsx(
          styles.scroller,
          canScrollPrev && styles.canPrev,
          canScrollNext && styles.canNext
        )}
      >
        {apps.map((app) => (
          <li
            key={app.slug}
            className={clsx(styles.item, variant === "pick" && styles.itemPick)}
          >
            <AppTile app={app} variant={variant} />
          </li>
        ))}
      </ul>
      <div className={styles.dots} aria-hidden>
        {apps.map((app, i) => (
          <span
            key={app.slug}
            className={clsx(styles.dot, i === activeIndex && styles.dotActive)}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(AppTileCarousel);
