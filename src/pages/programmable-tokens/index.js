import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { PageMetadata } from "@docusaurus/theme-common";
import clsx from "clsx";
import ogCards from "@site/static/img/og/pages/manifest.json";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import AddressAnatomy from "./_components/AddressAnatomy";
import TransferStepper from "./_components/TransferStepper";
import home from "../styles.module.css";
import styles from "./styles.module.css";

const TITLE = "Programmable Tokens on Cardano";
const DESCRIPTION =
  "Programmable tokens are Cardano native tokens whose rules are checked on every transfer, mint and burn, as defined in CIP-113.";

const DOC_URL = "/docs/developers/curriculum/native-tokens/programmable-tokens";
const CIP_URL = "https://cips.cardano.org/cip/CIP-0113";
const CIP_SOURCE = "https://github.com/cardano-foundation/CIPs/tree/master/CIP-0113";
const ONCHAIN_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens";
const ONCHAIN_DOCS = `${ONCHAIN_REPO}/blob/main/documentation`;
const AUDIT_REPORTS = `${ONCHAIN_REPO}/tree/main/documentation/audit`;
const PLATFORM_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens-platform";
const CMTA_REPO = "https://github.com/cardano-foundation/cpt-rwa-ch-cmta-reference";

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
    body: "The CMTA reference module is a recognized smart contract for tokenized shares.",
    href: `${CMTA_REPO}#cmta-recognition`,
    linkLabel: "The recognition",
  },
  {
    name: "No hard fork",
    body: "It runs on scripts and stake credentials the ledger supports today.",
    href: CIP_SOURCE,
    linkLabel: "The specification",
  },
];

const COMPARE = [
  {
    topic: "On a transfer",
    native: "Ledger rules only. No script runs.",
    programmable: "Ledger rules and the token's scripts, every time.",
  },
  {
    topic: "Where the rules live",
    native: "In the minting policy, at mint and burn.",
    programmable: "In a module registered on-chain for the token.",
  },
  {
    topic: "Acting without the holder",
    native: "Not possible.",
    programmable: "Whatever the module's third-party script allows, such as a freeze or a seizure.",
  },
  {
    topic: "The holder's address",
    native: "The wallet address.",
    programmable:
      "An address at the shared script that anyone can derive from the wallet address. The holder still signs.",
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
    programmable: "Script execution on every movement, and the fees that come with it.",
  },
  {
    topic: "Use it for",
    native: "Tokens that need control only at mint and burn.",
    programmable: "Stablecoins, tokenized securities and other assets that need enforced rules.",
  },
];

/* What exists today, and how far each one has been reviewed. */
const MODULES = [
  {
    name: "CMTA reference",
    by: "Finest + Cardano Foundation",
    body: "Tokenized securities under the Swiss CMTA framework: transfer controls, denylisting, global pause, forced transfers and seizure, supply caps and role-based permissions.",
    status: "Audited, CMTA-recognized",
    recognized: true,
    href: CMTA_REPO,
  },
  {
    name: "Freeze and Seize",
    by: "Cardano Foundation",
    body: "A simplified stablecoin: denylist-aware transfers, freeze, unfreeze and seize.",
    status: "Example, not audited",
    href: `${PLATFORM_REPO}/tree/main/src/modules/freeze-and-seize`,
  },
  {
    name: "Dummy",
    by: "Cardano Foundation",
    body: "The smallest possible module: it accepts any transfer that supplies a fixed redeemer value. A starting point for your own.",
    status: "Example, not audited",
    href: `${PLATFORM_REPO}/tree/main/src/modules/dummy`,
  },
];

const ROLES = [
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
  {
    name: "Try it on a testnet",
    body: "A frontend and backend to deploy, register, mint and transfer with the example modules.",
    href: PLATFORM_REPO,
    linkLabel: "Reference platform",
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

export default function ProgrammableTokensPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <PageMetadata image={ogCards["programmable-tokens"]} />
      <main className={styles.page}>
        <section className={home.hero}>
          <div className="container">
            <div className={clsx(home.heroContent, styles.heroContentStacked)}>
              <div className={home.heroLeft}>
                <h1 className={clsx(home.heroTitle, styles.heroTitleFit)}>Programmable Tokens</h1>
              </div>
              <div className={clsx(home.heroRight, styles.heroStackedRight)}>
                <p className={styles.heroLead}>
                  Cardano tokens that move only when their rules allow it.
                </p>
                <p className={home.heroSubtitle}>
                  A regular Cardano token can be sent to anyone at any time. A programmable token
                  checks its issuer&apos;s rules on every transfer, so a stablecoin or a tokenized
                  share can freeze an account, take tokens back or accept only verified holders.
                  It is a Cardano standard,{" "}
                  <ExtLink href={CIP_URL} className={styles.inlineLink}>
                    CIP-113
                  </ExtLink>
                  , and it runs on the network as it is today.
                </p>
                <div className={home.heroActions}>
                  <a className="button button--primary" href="#how">
                    See a transfer checked
                  </a>
                  <Link className="button button--outline button--primary" to={DOC_URL}>
                    Read the docs
                  </Link>
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

        <section className={clsx(styles.section, styles.anchorTarget)} id="how">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Watch a transfer get checked</h2>
              <p>
                Alice sends 40 tokens to Bob, and four checks run. Put Alice on the denylist and
                the transfer fails. The denylist is this token&apos;s rule. Other tokens set
                their own.
              </p>
            </div>
            <div className={styles.panel}>
              <TransferStepper />
            </div>
            <p className={styles.deeperRow}>
              Source:{" "}
              <ExtLink href={`${CIP_SOURCE}#transfer`}>the Transfer section of CIP-113</ExtLink>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Native token and programmable token</h3>
              <p className={styles.panelIntro}>
                A native token is a regular Cardano token. A programmable token is one too, with
                one difference: it can only move through its rules.
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
              <div className={styles.addressBlock}>
                <p>
                  The token address keeps the holder&apos;s stake credential and swaps the payment
                  part for the shared script. That is why anyone can compute it, and why tokens can
                  be sent to someone who has never used the standard.
                </p>
                <AddressAnatomy />
              </div>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="modules">
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Modules</h3>
              <p className={styles.panelIntro}>
                A module is a token&apos;s rule set: who can move it, who can act on it without
                the holder, and who can mint and burn it. Start from one of these or write your
                own. The CIP calls them substandards.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>What it does</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(row => (
                      <tr key={row.name}>
                        <td>
                          <ExtLink href={row.href} className={styles.compareLink}>
                            {row.name}
                          </ExtLink>
                          <span className={styles.compareDetail}>{row.by}</span>
                        </td>
                        <td className={styles.tableBody}>{row.body}</td>
                        <td>
                          <span
                            className={clsx(
                              "badge",
                              row.recognized ? "badge--primary" : "badge--secondary",
                            )}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.callout}>
                <strong>Before you integrate a token, read its third-party script.</strong> It
                decides what can happen to a holder&apos;s balance without their signature, and who
                can trigger it. The standard allows anything from an issuer-only seizure to a
                rebase anyone can run, so CIP-113 conformance alone answers neither question.
              </p>
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
      </main>
    </Layout>
  );
}
