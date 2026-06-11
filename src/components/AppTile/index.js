import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { getAppBlurb } from "@site/src/utils/toolStats";
import AppIcon from "@site/src/components/AppIcon";

import styles from "./styles.module.css";

function AppTile({ app, badge = null }) {
  const categoryDef = Categories[app.category];

  return (
    <Link to={`/tools/${app.slug}`} className={styles.tile}>
      <div className={styles.header}>
        <AppIcon app={app} size="tile" />
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      <h3 className={styles.title}>{app.title}</h3>
      <p className={styles.description}>{getAppBlurb(app)}</p>
      <div className={styles.meta}>
        {categoryDef && (
          <span className={styles.category}>{categoryDef.label}</span>
        )}
        {app.properties.slice(0, 2).map((p) => {
          const def = Properties[p];
          if (!def) return null;
          return (
            <span key={p} className={styles.property}>
              {def.label}
            </span>
          );
        })}
      </div>
    </Link>
  );
}

export default memo(AppTile);

export function StarBadge() {
  return (
    <span className={clsx(styles.starBadge)} aria-label="Maintainer pick">
      ★
    </span>
  );
}

export function RankBadge({ rank }) {
  return (
    <span className={clsx(styles.rankBadge)} aria-label={`Rank ${rank}`}>
      #{rank}
    </span>
  );
}
