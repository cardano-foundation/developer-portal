import React, { memo } from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import { Categories, Properties } from "@site/src/data/builder-tools/showcase";
import { getAppBlurb, isRecent } from "@site/src/utils/toolStats";
import AppIcon from "@site/src/components/AppIcon";

import styles from "./styles.module.css";

const NEW_LABEL = "NEW";

function AppTile({ app, variant }) {
  const categoryDef = Categories[app.category];
  // Recency is a property of the tool, so the tile derives it rather than
  // taking it from the caller.
  const recent = isRecent(app);

  // The template's pick card lays the tool out beside a large icon, with
  // only the category capsule above the name; the section itself already
  // says these are picks.
  if (variant === "pick") {
    return (
      <Link to={`/tools/${app.slug}/`} className={clsx(styles.tile, styles.tilePick)}>
        <AppIcon app={app} size="pick" className={styles.pickIcon} />
        <div className={styles.pickBody}>
          {categoryDef && (
            <span className={styles.category}>{categoryDef.label}</span>
          )}
          <h3 className={styles.title}>{app.title}</h3>
          <p className={styles.description}>{getAppBlurb(app)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/tools/${app.slug}/`} className={styles.tile}>
      <div className={styles.header}>
        <AppIcon app={app} size="tile" />
        {recent && <span className={styles.newBadge}>{NEW_LABEL}</span>}
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
