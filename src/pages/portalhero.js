import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";

/**
 * Defines the type interface for the PortalHero component's props.
 */
interface PortalHeroProps {
  /** The main title displayed in the hero banner. */
  title: string;
  /** The subtitle or description text. */
  description: string;
  /** The text displayed on the Call-to-Action button. */
  cta: string; 
  /** Optional filename used to construct the edit URL for content data. */
  filename?: string;
  /** The target URL for navigation if 'filename' is not provided. */
  url: string;
}

/**
 * A flexible Hero banner component for Docusaurus sites.
 * The CTA button dynamically serves as either an external edit link or an internal navigation link.
 */
function PortalHero({ title, description, cta, filename, url }: PortalHeroProps): JSX.Element {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  // Destructure custom fields safely
  const { repository, branch } = siteConfig.customFields as { repository: string; branch: string };

  // Determine the final URL parameters based on the presence of a filename.
  const isEditing = !!filename;

  const linkProps = isEditing
    ? {
        // If filename exists, create an external edit link
        href: `${repository}/edit/${branch}/src/data/${filename}`,
        target: "_blank",
      }
    : {
        // Otherwise, use the provided URL for internal navigation
        to: url,
      };

  const buttonClass = clsx(
    "button button--outline button--warning button--lg", // Changed button--warn to button--warning (standard Docusaurus class)
    styles.getStarted
  );

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{description}</p>
        <div className={styles.buttons}>
          <Link className={buttonClass} {...linkProps}>
            {cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PortalHero;
