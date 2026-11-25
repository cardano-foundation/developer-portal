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
  "The programmable tokens standard is a modular framework for enforcing transfer rules on tokenized assets, for regulated stablecoins and tokenized securities on Cardano. Defined in CIP-113.";

const DOC_URL = "/docs/developers/curriculum/native-tokens/programmable-tokens";
const OVERVIEW_URL = "https://cardano.org/programmable-tokens/";
const CIP_URL = "https://cips.cardano.org/cip/CIP-0113";
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

/* The registry entry type, with the fields as in CIP-0113 ("RegistryNode
   datum") and in lib/registry_node.ak of the reference contracts. The
   comments are shortened. */
const REGISTRY_LINES = [
  "pub type RegistryNode {",
  "  // The token's policy id",
  "  key: ByteArray,",
  "  // The next entry in the registry",
  "  next: ByteArray,",
  "  // Who can mint and burn",
  "  minting_logic_script: Credential,",
  "  // Which transfers pass",
  "  transfer_logic_script: Credential,",
  "  // Third-party actions, such as seizure",
  "  third_party_logic_script: Credential,",
  "  // Holders restructuring their own UTxOs",
  "  unfracking_logic_script: Credential,",
  "  // Optional state, such as a denylist",
  "  global_state_cs: ByteArray,",
  "}",
];

/* What exists today. The controls are the ones each module's README lists
   as implemented. */
