import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { isRecent, getToolBlurb } from "@site/src/utils/toolDisplay";
import ToolIcon from "@site/src/components/ToolIcon";

import styles from "./styles.module.css";

const NEW_LABEL = "NEW";
const PICK_LABEL = "Maintainer pick";

// `compact` is the in-panel form: the panel already supplies the raised
// surface, so the row drops its own card chrome and its tag row and shows
// name + blurb only. Standalone rows keep both.
function ToolRow({ tool, compact = false }) {
  const categoryDef = Categories[tool.category];
  const recent = isRecent(tool);

  return (
    <Link
      to={`/tools/${tool.slug}/`}
      className={clsx(styles.row, compact && styles.rowCompact)}
    >
      {/* In-panel rows take the card-sized icon per the template; the
          standalone result rows keep the smaller one. */}
      <ToolIcon tool={tool} size={compact ? "tile" : "row"} className={styles.icon} />
      <div className={styles.content}>
        <h4 className={styles.title}>
          {tool.title}
          {tool.maintainerPick && (
            <span className={styles.pickStar} aria-label={PICK_LABEL}>
              ★
            </span>
          )}
          {recent && <span className={clsx("badge badge--primary", styles.newBadge)}>{NEW_LABEL}</span>}
        </h4>
        <p className={styles.description}>{getToolBlurb(tool)}</p>
        {!compact && (
          <div className={styles.tags}>
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
        )}
      </div>
    </Link>
  );
}

export default memo(ToolRow);
