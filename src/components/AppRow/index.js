import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories } from "@site/src/data/builder-tools/showcase";
import {
  getAppStats,
  isTrackable,
  isRecent,
  formatTxCountCompact,
  getAppBlurb,
} from "@site/src/utils/toolStats";
import AppIcon from "@site/src/components/AppIcon";

import styles from "./styles.module.css";

const ACTIVITY_UNIT = "tx";
const NEW_LABEL = "NEW";
const PICK_LABEL = "Maintainer pick";

function AppRow({ app, hideCategory = false }) {
  const stats = isTrackable(app) ? getAppStats(app) : null;
  const showActivity = stats && stats.txCount > 0;
  const categoryDef = Categories[app.category];
  const recent = isRecent(app);

  return (
    <Link href={app.website} className={styles.row}>
      <AppIcon app={app} size="row" className={styles.icon} />
      <div className={styles.content}>
        <h4 className={styles.title}>
          {app.title}
          {app.maintainerPick && (
            <span className={styles.pickStar} aria-label={PICK_LABEL}>
              ★
            </span>
          )}
          {showActivity && <span className={clsx(styles.dot)} aria-hidden />}
          {recent && <span className={styles.newBadge}>{NEW_LABEL}</span>}
        </h4>
        <p className={styles.description}>{getAppBlurb(app)}</p>
      </div>
      <div className={styles.metaRight}>
        {showActivity && (
          <span className={styles.activity}>
            {formatTxCountCompact(stats.txCount)} {ACTIVITY_UNIT}
          </span>
        )}
        {!hideCategory && categoryDef && (
          <span className={styles.category}>{categoryDef.label}</span>
        )}
      </div>
    </Link>
  );
}

export default memo(AppRow);
