import React from "react";

import styles from "./browser.module.css";

// A labeled row of taxonomy chips on a card (e.g. "Framework: Vite + React").
// `ids` are resolved to their display label via `taxonomy`; renders nothing for
// an empty list. Shared by the app-starter and contracts cards.
export default function ChipRow({ label, ids, taxonomy }) {
  if (!ids.length) return null;
  return (
    <div className={styles.chipGroup}>
      <span className={styles.chipLabel}>{label}</span>
      <div className={styles.chips}>
        {ids.map((id) => (
          <span key={id} className={styles.chip}>
            {taxonomy[id]?.label ?? id}
          </span>
        ))}
      </div>
    </div>
  );
}
