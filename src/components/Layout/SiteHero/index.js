import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

// Navy chrome band shared with the navbar and footer, identical in both
// themes. Replaced the gradient-and-caret banner that predated the 2026
// brand and clashed with the cream page.
export default function SiteHero({ title, description, children }) {
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <div className={styles.taglineContainer}>
          <h1 className={clsx("hero__title", styles.title)}>{title}</h1>
          <p className={clsx("hero__subtitle", styles.subtitle)}>{description}</p>
        </div>
        {children && <div className={styles.heroChildren}>{children}</div>}
      </div>
    </header>
  );
}
