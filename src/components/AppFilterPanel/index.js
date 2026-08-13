import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import clsx from "clsx";

import Tooltip from "@site/src/components/showcase/ShowcaseTooltip/index";
import InfoDot from "@site/src/components/showcase/InfoDot";

import {
  Showcases,
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
} from "@site/src/components/showcase/tagQueryString";

import styles from "./styles.module.css";

// How many tools sit in each bucket. These are the size of the bucket itself,
// not of the current result set, so they stay stable while filters change and
// never read as a promise about what a click will return.
const FACET_COUNTS = (() => {
  const counts = {};
  for (const tool of Showcases) {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
    for (const prop of tool.properties) {
      counts[prop] = (counts[prop] || 0) + 1;
    }
  }
  return counts;
})();

// Persistent facet rail beside the browse results: one Category
// (single-select) plus Language and Interface property groups (multi-select).
// Selection lives in the query string, so a filtered view is linkable and the
// back button steps through it; nothing here holds selection state of its own.
//
// The rail is permanent at every width. Below the browse grid's breakpoint it
// stacks above the results rather than sitting beside them.
export default function AppFilterPanel() {
  const location = useLocation();
  const history = useHistory();
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

  const setCategory = useCallback(
    (cat) => {
      const others = selectedTags.filter((t) => !CategoryList.includes(t));
      const nextTags = activeCategory === cat ? others : [cat, ...others];
      history.replace({
        ...location,
        search: replaceSearchTags(location.search, nextTags),
      });
    },
    [selectedTags, activeCategory, location, history]
  );

  const toggleProperty = useCallback(
    (prop) => {
      const has = selectedTags.includes(prop);
      const nextTags = has
        ? selectedTags.filter((t) => t !== prop)
        : [...selectedTags, prop];
      history.replace({
        ...location,
        search: replaceSearchTags(location.search, nextTags),
      });
    },
    [selectedTags, location, history]
  );

  const clearAll = useCallback(() => {
    history.replace({
      ...location,
      search: replaceSearchTags(location.search, []),
    });
  }, [location, history]);

  // An active facet keeps its label as its accessible name and carries
  // aria-pressed, so the button reads as a toggle rather than as a separate
  // "remove" control. The glyph is decorative.
  // `hint` is the taxonomy's own description, shown on the info dot. Only the
  // category facets carry one; the language and interface labels speak for
  // themselves and have no description in the data.
  function facet(key, label, isActive, onToggle, hint) {
    const button = (
      <button
        type="button"
        onClick={onToggle}
        className={clsx(styles.facet, isActive && styles.facetActive)}
        aria-pressed={isActive}
      >
        <span className={styles.facetLabel}>{label}</span>
        {hint && <InfoDot />}
        {/* The count is decoration on top of the label, which already names
            the facet, so it stays out of the accessible name. */}
        <span className={styles.facetCount} aria-hidden="true">
          {FACET_COUNTS[key] ?? 0}
        </span>
        {isActive && (
          <span className={styles.facetRemove} aria-hidden="true">
            ×
          </span>
        )}
      </button>
    );
    return (
      <li key={key}>
        {hint ? (
          <Tooltip text={hint} id={`facet_${key}`} anchorEl="#__docusaurus">
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </li>
    );
  }

  // The group labels are names for sets of toggles, not document sections, so
  // they are not headings: making them h3 put an h1 -> h3 skip at the top of
  // the page. role="group" + aria-labelledby gives assistive tech the same
  // grouping without touching the heading outline.
  function group(heading, children, inline) {
    const labelId = `tools-facets-${heading.toLowerCase()}`;
    return (
      <div className={styles.group} role="group" aria-labelledby={labelId}>
        <p className={styles.groupLabel} id={labelId}>
          {heading}
        </p>
        <ul className={clsx(styles.facetList, inline && styles.facetListInline)}>
          {children}
        </ul>
      </div>
    );
  }

  function propertyGroup(heading, list, inline) {
    return group(
      heading,
      list.map((prop) =>
        facet(prop, Properties[prop].label, activeProperties.includes(prop), () =>
          toggleProperty(prop)
        )
      ),
      inline
    );
  }

  return (
    <section className={styles.rail} aria-label="Filter tools">
      {group(
        "Category",
        CategoryList.map((cat) =>
          facet(
            cat,
            Categories[cat].label,
            activeCategory === cat,
            () => setCategory(cat),
            Categories[cat].description
          )
        ),
        false
      )}
      {propertyGroup("Language", LanguageList, true)}
      {propertyGroup("Interface", InterfaceList, true)}
      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className={styles.clearButton}>
          Clear all filters
        </button>
      )}
    </section>
  );
}
