import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import clsx from "clsx";

import Tooltip from "@site/src/components/tools/Tooltip";

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
} from "@site/src/components/tools/tagQueryString";

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
  // Every replace clears location.state: a search leaves `isSearch` there,
  // and carrying it forward would let the SearchBar effect steal focus into
  // the input on the next facet click.
  const setCategory = useCallback(
    (cat) => {
      const others = selectedTags.filter((t) => !CategoryList.includes(t));
      const nextTags = activeCategory === cat ? others : [cat, ...others];
      history.replace({
        ...location,
        state: undefined,
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
        state: undefined,
        search: replaceSearchTags(location.search, nextTags),
      });
    },
    [selectedTags, location, history]
  );

  // One reset per group, the template's control: each clears only its own
  // group's selection and leaves the others standing.
  const resetGroup = useCallback(
    (groupList, hasActive) => {
      if (!hasActive) return;
      const nextTags = selectedTags.filter((t) => !groupList.includes(t));
      history.replace({
        ...location,
        state: undefined,
        search: replaceSearchTags(location.search, nextTags),
      });
    },
    [selectedTags, location, history]
  );

  // An active facet keeps its label as its accessible name and carries
  // aria-pressed, so the button reads as a toggle rather than as a separate
  // "remove" control. The glyph is decorative.
  // `hint` is the taxonomy's own description, shown as a hover tooltip on
  // the whole row. Only the category facets carry one; the language and
  // interface labels speak for themselves and have no description in the
  // data.
  // Counts render only where the template shows them: beside the category
  // labels, and never on a selected facet, whose capsule carries label + ×.
  function facet(key, label, isActive, onToggle, hint, showCount) {
    const button = (
      <button
        type="button"
        onClick={onToggle}
        className={clsx(styles.facet, isActive && styles.facetActive)}
        aria-pressed={isActive}
      >
        <span className={styles.facetLabel}>{label}</span>
        {/* The count is decoration on top of the label, which already names
            the facet, so it stays out of the accessible name. */}
        {showCount && !isActive && (
          <span className={clsx("badge badge--secondary", styles.facetCount)} aria-hidden="true">
            {FACET_COUNTS[key] ?? 0}
          </span>
        )}
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
  function group(heading, children, inline, onReset, hasActive) {
    const labelId = `tools-facets-${heading.toLowerCase()}`;
    return (
      <div className={styles.group} role="group" aria-labelledby={labelId}>
        <div className={styles.groupHead}>
          <p className={styles.groupLabel} id={labelId}>
            {heading}
          </p>
          {/* The template shows Reset in every header; it only does anything
              once the group has a selection. aria-disabled rather than
              disabled: a button that disables itself on activation would
              drop keyboard focus to the body. */}
          <button
            type="button"
            onClick={onReset}
            className={styles.groupReset}
            aria-disabled={!hasActive}
            aria-label={`Reset ${heading.toLowerCase()} filters`}
          >
            Reset
          </button>
        </div>
        <ul className={clsx(styles.facetList, inline && styles.facetListInline)}>
          {children}
        </ul>
      </div>
    );
  }

  function propertyGroup(heading, list, inline) {
    const hasActive = activeProperties.some((p) => list.includes(p));
    return group(
      heading,
      list.map((prop) =>
        facet(prop, Properties[prop].label, activeProperties.includes(prop), () =>
          toggleProperty(prop)
        )
      ),
      inline,
      () => resetGroup(list, hasActive),
      hasActive
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
            Categories[cat].description,
            true
          )
        ),
        false,
        () => resetGroup(CategoryList, Boolean(activeCategory)),
        Boolean(activeCategory)
      )}
      {propertyGroup("Language", LanguageList, true)}
      {propertyGroup("Interface", InterfaceList, true)}
    </section>
  );
}
