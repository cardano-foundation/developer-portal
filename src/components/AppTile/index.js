import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { getAppBlurb, isRecent } from "@site/src/utils/toolStats";
import AppIcon from "@site/src/components/AppIcon";

import styles from "./styles.module.css";

const NEW_LABEL = "NEW";

function AppTile({ app, badge = null }) {
  const categoryDef = Categories[app.category];
  // Recency is a property of the tool, so the tile derives it rather than
  // taking it from the caller. `badge` stays caller-supplied for the things
  // only a section knows, like a maintainer pick star; a tool can be both.
  const recent = isRecent(app);

  return (
    <Link to={`/tools/${app.slug}`} className={styles.tile}>
      <div className={styles.header}>
        <AppIcon app={app} size="tile" />
        <span className={styles.badges}>
          {recent && <span className={styles.newBadge}>{NEW_LABEL}</span>}
          {badge}
        </span>
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
