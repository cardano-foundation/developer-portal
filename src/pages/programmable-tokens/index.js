import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { PageMetadata } from "@docusaurus/theme-common";
import clsx from "clsx";
import ogCards from "@site/static/img/og/pages/manifest.json";
import ExternalArrow from "@site/src/components/ExternalArrow";
import PageCTA from "@site/src/components/PageCTA";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import AddressAnatomy from "./_components/AddressAnatomy";
import home from "../styles.module.css";
import styles from "./styles.module.css";

const TITLE = "Programmable Tokens on Cardano";
const DESCRIPTION =
  "Programmable tokens are Cardano native tokens that change owner only when a script approves the transfer, as defined in CIP-113.";

const DOC_URL = "/docs/developers/curriculum/native-tokens/programmable-tokens";
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
    name: "In the CIPs repository",
    body: "CIP-113 is merged, so the specification has one public home.",
    href: CIP_URL,
    linkLabel: "Read CIP-113",
  },
  {
    name: "Audited",
    body: "The Cardano Foundation's reference contracts were professionally audited.",
    href: AUDIT_REPORTS,
    linkLabel: "Audit reports",
  },
  {
    name: "Recognized by CMTA",
    body: "CMTA, the Swiss association that sets standards for tokenized securities, recognizes the reference module for tokenized shares.",
    href: `${CMTA_REPO}#cmta-recognition`,
    linkLabel: "The recognition",
  },
  {
    name: "No hard fork",
    body: "Built on primitives the ledger already has, such as native tokens and stake credentials.",
    href: CIP_SOURCE,
    linkLabel: "The specification",
  },
];

/* One transfer, as what each script enforces. The scripts do not call each
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
    name: "Action",
    body: "The transaction declares a transfer, so the transfer checks have to run in the same transaction.",
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
    body: "The token's own transfer logic approves. In the freeze and seize module, neither side is on the denylist.",
    by: "transfer_logic_script",
    scope: "Module",
    module: true,
  },
];

const COMPARE = [
  {
    topic: "On a transfer",
    native: "Moves freely between addresses. No script runs.",
    programmable: "A script has to approve every change of owner.",
  },
  {
    topic: "Where the rules live",
    native: "In the minting policy, which covers mint and burn only.",
    programmable: "In the token's transfer logic, listed in an on-chain registry.",
  },
  {
    topic: "Freeze and seize",
    native: "Not possible.",
    programmable: "Possible when the token's third-party logic allows it.",
  },
  {
    topic: "The holder's address",
    native: "The wallet address.",
    programmable:
      "A smart wallet address, derived from the holder's stake credential. The holder still signs.",
  },
  {
    topic: "Changing the rules",
    native: "The minting policy is fixed.",
    programmable:
      "In the reference implementation the issuer can replace a token's logic in place. Addresses and policy IDs stay the same.",
  },
  {
    topic: "Cost",
    native: "The standard transaction fee.",
    programmable:
      "Script execution fees on every transfer. The shared checks run once per transaction, which keeps them low.",
  },
  {
    topic: "Use it for",
    native: "Tokens that need control only at mint and burn.",
    programmable:
      "Regulated stablecoins, tokenized securities and other assets with transfer restrictions.",
  },
];

/* What exists today, and how far each one has been reviewed. The controls
   are the ones each module's README lists as implemented. */
