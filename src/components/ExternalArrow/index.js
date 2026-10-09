import React from "react";

import styles from "./styles.module.css";

// The site's one external-link affordance: a thin up-right arrow (corner-to-
// corner shaft, near-full-width L head) sized to the text it follows. Render it
// only after a label whose href leaves the site; internal links carry nothing.
export default function ExternalArrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 23 23 1M3 1.25h19.75V21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
