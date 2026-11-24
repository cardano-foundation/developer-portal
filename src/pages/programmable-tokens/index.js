import React from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { PageMetadata } from "@docusaurus/theme-common";
import clsx from "clsx";
import ogCards from "@site/static/img/og/pages/manifest.json";
import ExternalArrow from "@site/src/components/ExternalArrow";
import PageCTA from "@site/src/components/PageCTA";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import home from "../styles.module.css";
import styles from "./styles.module.css";

const TITLE = "Programmable Tokens on Cardano";
const DESCRIPTION =
  "Programmable tokens are Cardano native tokens that change owner only when a smart contract approves the transfer, as defined in CIP-113.";

const DOC_URL = "/docs/developers/curriculum/native-tokens/programmable-tokens";
const OVERVIEW_URL = "https://cardano.org/programmable-tokens/";
const CIP_URL = "https://cips.cardano.org/cip/CIP-0113";
const CIP_SOURCE = "https://github.com/cardano-foundation/CIPs/tree/master/CIP-0113";
const ONCHAIN_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens";
const ONCHAIN_DOCS = `${ONCHAIN_REPO}/blob/main/documentation`;
const AUDIT_REPORTS = `${ONCHAIN_REPO}/tree/main/documentation/audit`;
const PLATFORM_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens-platform";
const CMTA_REPO = "https://github.com/cardano-foundation/cpt-rwa-ch-cmta-reference";
const CMTA_URL = "https://cmta.ch";
const CMTA_CERTIFICATION = "https://cmta.ch/certification/cmta-tokenized-shares-certification";

/* Each fact links to the source that states it. */
const STATUS = [
  {
    name: "A published standard",
    body: "CIP-113 is merged into the CIPs repository.",
    href: CIP_URL,
    linkLabel: "Read CIP-113",
  },
  {
    name: "Audited",
    body: "The reference contracts were professionally audited.",
    href: AUDIT_REPORTS,
    linkLabel: "Audit reports",
  },
  {
    name: "Recognized by CMTA",
    body: "The Swiss standards association for tokenized securities recognizes the reference module for tokenized shares.",
    href: `${CMTA_REPO}#cmta-recognition`,
    linkLabel: "The recognition",
  },
];

/* What exists today. The controls are the ones each module's README lists
   as implemented. */
const MODULES = [
  {
    title: "Tokenized securities",
    lead: "KYC checks, a global pause and forced transfers.",
    body: (
      <>
        <ExtLink href={CMTA_URL}>CMTA</ExtLink> is the Swiss association that sets standards for
        issuing and trading securities as tokens. It{" "}
        <ExtLink href={`${CMTA_REPO}#cmta-recognition`}>recognized this module</ExtLink> for
        tokenized shares, so an issuer can use it when applying for the{" "}
        <ExtLink href={CMTA_CERTIFICATION}>CMTA Tokenized Shares certification mark</ExtLink>,
        under four conditions for each deployment.
      </>
    ),
    card: {
      name: "CMTA reference",
      by: "Finest + Cardano Foundation",
      status: "Audited, CMTA-recognized",
      recognized: true,
      controls: [
        "KYC-gated transfers",
        "Sanctions denylist",
        "Global pause",
        "Forced transfers",
        "Supply caps",
        "Role-based permissions",
      ],
      href: CMTA_REPO,
      linkLabel: "Open the repository",
    },
  },
  {
    title: "Regulated stablecoins",
    lead: "Freeze and seize on a native token.",
    body: "An issuer can stop a denylisted holder from transferring, freeze a balance, and seize tokens for legal or regulatory reasons. This module is a working example to start from.",
    card: {
      name: "Freeze and Seize",
      by: "Cardano Foundation",
      status: "Example module",
      controls: ["Denylist checked on every transfer", "Freeze and unfreeze", "Seize"],
      href: `${PLATFORM_REPO}/tree/main/src/modules/freeze-and-seize`,
      linkLabel: "Open the module",
    },
  },
];

/* One transfer, as what each smart contract enforces. They do not call each
   other: each requires the next to run in the same transaction, and the
   ledger runs all of them. Source: CIP-0113, "Transfer" and "Architecture:
   Delegation Pattern". */
