import React, { useEffect, useRef, useState } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import {
  TemplateShowcases,
  UseCases,
  Frameworks,
  Sdks,
  Wallets,
} from "@site/src/data/templates/showcase";

import styles from "./styles.module.css";

const OG_IMAGE = "https://developers.cardano.org/img/og/og-builder-tools.png";

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

// Hero: the screenshot, or a simple placeholder on a missing/broken src.
function HeroImage({ template }) {
  const src = useBaseUrl(template.screenshot || "");
  const [errored, setErrored] = useState(false);
  const showFallback = !template.screenshot || errored;

  if (showFallback) {
    return (
      <div className={clsx(styles.hero, styles.heroFallback)} aria-hidden>
        <span className={styles.heroFallbackLabel}>{template.title}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${template.title} preview`}
      className={styles.hero}
      onError={() => setErrored(true)}
    />
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onClick = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
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
      className={styles.copyButton}
      aria-label="Copy to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// A code block with the command on one line (scrolls if long) and a small copy
// button in the corner, like a normal docs code block.
function CodeBlock({ code }) {
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBar}>
        <span className={styles.codeLang}>Terminal</span>
        <CopyButton text={code} />
      </div>
      <pre className={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MetaRow({ label, value }) {
  if (!value) return null;
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}

function NotFound() {
  return (
    <Layout title="Template not found">
      <main className={clsx("container", styles.detail)}>
        <h1>Template not found</h1>
        <p>
          This template may have been renamed or removed.{" "}
          <Link to="/templates">Back to templates</Link>.
        </p>
      </main>
    </Layout>
  );
}

export default function TemplateDetail({ slug }) {
  const template = TemplateShowcases.find((t) => t.slug === slug);

  if (!template) return <NotFound />;

  const pageTitle = `${template.title}, Cardano dApp template`;
  const pageDescription = template.description;

  return (
    <Layout title={pageTitle} description={pageDescription}>
      <Head>
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <main className={clsx("container", styles.detail)}>
        <Link to="/templates" className={styles.backLink}>
          ← Back to templates
        </Link>

        <HeroImage template={template} />

        <header className={styles.header}>
          {template.maintainerPick && (
            <span className={styles.pickBadge}>★ Maintainer pick</span>
          )}
          <h1 className={styles.title}>{template.title}</h1>
        </header>

        <div className={styles.columns}>
          <div className={styles.main}>
            <p className={styles.description}>{template.description}</p>

            <p className={styles.guideNote}>
              New to building on Cardano? Start with the{" "}
              <Link to="/docs/developers/curriculum/dapps/your-first-dapp">
                Build a dApp guide
              </Link>
              .
            </p>

            <h2 className={styles.sectionHeading}>Get started</h2>
            <ol className={styles.steps}>
              <li>
                Open a terminal in the folder where you keep your projects and run
                this. It copies the template into a new <code>my-app</code> folder:
                <CodeBlock code={template.command} />
              </li>
              <li>
                Install dependencies and start the dev server:
                <CodeBlock code={`cd my-app\nnpm install\ncp .env.example .env\nnpm run dev`} />
              </li>
              <li>
                Set the env values from the template README, then start building.
              </li>
            </ol>
            <Link href={template.githubUrl} className={styles.readmeLink}>
              <GitHubIcon size={16} />
              Read the template README on GitHub
            </Link>
          </div>

          <aside className={styles.metaCard}>
            <MetaRow label="Framework" value={Frameworks[template.framework]?.label} />
            <MetaRow label="SDK" value={Sdks[template.sdk]?.label} />
            <MetaRow label="Wallet" value={Wallets[template.wallet]?.label} />
            {template.useCases?.length > 0 && (
              <div className={clsx(styles.metaRow, styles.metaRowBadges)}>
                <span className={styles.metaLabel}>Use cases</span>
                <span className={styles.badgeList}>
                  {template.useCases.map((u) => (
                    <span key={u} className={styles.useCaseBadge}>
                      {UseCases[u]?.label ?? u}
                    </span>
                  ))}
                </span>
              </div>
            )}
            <Link href={template.githubUrl} className={styles.sourceButton}>
              <GitHubIcon size={18} />
              View source on GitHub
            </Link>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