const MODULES = [
  {
    title: "Tokenized securities",
    lead: "Company shares issued as a native token.",
    body: (
      <>
        <ExtLink href={CMTA_URL}>CMTA</ExtLink> is the Swiss association that sets standards for
        issuing and trading securities as tokens. It{" "}
        <ExtLink href={`${CMTA_REPO}#cmta-recognition`}>recognized this audited module</ExtLink> for
        tokenized shares, so an issuer can use it when applying for the{" "}
        <ExtLink href={CMTA_CERTIFICATION}>CMTA Tokenized Shares certification mark</ExtLink>,
        under four conditions for each deployment.
      </>
    ),
    card: {
      name: "CMTA reference",
      by: "Finest + Cardano Foundation",
      art: "img/hero/spheres.webp",
      controls: [
        "KYC-gated transfers",
        "Sanctions denylist",
        "Global pause",
        "Forced transfers",
        "Supply caps",
        "Role-based permissions",
      ],
    },
    action: { href: CMTA_REPO, label: "Open the CMTA reference" },
  },
  {
    title: "Regulated stablecoins",
    lead: "Freeze and seize on a native token.",
    body: "An issuer can stop a denylisted holder from transferring, freeze a balance, and seize tokens for legal or regulatory reasons. This module is a working example to start from.",
    card: {
      name: "Freeze and Seize",
      by: "Cardano Foundation",
      art: "img/home/rebrand/ecosystem-get-funded.webp",
      controls: ["Denylist checked on every transfer", "Freeze and unfreeze", "Seize"],
    },
    action: {
      href: `${PLATFORM_REPO}/tree/main/src/modules/freeze-and-seize`,
      label: "Open the Freeze and Seize module",
    },
  },  {
    title: "Your own rules",
    lead: "Rules for any other asset, in a module you write.",
    body: "Securities and stablecoins are two use cases. Every programmable token has this entry in the registry, and four of its fields name the smart contracts with the token's rules. A module is those smart contracts. The core requires the matching one to run on every action.",
    code: {
      file: "registry_node.ak",
      lines: REGISTRY_LINES,
    },
    action: { href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`, label: "Write a module" },
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

/* cols: [native token, programmable token]. The first three rows are what
   stays the same, the last three what the standard adds. */
const COMPARE = [
  {
    feature: "Native asset",
    detail: "The ledger tracks it under its own policy ID, like any Cardano token.",
    cols: [true, true],
  },
  {
    feature: "Self-custody",
    detail: "No custodian holds the tokens. The holder's own key authorizes a transfer.",
    cols: [true, true],
  },
  {
    feature: "Control at mint and burn",
    detail: "The issuer's minting logic decides who can mint and burn.",
    cols: [true, true],
  },
  {
    feature: "Control on every transfer",
    detail: "Each transfer has to pass the issuer's rules, such as denylists and KYC checks.",
    cols: [false, true],
  },
  {
    feature: "Freeze and seize",
    detail: "The issuer can act on a balance without the holder, when the token's module allows it.",
    cols: [false, true],
  },
  {
    feature: "Rules that can change",
    detail: "In the reference implementation the issuer can replace a token's logic after issuance. Addresses and policy IDs stay the same.",
    cols: [false, true],
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
    body: "The audited Aiken contracts, and how to build your own rule set on top of them. A module you write needs its own audit.",
    href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`,
    linkLabel: "Writing a module",
  },
  {
    name: "Integrate as a wallet or dApp",
    body: "Show balances, find programmable tokens and build the transactions that move them. Read each token's third-party logic first.",
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

function Pills({ items }) {
  return (
    <dl className={styles.statusRow}>
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

function CodeCard({ code }) {
  return (
    <div className={home.devCodeCard}>
      <div className={home.codeBlock}>
        <div className={home.codeHeader}>
          <span className={home.codeDot} />
          <span className={home.codeDot} />
          <span className={home.codeDot} />
          <span className={home.codeTitle}>{code.file}</span>
        </div>
        <code className={styles.editorCode}>
          {code.lines.map((line, index) => (
            <span
              key={index}
              className={clsx(line.trim().startsWith("//") && home.codeComment)}
            >
              {line}
              {"\n"}
            </span>
          ))}
        </code>
      </div>
    </div>
  );
}

function ModuleCard({ card }) {
  const art = useBaseUrl(card.art);

  return (
    <div className={styles.moduleCard}>
      <div
        className={styles.moduleCardArt}
        style={{ backgroundImage: `url(${art})` }}
        aria-hidden="true"
      />
      <div className={styles.moduleCardBody}>
        <div className={styles.moduleCardHead}>
          <strong>{card.name}</strong>
          <span>{card.by}</span>
        </div>
        <ul>
          {card.controls.map(control => (
            <li key={control}>
              <span className={clsx(styles.tick, styles.tickBrand)} aria-hidden="true">
                ✓
              </span>
              {control}
            </li>
          ))}
        </ul>
      </div>
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
                  Issue stablecoins and securities on Cardano with transfer rules built into the
                  token.
                </p>
                <p className={home.heroSubtitle}>
                  Smart contracts enforce the controls an issuer needs, such as denylists, KYC
                  checks, and freeze and seize.
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
            <Pills items={STATUS} />
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Built from modules</h2>
              <p>
                The core smart contracts are the same for every token. Each token registers a
                module: a separate set of smart contracts that holds the rules for its use case and
                can be audited on its own.
              </p>
            </div>
            {MODULES.map((module, index) => (
              <div key={module.title} className={home.devPanel}>
                <div className={home.devPanelCopy}>
                  <div className={home.devPanelHeader}>
                    <h3>{module.title}</h3>
                    <p>{module.lead}</p>
                  </div>
                  <p className={styles.panelBody}>{module.body}</p>
                  <div>
                    <a
                      className="button button--primary"
                      href={module.action.href}
                      {...EXTERNAL_LINK_PROPS}
                    >
                      {module.action.label}
                      <ExternalArrow />
                    </a>
                  </div>
                </div>
                <div className={clsx(home.devPanelArt, index % 2 === 0 && home.devPanelArtLead)}>
                  {module.card ? <ModuleCard card={module.card} /> : <CodeCard code={module.code} />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>What changes from a native token</h2>
              <p>What stays the same, and what a programmable token adds.</p>
            </div>
            <div className={styles.panel}>
              <div className={styles.tableWrap}>
                <table className={styles.tickTable}>
                  <thead>
                    <tr>
                      <th aria-label="Feature" />
                      <th>Native token</th>
                      <th>Programmable token</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map(row => (
                      <tr key={row.feature}>
                        <td>
                          {row.feature}
                          <span className={styles.tickDetail}>{row.detail}</span>
                        </td>
                        {row.cols.map((on, index) => (
                          <td key={index}>
                            {on ? (
                              <span
                                className={clsx(
                                  styles.tick,
                                  index === 1 ? styles.tickBrand : styles.tickNeutral,
                                )}
                                role="img"
                                aria-label="Yes"
                              >
                                ✓
                              </span>
                            ) : (
                              <span className={styles.tickOff} role="img" aria-label="No">
                                ·
                              </span>
                            )}
                          </td>
                        ))}
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
              <p className={styles.note}>
                <span className={styles.noteLabel}>All or nothing</span>
                <span>
                  If one check fails, the whole transaction is invalid and no token changes owner.
                </span>
              </p>
            </div>
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