const CHECKS = [
  {
    name: "Custody",
    body: "The token sits at one shared script address, so it cannot move without the checks below.",
    by: "programmableLogicBase",
    scope: "Standard",
  },
  {
    name: "Declared action",
    body: "The transaction declares a transfer, so the transfer checks have to run with it.",
    by: "programmableLogicGlobal",
    scope: "Standard",
  },
  {
    name: "Ownership",
    body: "The holder signed, and every output of the token stays at a smart wallet address.",
    by: "transfer delegate",
    scope: "Standard",
  },
  {
    name: "Issuer's rules",
    body: "The token's own transfer logic approves, for example that a holder is not on a denylist.",
    by: "transfer_logic_script",
    scope: "Module",
    module: true,
  },
];

const COMPARE = [
  {
    topic: "On a transfer",
    native: "Moves freely between addresses. No smart contract runs.",
    programmable: "A smart contract has to approve every change of owner.",
  },
  {
    topic: "Freeze and seize",
    native: "Not possible.",
    programmable: "Possible when the token's module allows it.",
  },
  {
    topic: "Who holds the keys",
    native: "The holder.",
    programmable: "Still the holder. The token sits at a smart wallet address derived from their key.",
  },
  {
    topic: "Changing the rules",
    native: "The minting policy is fixed.",
    programmable:
      "In the reference implementation the issuer can replace a token's logic. Addresses and policy IDs stay the same.",
  },
  {
    topic: "Cost",
    native: "The standard transaction fee.",
    programmable:
      "Smart contract fees on every transfer. Most checks run once per transaction, not once per input.",
  },
];

/* What a reader should verify before relying on a given token. */
const LIMITS = [
  {
    name: "Each token sets its own rules",
    body: "Read a token's third-party logic before you integrate it. It decides what can happen to a balance without the holder's signature, and who can trigger it.",
    href: `${CIP_SOURCE}#specification`,
    linkLabel: "The specification",
  },
  {
    name: "Rules can be replaced",
    body: "In the reference implementation an issuer can replace a token's logic, and an upgrade authority can replace the shared dispatcher. Check who holds both.",
    href: `${ONCHAIN_DOCS}/02-ARCHITECTURE.md`,
    linkLabel: "Architecture",
  },
  {
    name: "Audits have a scope",
    body: "The reference contracts and the CMTA reference each have their own audit. A module you write or adapt needs its own review.",
    href: AUDIT_REPORTS,
    linkLabel: "Audit reports",
  },
];

