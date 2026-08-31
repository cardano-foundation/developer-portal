import React from "react";
import { translate } from "@docusaurus/Translate";
import ExternalArrow from "@site/src/components/ExternalArrow";

import styles from "./styles.module.css";

// Swizzled so the theme's own external-link marker (docs sidebar entries that
// leave the site) is the same glyph as everywhere else instead of the stock
// box-and-arrow sprite.
export default function IconExternalLink() {
  return (
    <span
      className={styles.iconExternalLink}
      role="img"
      aria-label={translate({
        id: "theme.IconExternalLink.ariaLabel",
        message: "(opens in new tab)",
        description: "The ARIA label for the external link icon",
      })}
    >
      <ExternalArrow />
    </span>
  );
}
