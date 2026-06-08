import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import clsx from "clsx";

import {
  Categories,
  CategoryList,
  Properties,
  PropertyList,
} from "@site/src/data/builder-tools/showcase";
import {
  readSearchTags,
  replaceSearchTags,
} from "@site/src/components/showcase/ShowcaseTagSelect";

import styles from "./styles.module.css";

// Expandable inline filter panel. Open/closed is local component state so toggling
// the panel does not push a URL change that re-runs every page-level location effect.
export default function AppFilterPanel() {
  const location = useLocation();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setSelectedTags(readSearchTags(location.search));
  }, [location.search]);

  const activeCategory = useMemo(
    () => selectedTags.find((t) => CategoryList.includes(t)) || null,
    [selectedTags]
  );
  const activeProperties = useMemo(
    () => selectedTags.filter((t) => PropertyList.includes(t)),
    [selectedTags]
  );
  const activeCount = (activeCategory ? 1 : 0) + activeProperties.length;

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);

  const setCategory = useCallback(
    (cat) => {
      const others = selectedTags.filter((t) => !CategoryList.includes(t));
      const nextTags = activeCategory === cat ? others : [cat, ...others];
      const search = replaceSearchTags(location.search, nextTags);
      history.push({ ...location, search });
    },
    [selectedTags, activeCategory, location, history]
  );

  const toggleProperty = useCallback(
    (prop) => {
      const has = selectedTags.includes(prop);
      const nextTags = has
        ? selectedTags.filter((t) => t !== prop)
        : [...selectedTags, prop];
      const search = replaceSearchTags(location.search, nextTags);
      history.push({ ...location, search });
    },
    [selectedTags, location, history]
  );

  const clearAll = useCallback(() => {
    const search = replaceSearchTags(location.search, []);
    history.push({ ...location, search });
  }, [location, history]);

  const buttonLabel = activeCount ? `Filter (${activeCount})` : "Filter";

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={clsx(styles.toggle, open && styles.toggleOpen)}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls="tools-filter-panel"
      >
        {buttonLabel}
      </button>
      {open && (
        <div id="tools-filter-panel" className={styles.panel}>
          <div className={styles.section}>
            <h3 className={styles.heading}>Categories</h3>
            <ul className={styles.pillList}>
              {CategoryList.map((cat) => {
                const isActive = activeCategory === cat;
                const def = Categories[cat];
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={clsx(styles.pill, isActive && styles.pillActive)}
                      style={
                        isActive
                          ? { backgroundColor: def.color, borderColor: def.color }
                          : undefined
                      }
                      aria-pressed={isActive}
                    >
                      {def.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.section}>
            <h3 className={styles.heading}>Languages &amp; technologies</h3>
            <ul className={styles.pillList}>
              {PropertyList.map((prop) => {
                const isActive = activeProperties.includes(prop);
                const def = Properties[prop];
                return (
                  <li key={prop}>
                    <button
                      type="button"
                      onClick={() => toggleProperty(prop)}
                      className={clsx(styles.pill, isActive && styles.pillActive)}
                      style={
                        isActive
                          ? { backgroundColor: def.color, borderColor: def.color }
                          : undefined
                      }
                      aria-pressed={isActive}
                    >
                      {def.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className={styles.clearButton}>
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
