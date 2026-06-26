import React, { useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import clsx from "clsx";

import TemplatesTabs from "@site/src/components/TemplatesTabs";
import FilterSection from "@site/src/components/TemplatesBrowser/FilterSection";
import ChipRow from "@site/src/components/TemplatesBrowser/ChipRow";
import GitHubIcon from "@site/src/components/TemplatesBrowser/GitHubIcon";
import {
  SortedContractShowcases,
  ContractSources,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "@site/src/data/contracts/showcase";

import styles from "@site/src/components/TemplatesBrowser/browser.module.css";

const TITLE = "Cardano Contracts Library";
const DESCRIPTION =
  "A curated, open index of reference smart contracts from across the Cardano ecosystem, organized by use case.";

function filterContracts(contracts, selected, search) {
  const term = search.trim().toLowerCase();
  return contracts.filter((c) => {
    if (term && !`${c.title} ${c.description}`.toLowerCase().includes(term)) {
      return false;
    }
    // Category is single-valued per card: OR within the group.
    if (selected.categories.length && !selected.categories.includes(c.category)) {
      return false;
    }
    // On-chain / off-chain are multi-valued: a card matches if it has any
    // selected lang (OR within group), and groups are ANDed together.
    if (
      selected.onchain.length &&
      !selected.onchain.some((id) => c.onchain.includes(id))
    ) {
      return false;
    }
    if (
      selected.offchain.length &&
      !selected.offchain.some((id) => c.offchain.includes(id))
    ) {
      return false;
    }
    return true;
  });
}

// Whether the primary source link points at GitHub (controls the title icon).
function isGitHubUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === "github.com";
  } catch (e) {
    return false;
  }
}

// A row of the upstream projects this page aggregates, framing it as a curated
// index rather than a first-party catalog. Avatars link to each GitHub org.
function SourcesStrip() {
  const MAX = 3;
  const shown = ContractSources.slice(0, MAX);
  const overflow = ContractSources.length - shown.length;
  return (
    <div className={styles.sources}>
      <div className={styles.avatarStack}>
        {shown.map((s) => (
          <a
            key={s.id}
            className={styles.avatar}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.label}
          >
            <img src={s.avatar} alt={s.label} width={28} height={28} />
          </a>
        ))}
      </div>
      {overflow > 0 && (
        <span
          className={styles.sourcesMore}
          title={ContractSources.slice(MAX).map((s) => s.label).join(", ")}
        >
          +{overflow} more {overflow === 1 ? "source" : "sources"}
        </span>
      )}
      <span className={styles.sourcesLabel}>
        {SortedContractShowcases.length} contracts
      </span>
    </div>
  );
}

function ContractCard({ contract }) {
  const isReference = Boolean(contract.reference);
  const onGitHub = isGitHubUrl(contract.repoUrl);
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <Link
          className={styles.cardTitleLink}
          href={contract.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {contract.title}
          {onGitHub && <GitHubIcon size={16} />}
        </Link>
      </h2>
      <p className={styles.cardSource}>via {contract.source}</p>
      <p className={styles.cardDescription}>{contract.description}</p>

      {isReference ? (
        <div className={styles.chipGroup}>
          <div className={styles.chips}>
            <span className={clsx(styles.chip, styles.chipMuted)}>Reference</span>
          </div>
        </div>
      ) : (
        <>
          <ChipRow
            label="On-chain"
            ids={contract.onchain}
            taxonomy={OnchainLangs}
          />
          <ChipRow
            label="Off-chain"
            ids={contract.offchain}
            taxonomy={OffchainLangs}
          />
        </>
      )}
    </div>
  );
}

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({
    categories: [],
    onchain: [],
    offchain: [],
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
    selected.categories.length + selected.onchain.length + selected.offchain.length;

  const clearAll = () =>
    setSelected({ categories: [], onchain: [], offchain: [] });

  const filtered = useMemo(
    () => filterContracts(SortedContractShowcases, selected, search),
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
          <p className={styles.pageSubtitle}>{DESCRIPTION}</p>
          <TemplatesTabs />
          <SourcesStrip />
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Filter contracts">
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Filter contracts</h2>
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
              placeholder="Search contracts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search contracts"
            />
            <a
              className={styles.contributeButton}
              href="https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/contracts/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">+</span>
              Contribute a source
            </a>
            <FilterSection
              heading="Category"
              list={CategoryList}
              taxonomy={Categories}
              selected={selected.categories}
              onToggle={toggle("categories")}
            />
            <FilterSection
              heading="On-chain"
              list={OnchainList}
              taxonomy={OnchainLangs}
              selected={selected.onchain}
              onToggle={toggle("onchain")}
            />
            <FilterSection
              heading="Off-chain"
              list={OffchainList}
              taxonomy={OffchainLangs}
              selected={selected.offchain}
              onToggle={toggle("offchain")}
            />
          </aside>

          <section className={styles.results}>
            {(activeCount > 0 || search.trim().length > 0) && (
              <div className={styles.resultsHeader}>
                <span className={styles.resultsCount}>
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "contract" : "contracts"}
                </span>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>No contracts match these filters.</p>
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
                {filtered.map((contract) => (
                  <li key={contract.slug}>
                    <ContractCard contract={contract} />
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
