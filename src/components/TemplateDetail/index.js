import React, { useEffect, useRef, useState } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";

import GitHubIcon from "@site/src/components/TemplatesBrowser/GitHubIcon";
import PageCTA from "@site/src/components/PageCTA";
import {
  TemplateShowcases,
  Frameworks,
  Sdks,
  Wallets,
} from "@site/src/data/templates/showcase";

import styles from "./styles.module.css";

const OG_IMAGE = "https://developers.cardano.org/img/og/og-builder-tools.jpg";

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
      <main className={clsx("container", styles.detail, styles.detailInner)}>
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
  const { siteConfig } = useDocusaurusContext();
  const template = TemplateShowcases.find((t) => t.slug === slug);

  if (!template) return <NotFound />;

  const repository = siteConfig.customFields?.repository;
  const branch = siteConfig.customFields?.branch;
  const editUrl =
    repository && branch
      ? `${repository}/edit/${branch}/src/data/templates/templates.js`
      : repository;

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
      {/* PageCTA brings its own container, so it sits beside the inner one
          rather than inside it. Keeping it within <main> leaves the edit link
          inside a landmark. */}
      <main className={styles.detail}>
        <div className={clsx("container", styles.detailInner)}>
          <Link to="/templates" className={styles.backLink}>
            ← Back to templates
          </Link>

          <header className={styles.header}>
            {template.maintainerPick && (
              <span className={styles.pickBadge}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable={false}>
                  <path
                    fill="currentColor"
                    d="M12 2.5l2.9 6.5 7.1.8-5.3 4.9 1.5 7-6.2-3.6L5.8 21.7l1.5-7L2 9.8l7.1-.8z"
                  />
                </svg>
                Maintainer pick
              </span>
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
              <p className={styles.guideNote}>
                You need Node.js 20.19+, a Cardano wallet browser extension, and a
                free <Link href="https://blockfrost.io">Blockfrost</Link> project
                ID. Get test ADA from the{" "}
                <Link to="/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada">
                  faucet
                </Link>
                .
              </p>
              <ol className={styles.steps}>
                <li>
                  Scaffold the project into a new <code>my-app</code> folder:
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
              <Link
                href={template.githubUrl}
                className={styles.readmeLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={16} />
                Read the template README on GitHub
              </Link>
            </div>

            <aside className={styles.metaCard}>
              <MetaRow label="Framework" value={Frameworks[template.framework]?.label} />
              <MetaRow label="SDK" value={Sdks[template.sdk]?.label} />
              <MetaRow label="Wallet" value={Wallets[template.wallet]?.label} />
              <Link
                href={template.githubUrl}
                className={styles.sourceButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={18} />
                View source on GitHub
              </Link>
            </aside>
          </div>
        </div>
        {editUrl && (
          <PageCTA
            title="Spotted something off?"
            description="This directory is open source. Open a pull request to update or correct this entry."
            href={editUrl}
            buttonText={`Edit ${template.title} on GitHub`}
          />
        )}
      </main>
    </Layout>
  );
}
