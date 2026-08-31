import React from "react";
import Link from "@docusaurus/Link";
import clsx from "clsx";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { EXTERNAL_LINK_PROPS, isExternalHref } from "@site/src/utils/externalLink";
import FileIcon from "@site/static/img/icons/file-outline.svg";

import styles from "./styles.module.css";

// Reusable section-level CTA: a navy band whose buttons take the amber
// context. A button whose href leaves the site opens a new tab and carries the
// external arrow. `buttons` is a list of { href, label }; `art` is an optional
// image URL drawn into the band's right side on wide screens.
function CtaLink({ href, children }) {
  const external = isExternalHref(href);
  return (
    <Link
      className="button button--primary"
      to={href}
      {...(external ? EXTERNAL_LINK_PROPS : {})}
    >
      {children}
      {external && <ExternalArrow />}
    </Link>
  );
}

export default function PageCTA({ title, description, buttons, art = null }) {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={clsx(styles.band, art && styles.bandWithArt)}>
          <FileIcon className={styles.bandIcon} aria-hidden="true" />
          <div className={styles.bandContent}>
            <h2 className={styles.bandTitle}>{title}</h2>
            <p className={styles.bandText}>{description}</p>
            <div className={styles.pillRow}>
              {buttons.map(({ href, label }) => (
                <CtaLink key={href} href={href}>
                  {label}
                </CtaLink>
              ))}
            </div>
          </div>
          {art && (
            <img className={styles.bandArt} src={art} alt="" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
}
