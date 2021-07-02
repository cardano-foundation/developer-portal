import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function PortalHero({ title, description, cta, filename, url }) {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const EDIT_URL = !filename ? url : `${siteConfig.customFields.repository}/edit/${siteConfig.customFields.branch}/src/data/${filename}`;
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{description}</p>
        <div className={styles.buttons}>
          <Link
            className={clsx(
              "button button--outline button--warn button--lg",
              styles.getStarted
            )}
            {...(filename && {href: EDIT_URL, target: "_blank"})}
            {...(!filename && {to: url})}
          >
            {cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PortalHero;
