import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { getToolBlurb, isRecent } from "@site/src/utils/toolDisplay";
import ToolIcon from "@site/src/components/ToolIcon";

import styles from "./styles.module.css";

const NEW_LABEL = "NEW";

function ToolTile({ tool, variant }) {
  const categoryDef = Categories[tool.category];
  // Recency is a property of the tool, so the tile derives it rather than
  // taking it from the caller.
  const recent = isRecent(tool);

  // The template's pick card lays the tool out beside a large icon, with
  // only the category capsule above the name; the section itself already
  // says these are picks.
  if (variant === "pick") {
    return (
      <Link to={`/tools/${tool.slug}/`} className={clsx(styles.tile, styles.tilePick)}>
        <ToolIcon tool={tool} size="pick" className={styles.pickIcon} />
        <div className={styles.pickBody}>
          {categoryDef && (
            <span className="badge badge--secondary">{categoryDef.label}</span>
          )}
          <h3 className={styles.title}>{tool.title}</h3>
          <p className={styles.description}>{getToolBlurb(tool)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/tools/${tool.slug}/`} className={styles.tile}>
      <div className={styles.header}>
        <ToolIcon tool={tool} size="tile" />
        {recent && <span className="badge badge--primary">{NEW_LABEL}</span>}
      </div>
      <h3 className={styles.title}>{tool.title}</h3>
      <p className={styles.description}>{getToolBlurb(tool)}</p>
      <div className={styles.meta}>
        {categoryDef && (
          <span className="badge badge--secondary">{categoryDef.label}</span>
        )}
        {tool.properties.slice(0, 2).map((p) => {
          const def = Properties[p];
          if (!def) return null;
          return (
            <span key={p} className="badge badge--secondary">
              {def.label}
            </span>
          );
        })}
      </div>
    </Link>
  );
}

export default memo(ToolTile);
