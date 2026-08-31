import React, { useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import styles from "./styles.module.css";

const SIZE_CLASS = {
  tile: styles.toolIconTile,
  row: styles.toolIconRow,
  pick: styles.toolIconPick,
  detail: styles.toolIconDetail,
};

// Render a tool's icon. Primary path: <img src={tool.icon}> via useBaseUrl.
// Fallback when icon is missing OR fails to load: a neutral letter avatar,
// the tool's first letter on a navy tile.
// Sizes: "tile" on the card grid, "row" in list rows, "pick" on the
// maintainer pick cards, "detail" on the tool page.
// Only the detail icon loads eagerly, since it is above the fold on its page.
export default function ToolIcon({ tool, size = "tile", className }) {
  const iconHref = useBaseUrl(tool.icon || "");
  const [errored, setErrored] = useState(false);
  const showFallback = !tool.icon || errored;
  const initial = tool.title.charAt(0).toUpperCase();

  return (
    <span
      className={clsx(
        styles.toolIcon,
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
