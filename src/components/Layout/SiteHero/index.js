import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Gradient hero with the bottom V-notch ("sectionCaret"), ported from the
// cardano.org/apps SiteHero (starburst variant) for visual parity. Trimmed to
// the single banner style this page uses.
export default function SiteHero({ title, description, children }) {
  return (
    <header className={clsx("hero hero--primary", styles.heroBannerStarburst)}>
      <div className="container">
        <div className={styles.backgroundBox}>
          <div className={styles.taglineContainer}>
            <h1 className="hero__title">{title}</h1>
            <p className={clsx("hero__subtitle", styles.subtitle)}>{description}</p>
          </div>
          {children && <div className={styles.heroChildren}>{children}</div>}

          <div className="sectionCaret">
            <svg x="0px" y="0px" viewBox="0 0 2000 30">
              <polygon points="1000,30 0,30 0,0 980,0 "></polygon>
              <polygon points="1000,30 2000,30 2000,0 1020,0 "></polygon>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
