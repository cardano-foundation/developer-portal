import React from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

// "Maintainer pick" chip: the shared primary badge with an amber star.
export default function PickBadge({ className, starSize = 12 }) {
  return (
    <span className={clsx("badge badge--primary", styles.pickBadge, className)}>
      <svg
        viewBox="0 0 24 24"
        width={starSize}
        height={starSize}
        aria-hidden="true"
        focusable={false}
      >
        <path
          fill="currentColor"
          d="M12 2.5l2.9 6.5 7.1.8-5.3 4.9 1.5 7-6.2-3.6L5.8 21.7l1.5-7L2 9.8l7.1-.8z"
        />
      </svg>
      Maintainer pick
    </span>
  );
}
