import React, { useCallback } from "react";
import { useHistory, useLocation } from "@docusaurus/router";

import styles from "./styles.module.css";

export const SortQueryStringKey = "sort";

// "Most active" is intentionally omitted: tools have no on-chain tx data.
export const SORT_IDS = {
  NEWEST: "newest",
  FEATURED: "featured",
  ALPHABETICAL: "alphabetical",
};

// Newest leads: the directory's value is what has just landed, and the
// entries carry insertion order already.
export const DEFAULT_SORT = SORT_IDS.NEWEST;

export const SORT_OPTIONS = [
  { id: SORT_IDS.NEWEST, label: "Newest" },
  { id: SORT_IDS.FEATURED, label: "Featured" },
  { id: SORT_IDS.ALPHABETICAL, label: "A to Z" },
];

export function readSortOption(search) {
  const value = new URLSearchParams(search).get(SortQueryStringKey);
  if (!value) return DEFAULT_SORT;
  return SORT_OPTIONS.some((o) => o.id === value) ? value : DEFAULT_SORT;
}

export default function ToolSort() {
  const location = useLocation();
  const history = useHistory();
  const current = readSortOption(location.search);

  const handleChange = useCallback(
    (e) => {
      const next = new URLSearchParams(location.search);
      if (e.target.value === DEFAULT_SORT) {
        next.delete(SortQueryStringKey);
      } else {
        next.set(SortQueryStringKey, e.target.value);
      }
      history.replace({ ...location, search: next.toString() });
    },
    [location, history]
  );

  return (
    <label className={styles.sortLabel}>
      <span className={styles.sortLabelText}>Sort</span>
      <select
        className={styles.sortSelect}
        value={current}
        onChange={handleChange}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