const STARTS = [
  {
    name: "Try it on a testnet",
    body: "A frontend and backend to deploy, register, mint and transfer with the example modules.",
    href: PLATFORM_REPO,
    linkLabel: "Reference platform",
  },
  {
    name: "Write a module",
    body: "The audited Aiken contracts, and how to build your own rule set on top of them.",
    href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`,
    linkLabel: "Writing a module",
  },
  {
    name: "Integrate as a wallet or dApp",
    body: "Show balances, find programmable tokens and build the transactions that move them.",
    href: `${ONCHAIN_DOCS}/08-INTEGRATION-GUIDES.md`,
    linkLabel: "Integration guides",
  },
  {
    name: "Regulatory context",
    body: "The regulatory frameworks and the institutional case.",
    href: OVERVIEW_URL,
    linkLabel: "Programmable tokens on cardano.org",
  },
];

function ExtLink({ href, children, className }) {
  return (
    <a href={href} {...EXTERNAL_LINK_PROPS} className={className}>
      {children}
    </a>
  );
}

function ArrowLink({ href, children }) {
  return (
    <ExtLink href={href} className={styles.sourceLink}>
      {children}
      <ExternalArrow />
    </ExtLink>
  );
}

function Pills({ items, three }) {
  return (
    <dl className={clsx(styles.statusRow, three && styles.statusRowThree)}>
      {items.map(item => (
        <div key={item.name}>
          <dt>{item.name}</dt>
          <dd>{item.body}</dd>
          <dd>
            <ArrowLink href={item.href}>{item.linkLabel}</ArrowLink>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ModuleCard({ card }) {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleCardHead}>
        <div>
          <strong>{card.name}</strong>
          <span>{card.by}</span>
        </div>
        <span className={clsx("badge", card.recognized ? "badge--primary" : "badge--secondary")}>
          {card.status}
        </span>
      </div>
      <ul>
        {card.controls.map(control => (
          <li key={control}>{control}</li>
        ))}
      </ul>
      <ArrowLink href={card.href}>{card.linkLabel}</ArrowLink>
    </div>
  );
}

export default function ProgrammableTokensPage() {
  const bandArt = useBaseUrl("img/talent/start-building-cubes.webp");

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <PageMetadata image={ogCards["programmable-tokens"]} />
      <main className={styles.page}>
        <section className={home.hero}>
          <div className={styles.heroRings} aria-hidden="true" />
          <div className="container">
            <div className={clsx(home.heroContent, styles.heroContentStacked)}>
              <div className={home.heroLeft}>
                <h1 className={clsx(home.heroTitle, styles.heroTitleFit)}>Programmable Tokens</h1>
              </div>
              <div className={clsx(home.heroRight, styles.heroStackedRight)}>
                <p className={styles.heroLead}>
                  Cardano native tokens that change owner only when a smart contract approves.
                </p>
                <p className={home.heroSubtitle}>
                  For regulated stablecoins and tokenized securities that need issuer controls
                  such as freeze and seize, denylists and KYC checks.
                </p>
                <div className={home.heroActions}>
                  <a className="button button--primary" href="#start">
                    Start building
                  </a>
                  <a className="button button--outline button--primary" href="#how">
                    How it works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.statusSection}>
          <div className="container">
            <Pills items={STATUS} three />
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>What exists today</h2>
              <p>Two modules to start from. A module is the rule set of one token.</p>
            </div>
            {MODULES.map((module, index) => (
              <div key={module.title} className={home.devPanel}>
                <div className={home.devPanelCopy}>
                  <div className={home.devPanelHeader}>
                    <h3>{module.title}</h3>
                    <p>{module.lead}</p>
                  </div>
                  <p className={styles.panelBody}>{module.body}</p>
                </div>
                <div className={clsx(home.devPanelArt, index % 2 === 0 && home.devPanelArtLead)}>
                  <ModuleCard card={module.card} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>What changes from a native token</h2>
              <p>A programmable token is still a native token to the ledger. These are the differences that matter.</p>
            </div>
            <div className={styles.panel}>
              <div className={styles.tableWrap}>
                <table className={clsx(styles.table, styles.compareTable)}>
                  <thead>
                    <tr>
                      <th aria-label="Topic" />
                      <th>Native token</th>
                      <th>Programmable token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map(row => (
                      <tr key={row.topic}>
                        <td>{row.topic}</td>
                        <td className={styles.tableBody} data-label="Native token">
                          {row.native}
                        </td>
                        <td data-label="Programmable token">{row.programmable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="how">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>How a transfer is checked</h2>
              <p>Four checks run in the same transaction. Three come from the standard. The fourth is the issuer&apos;s.</p>
            </div>
            <div className={styles.panel}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>What it guarantees</th>
                      <th>Enforced by</th>
                      <th>Defined by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHECKS.map(row => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td className={styles.tableBody}>{row.body}</td>
                        <td>
                          <code>{row.by}</code>
                        </td>
                        <td>
                          <span
                            className={clsx(
                              "badge",
                              row.module ? "badge--primary" : "badge--secondary",
                            )}
                          >
                            {row.scope}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.callout}>
                <strong>A transfer is all or nothing.</strong> If one check fails, the whole
                transaction is invalid and no token changes owner.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Before you rely on a token</h2>
              <p>The standard guarantees that a token&apos;s rules run. It does not choose them.</p>
            </div>
            <Pills items={LIMITS} three />
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="start">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Where to start</h2>
            </div>
            <div className={styles.panel}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <tbody>
                    {STARTS.map(row => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td className={styles.tableBody}>{row.body}</td>
                        <td>
                          <ArrowLink href={row.href}>{row.linkLabel}</ArrowLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <PageCTA
          title="Build with programmable tokens"
          description="Try it on a testnet, or read how it works."
          buttons={[
            { href: PLATFORM_REPO, label: "Reference platform" },
            { href: DOC_URL, label: "Read the docs" },
          ]}
          art={bandArt}
        />
      </main>
    </Layout>
  );
}
