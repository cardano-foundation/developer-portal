import React from "react";
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
  Tools,
} from "@site/src/data/builder-tools/catalog";
import ToolIcon from "@site/src/components/ToolIcon";
import ToolTile from "@site/src/components/ToolTile";
import ExternalArrow from "@site/src/components/ExternalArrow";
import GitHubIcon from "@site/src/components/GitHubIcon";
import PageCTA from "@site/src/components/PageCTA";
import MaintainerPickBadge from "@site/src/components/MaintainerPickBadge";
import Tooltip from "@site/src/components/tools/Tooltip";
import InfoDot from "@site/src/components/tools/InfoDot";

import styles from "./styles.module.css";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import useCopyToClipboard from "@site/src/utils/useCopyToClipboard";

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
  return Tools.filter(
    (s) => s.category === current.category && s.slug !== current.slug
  )
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, RELATED_LIMIT);
}

function ShareButton({ title }) {
  const [copied, copy] = useCopyToClipboard();
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
    await copy(fullUrl);
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
  const tool = Tools.find((t) => t.slug === slug);

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
            <ToolIcon tool={tool} size="detail" />
            <div className={styles.headerText}>
              <h1 className={styles.title}>{tool.title}</h1>
            </div>
          </header>

          <div className={styles.tagRow}>
            {tool.maintainerPick && <MaintainerPickBadge />}
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
                    <ToolTile tool={related} />
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
            buttons={[{ href: editUrl, label: `Edit ${tool.title} on GitHub` }]}
          />
        )}
      </main>
    </Layout>
  );
}
