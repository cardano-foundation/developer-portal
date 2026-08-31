import React, { useMemo, useState } from "react";
import Head from "@docusaurus/Head";
import { PageMetadata } from "@docusaurus/theme-common";
import ogCards from "@site/static/img/og/pages/manifest.json";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import clsx from "clsx";

import ExternalArrow from "@site/src/components/ExternalArrow";
import TemplatesHero from "@site/src/components/TemplatesHero";
import FilterSection from "@site/src/components/TemplatesBrowser/FilterSection";
import ChipRow from "@site/src/components/TemplatesBrowser/ChipRow";
import useFacetSelection from "@site/src/components/TemplatesBrowser/useFacetSelection";
import GitHubIcon from "@site/src/components/GitHubIcon";
import {
  SortedContractShowcases,
  ContractSources,
  MAX_SOURCE_AVATARS,
  OnchainLangs,
  OffchainLangs,
  Categories,
  OnchainList,
  OffchainList,
  CategoryList,
} from "@site/src/data/contracts/showcase";

import styles from "@site/src/components/TemplatesBrowser/browser.module.css";
import heroStyles from "@site/src/components/TemplatesHero/styles.module.css";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";

const TITLE = "Cardano Contracts Library";
const DESCRIPTION =
  "A curated aggregator of reference smart contracts from across Cardano. We index proven work from other open sources and link straight to each contract's own repo, organized by use case.";
// The hero takes the short line; DESCRIPTION stays the full version for
// search results and link previews.
const HERO_DESCRIPTION =
  "Reference contracts from across Cardano, indexed by use case.";

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

// Where contributors learn to add a contract (the contracts data-layer guide).
const CONTRIBUTE_DOC =
  "https://github.com/cardano-foundation/developer-portal/blob/staging/src/data/contracts/README.md";

// A row of the upstream projects this page aggregates, framing it as a curated
// index rather than a first-party catalog. Avatars link to each GitHub org and use
// self-hosted local icons (MAX_SOURCE_AVATARS lives in the data layer); the
// "+N more source(s)" link points at the contributor guide so anyone can propose
// another source.
function SourcesStrip() {
  const { withBaseUrl } = useBaseUrlUtils();
  const shown = ContractSources.slice(0, MAX_SOURCE_AVATARS);
  const overflow = ContractSources.length - shown.length;
  return (
    <>
      <span className={heroStyles.metaText}>Aggregated from</span>
      <div className={heroStyles.avatarStack}>
        {shown.map((s) => (
          <a
            key={s.id}
            className={heroStyles.avatar}
            href={s.url}
            {...EXTERNAL_LINK_PROPS}
            title={s.label}
          >
            <img src={withBaseUrl(s.avatar)} alt={s.label} />
          </a>
        ))}
      </div>
      {overflow > 0 && (
        <a
          className={heroStyles.sourcesMore}
          href={CONTRIBUTE_DOC}
          {...EXTERNAL_LINK_PROPS}
          title={ContractSources.slice(MAX_SOURCE_AVATARS).map((s) => s.label).join(", ")}
        >
          +{overflow} more {overflow === 1 ? "source" : "sources"}
        </a>
      )}
      <span className={heroStyles.metaText}>
        {SortedContractShowcases.length} contracts
      </span>
    </>
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
          {...EXTERNAL_LINK_PROPS}
        >
          {contract.title}
          {onGitHub && <GitHubIcon size={16} />}
        </Link>
      </h2>
      <p className={styles.cardSource}>via {contract.credit}</p>
      <p className={styles.cardDescription}>{contract.description}</p>

      {isReference ? (
        <div className={styles.chipGroup}>
          <div className={styles.chips}>
            <span className={clsx("badge badge--secondary", styles.chipMuted)}>Reference</span>
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
  const { selected, toggle, activeCount, clearAll } = useFacetSelection([
    "categories",
    "onchain",
    "offchain",
  ]);

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
      <PageMetadata image={ogCards.contracts} />
      <TemplatesHero
        title={TITLE}
        description={HERO_DESCRIPTION}
        meta={<SourcesStrip />}
      />
      <main className={clsx("container", styles.page)}>
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
              className={clsx("button button--primary button--block", styles.contributeButton)}
              href={CONTRIBUTE_DOC}
              {...EXTERNAL_LINK_PROPS}
            >
              Contribute a contract
              <ExternalArrow />
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
                    className="button button--outline button--primary"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <ul className={styles.grid}>
                {filtered.map((contract) => (
                  <li key={contract.repoUrl}>
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
