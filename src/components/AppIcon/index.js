import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import { Categories } from "@site/src/data/builder-tools/showcase";

import styles from "./styles.module.css";

// Render a tool's icon. Primary path: <img src={app.icon}> via useBaseUrl.
// Fallback when icon is missing OR fails to load: a colored letter avatar using
// Categories[app.category].color as background and the tool's first letter.
// This UX pass ships without tool icons, so the fallback is what renders.
export default function AppIcon({ app, size = "tile", className }) {
  const iconHref = useBaseUrl(app.icon || "");
  const [errored, setErrored] = useState(false);
  const showFallback = !app.icon || errored;
  const bg = Categories[app.category]?.color ?? "#888";
  const initial = app.title.charAt(0).toUpperCase();

  return (
    <span
      className={clsx(
        styles.appIcon,
        size === "row" ? styles.appIconRow : styles.appIconTile,
        className
      )}
      aria-hidden
    >
      {showFallback ? (
        <span className={styles.fallback} style={{ backgroundColor: bg }}>
          {initial}
        </span>
      ) : (
        <img
          src={iconHref}
          alt=""
          className={styles.image}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      )}
    </span>
  );
}
