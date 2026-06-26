import React from "react";

import styles from "./browser.module.css";

// One checkbox filter group in the sidebar. `list` is the set of ids (each
// resolved to a label via `taxonomy`), `selected` holds the checked ids, and
// `onToggle` flips a single id. Shared by the app-starter and contracts pages.
export default function FilterSection({ heading, list, taxonomy, selected, onToggle }) {
  return (
    <div className={styles.filterSection}>
      <h3 className={styles.filterHeading}>{heading}</h3>
      <ul className={styles.checkList}>
        {list.map((id) => (
          <li key={id}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() => onToggle(id)}
              />
              <span>{taxonomy[id]?.label ?? id}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
