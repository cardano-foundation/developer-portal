import React from "react";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { externalLinkProps } from "@site/src/utils/externalLink";
import FileIcon from "@site/static/img/icons/file-outline.svg";

import styles from "./styles.module.css";

// Reusable section-level CTA: a navy band whose buttons take the amber
// context. A button whose href leaves the site opens a new tab and carries the
// external arrow. `secondaryButton` is optional.
function CtaLink({ href, children }) {
  const external = !isInternalUrl(href);
  return (
    <Link
      className="button button--primary"
      to={href}
      {...(external ? externalLinkProps(href) : {})}
    >
      {children}
      {external && <ExternalArrow />}
    </Link>
  );
}

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
              <CtaLink href={href}>{buttonText}</CtaLink>
              {secondaryButton && (
                <CtaLink href={secondaryButton.href}>{secondaryButton.label}</CtaLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
