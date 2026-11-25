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
    body: "The reference implementation has been security-audited, and the reports are public.",
    href: AUDIT_REPORTS,
    linkLabel: "Audit reports",
  },
  {
    name: "Recognized by CMTA",
    body: "CMTA, the Swiss standards association for tokenized securities, recognizes the CMTA reference module for tokenized shares.",
    href: `${CMTA_REPO}#cmta-recognition`,
    linkLabel: "The recognition",
  },
];

/* The registry entry type, with the fields as in CIP-0113 ("RegistryNode
   datum") and in lib/registry_node.ak of the reference contracts. The
   comments are shortened. */
const REGISTRY_LINES = [
  "pub type RegistryNode {",
  "  // The token's policy ID",
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
        tokenized shares. An issuer can use it when applying for the{" "}
        <ExtLink href={CMTA_CERTIFICATION}>CMTA Tokenized Shares certification mark</ExtLink>, and
        the recognition sets four conditions for each deployment.
      </>
    ),
    card: {
      name: "CMTA reference",
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
    body: "The issuer keeps a denylist on chain. A holder on the list cannot transfer, and the issuer can seize that holder's tokens. The module is a working example to start from.",
    card: {
      name: "Freeze and Seize",
      art: "img/home/rebrand/ecosystem-get-funded.webp",
      controls: ["Denylist checked on every transfer", "Freeze and unfreeze", "Seize"],
    },
    action: {
      href: `${PLATFORM_REPO}/tree/main/src/modules/freeze-and-seize`,
      label: "Open the Freeze and Seize module",
    },
  },
  {
    title: "Your own rules",
    lead: "Write a module for any other asset.",
    body: "A module is up to four smart contracts, one each for minting, transfers, third-party actions and holders restructuring their own UTxOs. The token's registry entry names them, and the core smart contracts require the matching one to run with each action.",
    code: {
      file: "registry_node.ak",
      lines: REGISTRY_LINES,
    },
    action: { href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`, label: "Read the module guide" },
  },
];

/* One transfer, as the three things it has to pass. The smart contracts do
   not call each other: each requires the next to run in the same
   transaction, and the ledger runs all of them. Source: CIP-0113, "Transfer"
   and "Architecture: Delegation Pattern". */
const TRANSFER_STEPS = [
  {
    title: "The core smart contracts run",
    body: "A holder's tokens sit at a smart wallet address, made of one smart contract shared by every holder and the holder's own key. Spending from that address requires the core smart contracts to run, so no transfer can bypass them.",
  },
  {
    title: "The holder signed",
    body: "The transaction carries the holder's signature, and every token output goes to a smart wallet address.",
  },
  {
    title: "The issuer's rules pass",
    body: "The core smart contracts look up the token in the registry and require its transfer logic to run. A denylist check is one example.",
  },
];

/* The parts of a transfer transaction, shortened from the "Transfer"
   skeleton in 08-INTEGRATION-GUIDES.md of the reference contracts. It is an
   outline, not code. */
const TRANSFER_LINES = [
  "// The sender's tokens",
  "inputs:",
  "  addr(programmable_logic_base, sender)",
  "// The recipient's smart wallet address",
  "outputs:",
  "  addr(programmable_logic_base, recipient)",
  "// Zero-ADA withdrawals run the checks",
  "withdrawals:",
  "  programmable_logic_global",
  "  transfer",
  "  transfer_logic_script",
  "// Read, not spent",
  "reference_inputs:",
  "  protocol parameters",
  "  the token's registry node",
  "// The holder's key",
  "signatories:",
  "  sender",
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
    detail: "No custodian holds the tokens. A transfer needs the holder's own signature.",
    cols: [true, true],
  },
  {
    feature: "Control at mint and burn",
    detail: "The issuer decides who can mint and burn.",
    cols: [true, true],
  },
  {
    feature: "Transfer restrictions",
    detail: "Every transfer has to pass the issuer's rules, such as a denylist or a KYC check.",
    cols: [false, true],
  },
  {
    feature: "Freeze and seize",
    detail: "If the token's module allows it, the issuer can block a holder's transfers or move their tokens without their signature.",
    cols: [false, true],
  },
  {
    feature: "Upgradeable rules",
    detail: "In the reference implementation, the issuer can replace a token's rules after issuance. Addresses and policy IDs stay the same.",
    cols: [false, true],
  },
];

const STARTS = [
  {
    name: "Try it on a testnet",
    body: "The reference platform is a web app and backend for registering, minting and transferring tokens with the example modules.",
    href: PLATFORM_REPO,
    linkLabel: "Reference platform",
    icon: "img/home/rebrand/icon-stake-pool.svg",
  },
  {
    name: "Write a module",
    body: "The module guide explains the interface and walks through two example modules. A module you write needs its own audit.",
    href: `${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`,
    linkLabel: "Module guide",
    icon: "img/home/rebrand/icon-smart-contracts.svg",
  },
  {
    name: "Integrate a wallet or dApp",
    body: "The integration guides cover balances, token discovery and transaction building. Check each token's third-party logic before you support it.",
    href: `${ONCHAIN_DOCS}/08-INTEGRATION-GUIDES.md`,
    linkLabel: "Integration guides",
    icon: "img/home/rebrand/icon-native-tokens.svg",
  },
  {
    name: "Review the regulatory context",
    body: "The cardano.org overview covers the regulatory frameworks and the institutional case.",
    href: OVERVIEW_URL,
    linkLabel: "On cardano.org",
    icon: "img/home/rebrand/icon-governance.svg",
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

/* Colours one line of a code card with the homepage's code colours: a comment
   line, the keywords `pub` and `type`, type names, a name before a colon and
   a name before a bracket. Enough for the two cards on this page. */
const CODE_TOKEN = /\b(pub|type)\b|\b([A-Z][A-Za-z]+)\b|([a-z_]+)(?=:)|([a-z_]+)(?=\()/g;

function codeTokens(line) {
  if (line.trim().startsWith("//")) return [{ text: line, className: home.codeComment }];
  const tokens = [];
  let last = 0;
  for (const match of line.matchAll(CODE_TOKEN)) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index) });
    tokens.push({
      text: match[0],
      className: match[1] ? home.codeKeyword : match[3] ? home.codeVariable : home.codeFunction,
    });
    last = match.index + match[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
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
            <React.Fragment key={index}>
              {codeTokens(line).map((token, i) => (
                <span key={i} className={token.className}>
                  {token.text}
                </span>
              ))}
              {"\n"}
            </React.Fragment>
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
        <strong className={styles.moduleCardName}>{card.name}</strong>
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
  const baseUrl = useBaseUrl("/");

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
                  Every transfer is checked against the issuer&apos;s rules, such as a denylist or
                  KYC status. Modules can add freeze and seize.
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
                Every programmable token uses the same core smart contracts. Its rules come from a
                module, a separate set of smart contracts written for one use case, which can be
                audited on its own.
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
              <p>
                A programmable token is still a native asset that the holder controls. What it adds
                is issuer control after minting.
              </p>
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
              <h2>How a transfer works</h2>
              <p>
                The holder signs one transaction. It is valid only if three conditions are met.
              </p>
            </div>
            <div className={home.devPanel}>
              <div className={home.devPanelCopy}>
                <ol className={styles.steps}>
                  {TRANSFER_STEPS.map((step, index) => (
                    <li key={step.title}>
                      <span className={clsx(styles.tick, styles.tickBrand)} aria-hidden="true">
                        {index + 1}
                      </span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div>
                  <Link
                    className="button button--primary"
                    to={`${DOC_URL}#how-custody-and-ownership-work`}
                  >
                    Read the full design
                  </Link>
                </div>
              </div>
              <div className={home.devPanelArt}>
                <CodeCard code={{ file: "transfer transaction", lines: TRANSFER_LINES }} />
              </div>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="start">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Where to start</h2>
            </div>
            <div className={styles.startGrid}>
              {STARTS.map(row => (
                <a
                  key={row.name}
                  className={styles.startCard}
                  href={row.href}
                  {...EXTERNAL_LINK_PROPS}
                >
                  <img src={baseUrl + row.icon} alt="" />
                  <h3>{row.name}</h3>
                  <p>{row.body}</p>
                  <span className={styles.startLink}>
                    {row.linkLabel}
                    <ExternalArrow />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <PageCTA
          title="Build with programmable tokens"
          description="Read the docs, then the standard itself."
          buttons={[
            { href: DOC_URL, label: "Read the docs" },
            { href: CIP_URL, label: "Read CIP-113" },
          ]}
          art={bandArt}
        />
      </main>
    </Layout>
  );
}
