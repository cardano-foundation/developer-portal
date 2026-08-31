import React, { memo } from "react";
import clsx from "clsx";

import AppTile from "@site/src/components/AppTile";
import Carousel from "@site/src/components/Carousel";

import styles from "./styles.module.css";

// The tool-card rail on the shared carousel chrome. `variant="pick"`
// switches the tiles to the horizontal pick card and widens them to match;
// `onBlue` dresses the chrome for the Cardano Blue band.
function AppTileCarousel({ apps, labelledBy, header, variant, onBlue }) {
  return (
    <Carousel
      items={apps}
      itemKey={(app) => app.slug}
      renderItem={(app) => <AppTile app={app} variant={variant} />}
      itemClassName={clsx(styles.item, variant === "pick" && styles.itemPick)}
      labelledBy={labelledBy}
      header={header}
      onBlue={onBlue}
    />
  );
}

export default memo(AppTileCarousel);
