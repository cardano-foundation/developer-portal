import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { isRecent, getAppBlurb } from "@site/src/utils/toolStats";
import AppIcon from "@site/src/components/AppIcon";

import styles from "./styles.module.css";

const NEW_LABEL = "NEW";
const PICK_LABEL = "Maintainer pick";

// `compact` is the in-panel form: the panel already supplies the raised
// surface, so the row drops its own card chrome and its tag row and shows
// name + blurb only. Standalone rows keep both.
function AppRow({ app, compact = false }) {
  const categoryDef = Categories[app.category];
  const recent = isRecent(app);

  return (
    <Link
      to={`/tools/${app.slug}`}
      className={clsx(styles.row, compact && styles.rowCompact)}
    >
      <AppIcon app={app} size="row" className={styles.icon} />
      <div className={styles.content}>
        <h4 className={styles.title}>
          {app.title}
          {app.maintainerPick && (
            <span className={styles.pickStar} aria-label={PICK_LABEL}>
              ★
            </span>
          )}
          {recent && <span className={styles.newBadge}>{NEW_LABEL}</span>}
        </h4>
        <p className={styles.description}>{getAppBlurb(app)}</p>
        {!compact && (
          <div className={styles.tags}>
            {categoryDef && (
              <span className={styles.tag}>{categoryDef.label}</span>
            )}
            {app.properties.slice(0, 2).map((p) => {
              const def = Properties[p];
              if (!def) return null;
              return (
                <span key={p} className={styles.tag}>
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

export default memo(AppRow);
