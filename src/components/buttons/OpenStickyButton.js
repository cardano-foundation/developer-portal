import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import styles from "./styles.module.css";

// Floating contribute button on the landing and /tools pages: the shared
// primary button pinned to the corner as a circle that expands on hover to
// reveal its label.
export default function OpenStickyButton() {
  return (
    <Link
      className={clsx("button", "button--primary", styles.fab)}
      to="/docs/contribute/portal-contribute/"
    >
      <span className={styles.glyph} aria-hidden="true" />
      <span className={styles.label}>Contribute now</span>
    </Link>
  );
}
