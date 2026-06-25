import React, { useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import TemplatesTabs from "@site/src/components/TemplatesTabs";
import FilterSection from "@site/src/components/TemplatesBrowser/FilterSection";
import ChipRow from "@site/src/components/TemplatesBrowser/ChipRow";
import {
  SortedTemplateShowcases,
  Frameworks,
  Sdks,
  Wallets,
  FrameworkList,
  SdkList,
  WalletList,
} from "@site/src/data/templates/showcase";

import styles from "@site/src/components/TemplatesBrowser/browser.module.css";

const TITLE = "Cardano dApp Templates";
const DESCRIPTION = "Runnable dApp starters you can scaffold in one command";

function filterTemplates(templates, selected, search) {
  const term = search.trim().toLowerCase();
  return templates.filter((t) => {
    if (term && !`${t.title} ${t.description}`.toLowerCase().includes(term)) {
      return false;
    }
    if (selected.frameworks.length && !selected.frameworks.includes(t.framework)) return false;
    if (selected.sdks.length && !selected.sdks.includes(t.sdk)) return false;
    if (selected.wallets.length && !selected.wallets.includes(t.wallet)) return false;
    return true;
  });
}

function TemplateCard({ template }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Link className={styles.cardTitleLink} to={`/templates/${template.slug}`}>
          {template.title}
        </Link>
      </h2>
      <p className={styles.cardDescription}>{template.description}</p>
      <ChipRow label="Framework" ids={[template.framework]} taxonomy={Frameworks} />
      <ChipRow label="SDK" ids={[template.sdk]} taxonomy={Sdks} />
      <ChipRow label="Wallet" ids={[template.wallet]} taxonomy={Wallets} />
    </div>
  );
}

export default function Templates() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({
    frameworks: [],
    sdks: [],
    wallets: [],
  });

  const toggle = (group) => (id) =>
    setSelected((prev) => {
      const has = prev[group].includes(id);
      return {
        ...prev,
        [group]: has ? prev[group].filter((x) => x !== id) : [...prev[group], id],
      };
    });

  const activeCount =
    selected.frameworks.length + selected.sdks.length + selected.wallets.length;

  const clearAll = () => setSelected({ frameworks: [], sdks: [], wallets: [] });

  const filtered = useMemo(
    () => filterTemplates(SortedTemplateShowcases, selected, search),
    [selected, search]
  );

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <Head>
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
      </Head>
      <main className={clsx("container", styles.page)}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{TITLE}</h1>
          <p className={styles.pageSubtitle}>
            Start from a working dApp. Scaffold a wallet-connected starter and
            ship from there.
          </p>
          <TemplatesTabs />
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Filter templates">
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Filter templates</h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={styles.clearButton}
                >
                  Clear
                </button>
              )}
            </div>
            <input
              className={styles.searchInput}
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search templates"
            />
            <a
              className={styles.contributeButton}
              href="https://github.com/cardano-foundation/developer-portal/blob/staging/examples/templates/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">+</span>
              Contribute a template
            </a>
            <FilterSection
              heading="Frameworks"
              list={FrameworkList}
              taxonomy={Frameworks}
              selected={selected.frameworks}
              onToggle={toggle("frameworks")}
            />
            <FilterSection
              heading="SDKs"
              list={SdkList}
              taxonomy={Sdks}
              selected={selected.sdks}
              onToggle={toggle("sdks")}
            />
            <FilterSection
              heading="Wallet connection"
              list={WalletList}
              taxonomy={Wallets}
              selected={selected.wallets}
              onToggle={toggle("wallets")}
            />
          </aside>

          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsCount}>
                {filtered.length}{" "}
                {filtered.length === 1 ? "template" : "templates"}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>No templates match these filters.</p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="button button--secondary"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <ul className={styles.grid}>
                {filtered.map((template) => (
                  <li key={template.slug}>
                    <TemplateCard template={template} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
