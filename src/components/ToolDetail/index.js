import React, { useEffect, useRef, useState } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { PageMetadata } from "@docusaurus/theme-common";
import ogCards from "@site/static/img/og/pages/manifest.json";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";

import {
  Categories,
  Properties,
  Showcases,
} from "@site/src/data/builder-tools/showcase";
import AppIcon from "@site/src/components/AppIcon";
import AppTile from "@site/src/components/AppTile";
import ExternalArrow from "@site/src/components/ExternalArrow";
import PageCTA from "@site/src/components/PageCTA";
import Tooltip from "@site/src/components/showcase/ShowcaseTooltip/index";
import InfoDot from "@site/src/components/showcase/InfoDot";

import styles from "./styles.module.css";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";

// Three fills the related grid's row exactly at the container width; a
// fourth card would wrap alone.
const RELATED_LIMIT = 3;

function buildJsonLd(tool, categoryLabel) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title,
    description: tool.description,
    url: tool.website,
    ...(tool.repository ? { codeRepository: tool.repository } : {}),
    ...(categoryLabel ? { applicationCategory: categoryLabel } : {}),
  });
}

function GitHubIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.05c-3.2.7-3.87-1.37-3.87-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.16 1.18a10.94 10.94 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.05.78 2.13v3.16c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

function TagPill({ tag, def, info }) {
  if (!def) return null;
  const pill = (
    <Link
      to={`/tools?tags=${tag}`}
      className="badge badge--secondary"
      title={def.description}
    >
      {def.label}
      {info && <InfoDot />}
    </Link>
  );
  if (!info) return pill;
  return (
    <Tooltip text={def.description} id={`detail_cat_${tag}`} anchorEl="#__docusaurus">
      {pill}
    </Tooltip>
  );
}

function getRelatedTools(current) {
  return Showcases.filter(
    (s) => s.category === current.category && s.slug !== current.slug
  )
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, RELATED_LIMIT);
}

function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  const onClick = async () => {
    const fullUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // user cancelled or share failed
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1500);
      } catch {
        // clipboard blocked: fail silently
      }
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("button button--outline button--primary", styles.iconButton)}
      aria-label="Share"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 12l5 5 9-9"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16V4M12 4l-4 4M12 4l4 4M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"
          />
        </svg>
      )}
    </button>
  );
}

function NotFound() {
  return (
    <Layout title="Tool not found">
      <main className={clsx("container", styles.detail, styles.notFoundPad)}>
        <h1 className={styles.title}>Tool not found</h1>
        <p className={styles.description}>
          This tool may have been renamed or removed.
        </p>
        <div className={styles.actions}>
          <Link to="/tools" className="button button--primary">
            Back to Builder Tools
          </Link>
        </div>
      </main>
    </Layout>
  );
}

export default function ToolDetail({ slug }) {
  const { siteConfig } = useDocusaurusContext();
  const tool = Showcases.find((t) => t.slug === slug);

  if (!tool) return <NotFound />;

  const categoryDef = Categories[tool.category];
  const relatedTools = getRelatedTools(tool);

  const repository = siteConfig.customFields?.repository;
  const branch = siteConfig.customFields?.branch;
  const editUrl =
    repository && branch
      ? `${repository}/edit/${branch}/src/data/builder-tools/tools.js`
      : repository;

  const pageTitle = `${tool.title}, Cardano builder tool`;
  const pageDescription = tool.description;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Head>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <script type="application/ld+json">
          {buildJsonLd(tool, categoryDef?.label)}
        </script>
      </Head>
      <PageMetadata image={ogCards.tools} />
      {/* The CTA band brings its own container, so the page body carries one of
          its own rather than main. Both stay inside the main landmark. */}
      <main className={styles.detail}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <Link to="/tools">Builder Tools</Link>
            {categoryDef && (
              <>
                <span className={styles.crumbSep} aria-hidden>
                  /
                </span>
                <Link to={`/tools?tags=${tool.category}`}>{categoryDef.label}</Link>
              </>
            )}
            <span className={styles.crumbSep} aria-hidden>
              /
            </span>
            <span className={styles.crumbCurrent}>{tool.title}</span>
          </nav>

          <header className={styles.header}>
            <AppIcon app={tool} size="detail" />
            <div className={styles.headerText}>
              <h1 className={styles.title}>{tool.title}</h1>
            </div>
          </header>

          <div className={styles.tagRow}>
            {tool.maintainerPick && (
              <span className={clsx("badge badge--primary", styles.pickBadge)}>
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden focusable="false">
                  <path
                    fill="currentColor"
                    d="M12 2.5l2.9 6.5 7.1.8-5.3 4.9 1.5 7-6.2-3.6L5.8 21.7l1.5-7L2 9.8l7.1-.8z"
                  />
                </svg>
                Maintainer pick
              </span>
            )}
            {tool.repository && <span className="badge badge--secondary">Open Source</span>}
            <TagPill tag={tool.category} def={categoryDef} info />
            {tool.properties.map((p) => (
              <TagPill key={p} tag={p} def={Properties[p]} />
            ))}
          </div>

          <p className={styles.description}>{tool.description}</p>

          <div className={styles.actions}>
            {tool.repository ? (
              <Link href={tool.repository} className="button button--primary" {...EXTERNAL_LINK_PROPS}>
                <GitHubIcon size={18} />
                View on GitHub
                <ExternalArrow />
              </Link>
            ) : (
              <Link href={tool.website} className="button button--primary" {...EXTERNAL_LINK_PROPS}>
                {`Visit ${tool.title}`}
                <ExternalArrow />
              </Link>
            )}
            {tool.repository && tool.website && tool.website !== tool.repository && (
              <Link href={tool.website} className="button button--outline button--primary" {...EXTERNAL_LINK_PROPS}>
                Visit website
                <ExternalArrow />
              </Link>
            )}
            {tool.docs && (
              <Link href={tool.docs} className="button button--outline button--primary" {...EXTERNAL_LINK_PROPS}>
                Get Started
                <ExternalArrow />
              </Link>
            )}
            <ShareButton title={tool.title} />
          </div>

          {relatedTools.length > 0 && (
            <section className={styles.related}>
              <h2 className={styles.sectionHeading}>More in this category</h2>
              <ul className={styles.relatedGrid}>
                {relatedTools.map((related) => (
                  <li key={related.slug}>
                    <AppTile app={related} />
                  </li>
                ))}
              </ul>
              <Link className={styles.relatedMore} to={`/tools?tags=${tool.category}`}>
                {`View all ${categoryDef?.label ?? tool.category} tools`}
              </Link>
            </section>
          )}
        </div>
        {editUrl && (
          <PageCTA
            title="Spotted something off?"
            description="This directory is open source. Open a pull request to update or correct this entry."
            href={editUrl}
            buttonText={`Edit ${tool.title} on GitHub`}
          />
        )}
      </main>
    </Layout>
  );
}
