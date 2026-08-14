import React from "react";
import Link from "@docusaurus/Link";
import FileIcon from "@site/static/img/icons/file-outline.svg";

import styles from "./styles.module.css";

// Reusable section-level CTA: a navy band with amber pill buttons, the
// brand's call-to-action treatment. `secondaryButton` is optional.
export default function PageCTA({
  title,
  description,
  href,
  buttonText,
  secondaryButton = null,
}) {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.band}>
          <FileIcon className={styles.bandIcon} aria-hidden="true" />
          <div className={styles.bandContent}>
            <h2 className={styles.bandTitle}>{title}</h2>
            <p className={styles.bandText}>{description}</p>
            <div className={styles.pillRow}>
              <Link className={styles.pill} to={href}>
                {buttonText}
                <span className={styles.pillArrow} aria-hidden="true">→</span>
              </Link>
              {secondaryButton && (
                <Link className={styles.pill} to={secondaryButton.href}>
                  {secondaryButton.label}
                  <span className={styles.pillArrow} aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
