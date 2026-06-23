import React, { useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import {
  SortedTemplateShowcases,
  UseCases,
  Frameworks,
  Sdks,
  Wallets,
  UseCaseList,
  FrameworkList,
  SdkList,
  WalletList,
} from "@site/src/data/templates/showcase";

import styles from "./styles.module.css";

const TITLE = "Cardano dApp Templates";
const DESCRIPTION = "Runnable dApp starters you can scaffold in one command";

// Render the screenshot, or a simple placeholder on a missing/broken src. Real
// previews dropped into static/img/template-previews/ display automatically.
function TemplateImage({ template, className }) {
  const src = useBaseUrl(template.screenshot || "");
  const [errored, setErrored] = useState(false);
  const showFallback = !template.screenshot || errored;

  if (showFallback) {
    return (
      <div className={clsx(className, styles.thumbFallback)} aria-hidden>
        <span className={styles.thumbFallbackLabel}>{template.title}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

function stackLine(template) {
  return [Frameworks[template.framework]?.label, Sdks[template.sdk]?.label]
    .filter(Boolean)
    .join(" · ");
}

function filterTemplates(templates, selected, search) {
  const term = search.trim().toLowerCase();
  return templates.filter((t) => {
    if (term && !`${t.title} ${t.description}`.toLowerCase().includes(term)) {
      return false;
    }
    if (selected.useCases.length && !t.useCases.some((u) => selected.useCases.includes(u))) {
      return false;
    }
    if (selected.frameworks.length && !selected.frameworks.includes(t.framework)) return false;
    if (selected.sdks.length && !selected.sdks.includes(t.sdk)) return false;
    if (selected.wallets.length && !selected.wallets.includes(t.wallet)) return false;
    return true;
  });
}

function FilterSection({ heading, list, taxonomy, selected, onToggle }) {
  return (
    <div className={styles.filterSection}>
      <h3 className={styles.filterHeading}>{heading}</h3>
      <ul className={styles.checkList}>
        {list.map((id) => (
          <li key={id}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() => onToggle(id)}
              />
              <span>{taxonomy[id]?.label ?? id}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TemplateCard({ template }) {
  const stack = stackLine(template);
  return (
    <Link to={`/templates/${template.slug}`} className={styles.card}>
      <div className={styles.cardThumb}>
        <TemplateImage template={template} className={styles.cardImage} />
      </div>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{template.title}</h2>
        {stack && <p className={styles.cardStack}>{stack}</p>}
      </div>
    </Link>
  );
}

export default function Templates() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({
    useCases: [],
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
    selected.useCases.length +
    selected.frameworks.length +
    selected.sdks.length +
    selected.wallets.length;

  const clearAll = () =>
    setSelected({ useCases: [], frameworks: [], sdks: [], wallets: [] });

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
            <FilterSection
              heading="Use cases"
              list={UseCaseList}
              taxonomy={UseCases}
              selected={selected.useCases}
              onToggle={toggle("useCases")}
            />
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
            <a
              className={styles.contribute}
              href="https://github.com/cardano-foundation/developer-portal/blob/staging/examples/templates/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contribute a template
            </a>
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
