import { useState } from "react";

// Multi-select facet state for the browse pages: one id list per named
// group, membership toggling per group, the active total across groups, and
// a reset. The browse pages differ only in their group names.
export default function useFacetSelection(groups) {
  const empty = () => Object.fromEntries(groups.map((group) => [group, []]));
  const [selected, setSelected] = useState(empty);

  const toggle = (group) => (id) =>
    setSelected((prev) => {
      const has = prev[group].includes(id);
      return {
        ...prev,
        [group]: has ? prev[group].filter((x) => x !== id) : [...prev[group], id],
      };
    });

  const activeCount = groups.reduce((n, group) => n + selected[group].length, 0);
  const clearAll = () => setSelected(empty());

  return { selected, toggle, activeCount, clearAll };
}
