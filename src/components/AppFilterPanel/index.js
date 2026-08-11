import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import clsx from "clsx";

import Tooltip from "@site/src/components/showcase/ShowcaseTooltip/index";
import InfoDot from "@site/src/components/showcase/InfoDot";

import {
  Categories,
  CategoryList,
  Properties,
  PropertyList,
  LanguageList,
  InterfaceList,
} from "@site/src/data/builder-tools/showcase";
import {
  readSearchTags,
  replaceSearchTags,
} from "@site/src/components/showcase/ShowcaseTagSelect";

import styles from "./styles.module.css";

// Expandable inline filter panel: one Category (single-select) + Language and
// Interface property groups (multi-select). Open/closed is local state so toggling
// the panel does not push a URL change.
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
      history.replace({ ...location, search: replaceSearchTags(location.search, nextTags) });
    },
    [selectedTags, activeCategory, location, history]
  );

  const toggleProperty = useCallback(
    (prop) => {
      const has = selectedTags.includes(prop);
      const nextTags = has
        ? selectedTags.filter((t) => t !== prop)
        : [...selectedTags, prop];
      history.replace({ ...location, search: replaceSearchTags(location.search, nextTags) });
    },
    [selectedTags, location, history]
  );

  const clearAll = useCallback(() => {
    history.replace({ ...location, search: replaceSearchTags(location.search, []) });
  }, [location, history]);

  const buttonLabel = activeCount ? `Filter (${activeCount})` : "Filter";

  function propertyGroup(heading, list) {
    return (
      <div className={styles.section}>
        <h3 className={styles.heading}>{heading}</h3>
        <ul className={styles.pillList}>
          {list.map((prop) => {
            const isActive = activeProperties.includes(prop);
            const def = Properties[prop];
            return (
              <li key={prop}>
                <button
                  type="button"
                  onClick={() => toggleProperty(prop)}
                  className={clsx(styles.pill, isActive && styles.pillActive)}
                  aria-pressed={isActive}
                >
                  {def.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

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
            <h3 className={styles.heading}>Category</h3>
            <ul className={styles.pillList}>
              {CategoryList.map((cat) => {
                const isActive = activeCategory === cat;
                const def = Categories[cat];
                return (
                  <li key={cat}>
                    <Tooltip
                      text={def.description}
                      id={`filter_cat_${cat}`}
                      anchorEl="#__docusaurus"
                    >
                      <button
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={clsx(styles.pill, isActive && styles.pillActive)}
                        aria-pressed={isActive}
                      >
                        {def.label}
                        <InfoDot />
                      </button>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
          {propertyGroup("Language", LanguageList)}
          {propertyGroup("Interface", InterfaceList)}
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
