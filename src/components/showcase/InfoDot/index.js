import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Small decorative "info" glyph signalling that a hover/focus tooltip is
// available on the element it sits in. Purely presentational — the tooltip
// itself comes from a wrapping <Tooltip> (ShowcaseTooltip). aria-hidden so it
// is not announced; the tooltip text is exposed via aria-describedby instead.
export default function InfoDot({ className }) {
  return (
    <svg
      className={clsx(styles.infoDot, className)}
      viewBox="0 0 16 16"
      width="13"
      height="13"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="4.7" r="1" fill="currentColor" />
      <rect x="7.2" y="6.8" width="1.6" height="4.8" rx="0.8" fill="currentColor" />
    </svg>
  );
}
