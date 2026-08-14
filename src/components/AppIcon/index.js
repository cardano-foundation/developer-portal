import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import styles from "./styles.module.css";

const SIZE_CLASS = {
  tile: styles.appIconTile,
  row: styles.appIconRow,
  detail: styles.appIconDetail,
};

// Render a tool's icon. Primary path: <img src={app.icon}> via useBaseUrl.
// Fallback when icon is missing OR fails to load: a neutral letter avatar,
// the tool's first letter on a navy tile.
// Sizes: "tile" on the card grid, "row" in list rows, "detail" on the tool page.
// Only the detail icon loads eagerly, since it is above the fold on its page.
export default function AppIcon({ app, size = "tile", className }) {
  const iconHref = useBaseUrl(app.icon || "");
  const [errored, setErrored] = useState(false);
  const showFallback = !app.icon || errored;
  const initial = app.title.charAt(0).toUpperCase();

  return (
    <span
      className={clsx(
        styles.appIcon,
        SIZE_CLASS[size] ?? SIZE_CLASS.tile,
        className
      )}
      aria-hidden
    >
      {showFallback ? (
        <span className={styles.fallback}>{initial}</span>
      ) : (
        <img
          src={iconHref}
          alt=""
          className={styles.image}
          loading={size === "detail" ? "eager" : "lazy"}
          onError={() => setErrored(true)}
        />
      )}
    </span>
  );
}