const BUILDS = [
  {
    title: "Tokenized securities",
    lead: "KYC, pause and forced transfers, audited.",
    body: (
      <>
        <ExtLink href={CMTA_URL}>CMTA</ExtLink> is the Swiss association that sets standards for
        issuing and trading securities as tokens. Its Expert Committee{" "}
        <ExtLink href={`${CMTA_REPO}#cmta-recognition`}>recognized this module</ExtLink> for
        tokenized shares, so an issuer can use it in place of CMTA&apos;s own reference contract when
        applying for the{" "}
        <ExtLink href={CMTA_CERTIFICATION}>CMTA Tokenized Shares certification mark</ExtLink>. The
        recognition sets four conditions for each deployment, and the module is audited.
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
    body: "An issuer can block a denylisted holder on every transfer, freeze a holder's balance, and seize tokens for legal or regulatory reasons. The Freeze and Seize module is a working example to start from.",
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

const ROLES = [
  {
    name: "Try it on a testnet",
    body: "A frontend and backend to deploy, register, mint and transfer with the example modules.",
    href: PLATFORM_REPO,
    linkLabel: "Reference platform",
  },
  {
    name: "Issuers",
    body: "Start from an audited module, or see what writing your own involves.",
    href: CMTA_REPO,
    linkLabel: "CMTA reference",
  },
  {
    name: "Contract developers",
    body: "The audited Aiken contracts, and how to write a module on top of them.",
    href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`,
    linkLabel: "Writing a module",
  },
  {
    name: "Wallets and dApps",
    body: "How to show balances, find programmable tokens and build the transactions that move them.",
    href: `${ONCHAIN_DOCS}/08-INTEGRATION-GUIDES.md`,
    linkLabel: "Integration guides",
  },
  {
    name: "Risk and audit",
    body: "Who can upgrade the protocol, what an issuer can change, and what never moves.",
    href: `${CIP_SOURCE}#protocol-upgradability`,
    linkLabel: "Upgradability in the CIP",
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
                  Cardano native tokens that change owner only when a script approves the
                  transfer.
                </p>
                <p className={home.heroSubtitle}>
                  For regulated stablecoins and tokenized securities that need transfer
                  restrictions such as freeze and seize, denylists and KYC checks.
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
            <dl className={styles.statusRow}>
              {STATUS.map(item => (
                <div key={item.name}>
                  <dt>{item.name}</dt>
                  <dd>{item.body}</dd>
                  <dd>
                    <ArrowLink href={item.href}>{item.linkLabel}</ArrowLink>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>What you can build</h2>
              <p>Start from a module that exists today, or write your own.</p>
            </div>
            {BUILDS.map((build, index) => (
              <div key={build.title} className={home.devPanel}>
                <div className={home.devPanelCopy}>
                  <div className={home.devPanelHeader}>
                    <h3>{build.title}</h3>
                    <p>{build.lead}</p>
                  </div>
                  <p className={styles.panelBody}>{build.body}</p>
                </div>
                <div className={clsx(home.devPanelArt, index % 2 === 0 && home.devPanelArtLead)}>
                  <ModuleCard card={build.card} />
                </div>
              </div>
            ))}
            <div className={home.devPanel}>
              <div className={home.devPanelCopy}>
                <div className={home.devPanelHeader}>
                  <h3>Holders keep their keys</h3>
                  <p>Custody by script, ownership by stake credential.</p>
                </div>
                <p className={styles.panelBody}>
                  Every token sits at one shared script, so its rules always run. The
                  holder&apos;s stake credential still names the owner. A smart wallet address can
                  be computed from any wallet address, and the holder signs every transfer.
                </p>
              </div>
              <div className={clsx(home.devPanelArt, home.devPanelArtLead)}>
                <AddressAnatomy />
              </div>
            </div>
            <p className={styles.callout}>
              <strong>Before you integrate a token, read its third-party script.</strong> It decides
              what can happen to a holder&apos;s balance without their signature, and who can
              trigger it. CIP-113 conformance alone answers neither question.
            </p>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="how">
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>How a transfer is checked</h3>
              <p className={styles.panelIntro}>
                Four checks run in the same transaction. Three come from the standard and are
                the same for every token. The fourth is the issuer&apos;s.
              </p>
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
              <p className={styles.deeperRow}>
                Source:{" "}
                <ExtLink href={`${CIP_SOURCE}#transfer`}>the Transfer section of CIP-113</ExtLink>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Native token and programmable token</h3>
              <p className={styles.panelIntro}>
                Once minted, a native token moves freely between addresses. A programmable token
                is still a native token to the ledger, and a script has to approve every change
                of owner.
              </p>
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

        <section className={clsx(styles.section, styles.anchorTarget)} id="start">
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Where to start</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <tbody>
                    {ROLES.map(row => (
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
              <p className={styles.deeperRow}>
                Go deeper: <Link to={DOC_URL}>how it works, in the docs</Link>
                {" · "}
                <ExtLink href={`${ONCHAIN_DOCS}/02-ARCHITECTURE.md`}>architecture</ExtLink>
                {" · "}
                <ExtLink href={ONCHAIN_REPO}>on-chain contracts</ExtLink>
              </p>
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
