import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { PageMetadata } from "@docusaurus/theme-common";
import clsx from "clsx";
import ogCards from "@site/static/img/og/pages/manifest.json";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import AddressAnatomy from "./_components/AddressAnatomy";
import TransferStepper from "./_components/TransferStepper";
import ActionTabs from "./_components/ActionTabs";
import HeroTransfer from "./_components/HeroTransfer";
import home from "../styles.module.css";
import styles from "./styles.module.css";

const TITLE = "Programmable Tokens on Cardano";
const DESCRIPTION =
  "How programmable tokens work on Cardano: native assets with rules that run on every transfer, mint and burn, as defined in CIP-113.";

const CIP_URL = "https://cips.cardano.org/cip/CIP-0113";
const CIP_SOURCE = "https://github.com/cardano-foundation/CIPs/tree/master/CIP-0113";
const ONCHAIN_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens";
const ONCHAIN_DOCS = `${ONCHAIN_REPO}/blob/main/documentation`;
const PLATFORM_REPO = "https://github.com/cardano-foundation/cip113-programmable-tokens-platform";
const CMTA_REPO = "https://github.com/cardano-foundation/cpt-rwa-ch-cmta-reference";

/* Built only from primitives the ledger already has. Each claim is
   stated in CIP-0113's motivation and specification. */
const CLAIMS = [
  {
    icon: "img/home/rebrand/icon-native-tokens.svg",
    title: "No hard fork",
    body: "Programmable tokens are ordinary native assets. Their rules come from scripts, stake credentials and withdraw-zero, all of which the ledger supports today.",
  },
  {
    icon: "img/home/rebrand/icon-transaction-metadata.svg",
    title: "Derivable addresses",
    body: "Anyone can compute a holder's smart-wallet address from their key, so tokens can be sent to someone who has never used the standard.",
  },
  {
    icon: "img/home/rebrand/icon-governance.svg",
    title: "One registry",
    body: "A sorted on-chain list tells wallets, indexers and contracts which policies are programmable and which scripts govern each one.",
  },
  {
    icon: "img/home/rebrand/icon-smart-contracts.svg",
    title: "Low per-input cost",
    body: "The custody check that runs for each input does almost nothing. The shared checks run once per transaction through withdraw-zero, not once per input.",
  },
];

const LAYERS = [
  {
    name: "Registry",
    scope: "Deployed once, shared",
    body: "A sorted linked list of registered policies. Each entry is a UTxO marked by an NFT, holding the token's configuration in its datum.",
    parts: ["RegistryNode", "registrySpendScript", "registryMintingPolicy"],
  },
  {
    name: "Standard",
    scope: "Deployed once, shared",
    body: "The custody address every token lives at, the dispatcher behind it, one delegate per action, and the parameters that wire them together.",
    parts: [
      "programmableLogicBase",
      "programmableLogicGlobal",
      "action delegates",
      "protocolParameters",
    ],
  },
  {
    name: "Module",
    scope: "Per token",
    body: "The issuer's rules: who can move the token, who can act on it without the holder, and who can mint and burn it.",
    parts: [
      "transferLogicScript",
      "thirdPartyLogicScript",
      "issuanceLogicScript",
      "issuanceMintingPolicy",
      "globalState (optional)",
    ],
  },
];

const MODULES = [
  {
    name: "CMTA reference",
    by: "FluidTokens + Cardano Foundation",
    body: "Tokenized securities under the Swiss CMTA framework: transfer controls, denylisting, global pause, forced transfers and seizure, supply caps and role-based permissions.",
    status: "Audited, production",
    production: true,
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
    body: "The smallest possible module: one credential gates every transfer. A starting point for your own.",
    status: "Example, not audited",
    href: `${PLATFORM_REPO}/tree/main/src/modules/dummy`,
  },
];

const UPGRADES = [
  {
    title: "The protocol",
    body: "The dispatcher and the protocol-level issuance logic are read from the protocol parameters at validation time. The dispatcher names the action delegates, so re-pointing it replaces them too, for every token at once. The right to upgrade is a credential recorded there, and handing it over takes two transactions: a nomination, then the nominee accepting.",
  },
  {
    title: "Each token",
    body: "In the reference implementation, a token's issuer can re-point its transfer, third-party and unfracking logic and its global state in place. The issuer's authority is the token's minting logic credential.",
  },
  {
    title: "What never moves",
    body: "The programmableLogicBase credential, so every holder's address stays where it is, and each token's minting policy, so its policy ID survives every upgrade.",
  },
];

const WALLET_STEPS = [
  "Show balances by querying the holder's smart-wallet address",
  "Identify programmable tokens by looking up their policy in the registry",
  "Build history from balance changes at the smart-wallet address",
  "Optionally, build TransferAct transactions for native sends",
];

const DAPP_STEPS = [
  "Reference the protocol parameters UTxO and point each spend's redeemer at it",
  "Reference a registry node per policy, or its covering node",
  "Withdraw 0 from programmableLogicGlobal and point each spend's redeemer at it",
  "Withdraw 0 from the action's delegate, with its own redeemer",
  "Withdraw 0 from each token's transfer logic",
  "Send tokens only to derived smart-wallet addresses",
];

/* The RegistryNode datum from CIP-0113, tokenized by hand for the editor
   card (the homepage devCodeCard convention). Field order is normative. */
const DATUM_LINES = [
  [{ t: "c", x: "// One registry entry per token" }],
  [
    { t: "k", x: "type" },
    { t: "p", x: " " },
    { t: "f", x: "RegistryNode" },
    { t: "p", x: " {" },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "key" },
    { t: "p", x: ": " },
    { t: "f", x: "ByteArray" },
    { t: "p", x: ",  " },
    { t: "c", x: "// policy ID" },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "next" },
    { t: "p", x: ": " },
    { t: "f", x: "ByteArray" },
    { t: "p", x: ", " },
    { t: "c", x: "// next key" },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "minting_logic_script" },
    { t: "p", x: ": " },
    { t: "f", x: "Credential" },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "transfer_logic_script" },
    { t: "p", x: ": " },
    { t: "f", x: "Credential" },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "third_party_logic_script" },
    { t: "p", x: ": " },
    { t: "f", x: "Credential" },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "unfracking_logic_script" },
    { t: "p", x: ": " },
    { t: "f", x: "Credential" },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "global_state_cs" },
    { t: "p", x: ": " },
    { t: "f", x: "ByteArray" },
  ],
  [{ t: "p", x: "}" }],
];

const TOKEN_CLASS = {
  k: home.codeKeyword,
  v: home.codeVariable,
  f: home.codeFunction,
  c: home.codeComment,
};

function EditorLine({ line }) {
  return (
    <>
      {line.map((tok, i) =>
        tok.t === "p" ? (
          <React.Fragment key={i}>{tok.x}</React.Fragment>
        ) : (
          <span key={i} className={TOKEN_CLASS[tok.t]}>
            {tok.x}
          </span>
        ),
      )}
      {"\n"}
    </>
  );
}

function ExtLink({ href, children, className }) {
  return (
    <a href={href} {...EXTERNAL_LINK_PROPS} className={className}>
      {children}
    </a>
  );
}

function SourceCard({ title, body, href, linkLabel, dark }) {
  return (
    <div className={clsx(styles.sourceCard, dark && styles.sourceCardDark)}>
      <h4>{title}</h4>
      <p>{body}</p>
      <ExtLink href={href} className={styles.sourceLink}>
        {linkLabel}
        <ExternalArrow />
      </ExtLink>
    </div>
  );
}

export default function ProgrammableTokensPage() {
  const baseUrl = useBaseUrl("/");

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <PageMetadata image={ogCards["programmable-tokens"]} />
      <main className={styles.page}>
        <section className={home.hero}>
          <HeroTransfer />
          <div className="container">
            <div className={clsx(home.heroContent, styles.heroContentStacked)}>
              <div className={home.heroLeft}>
                <h1 className={clsx(home.heroTitle, styles.heroTitleFit)}>Programmable Tokens</h1>
              </div>
              <div className={clsx(home.heroRight, styles.heroStackedRight)}>
                <p className={home.heroSubtitle}>
                  Programmable tokens are Cardano native tokens with rules that run on every
                  transfer, mint and burn. Freezes, seizures, allowlists and compliance checks are
                  enforced by the ledger, with no hard fork needed. They are defined in{" "}
                  <ExtLink href={CIP_URL} className={styles.inlineLink}>
                    CIP-113
                  </ExtLink>
                  , and this page walks through how they work.
                </p>
                <div className={home.heroActions}>
                  <a className="button button--primary" href="#how">
                    Follow a transfer
                  </a>
                  <a className="button button--outline button--primary" href="#start">
                    Start building
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={clsx(styles.panel, styles.splitPanel)}>
              <div className={styles.split}>
                <div className={styles.splitText}>
                  <h2 className={styles.editorialTitle}>What are programmable tokens?</h2>
                  <div className={styles.editorialBody}>
                    <p>
                      A plain native token moves under ledger rules alone. Once minted, no script
                      sees it again. Programmable tokens add the missing layer: each one
                      lives at a single shared script address, <code>programmableLogicBase</code>, so
                      every movement is a spend from that script and its checks always run.
                    </p>
                    <p>
                      Ownership comes from the other half of the address. The stake credential
                      names the owner, so each holder gets a smart-wallet address that anyone can
                      derive from their key. Wallets still sign, and nobody has to register first.
                    </p>
                    <p>
                      Programmable tokens are defined in{" "}
                      <ExtLink href={CIP_URL} className={styles.inlineLink}>
                        CIP-113
                      </ExtLink>
                      , which is merged into the CIPs repository. The Cardano Foundation&apos;s{" "}
                      <ExtLink href={ONCHAIN_REPO} className={styles.inlineLink}>
                        reference implementation
                      </ExtLink>{" "}
                      is audited and production-ready.
                    </p>
                  </div>
                </div>
                <AddressAnatomy />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Built from what Cardano has</h2>
              <p>Four properties that let programmable tokens work without changing the ledger.</p>
            </div>
            <div className={styles.claimRow}>
              {CLAIMS.map(claim => (
                <div key={claim.title} className={styles.claimCol}>
                  <img src={baseUrl + claim.icon} alt="" className={styles.claimIcon} />
                  <h4>{claim.title}</h4>
                  <p>{claim.body}</p>
                </div>
              ))}
            </div>
            <p className={styles.tradeoff}>
              The trade-off: every movement now runs scripts, with the fees that come with them.
              Programmable tokens are for assets that need enforced rules. For a token that only
              needs control at mint and burn, a plain{" "}
              <Link to="/docs/developers/curriculum/native-tokens/minting-policies">
                minting policy
              </Link>{" "}
              is still the right tool.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Three layers</h3>
              <p className={styles.panelIntro}>
                Two layers are shared infrastructure, deployed once for every programmable token.
                The third is what an issuer writes. A new token deploys none of the shared scripts:
                the wiring is read from the protocol parameters when a transaction is validated.
              </p>
              <div className={styles.layerGrid}>
                {LAYERS.map((layer, i) => (
                  <div
                    key={layer.name}
                    className={clsx(styles.layer, i === LAYERS.length - 1 && styles.layerOwn)}
                  >
                    <span className={styles.layerIndex}>Layer {i + 1}</span>
                    <h4>{layer.name}</h4>
                    <span className={styles.layerScope}>{layer.scope}</span>
                    <p>{layer.body}</p>
                    <ul className={styles.layerParts}>
                      {layer.parts.map(part => (
                        <li key={part}>
                          <code>{part}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className={styles.panelLinks}>
                <ExtLink href={`${CIP_SOURCE}#specification`}>
                  The layers in the specification
                  <ExternalArrow />
                </ExtLink>
                <ExtLink href={`${ONCHAIN_DOCS}/02-ARCHITECTURE.md`}>
                  Architecture of the reference implementation
                  <ExternalArrow />
                </ExtLink>
              </p>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="how">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Follow a transfer</h2>
              <p>
                Send a transfer and watch each script check it. The token&apos;s rule here is a
                denylist, as an example; each token&apos;s module defines its own.
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
            <div className={home.sectionHeader}>
              <h2>Four actions</h2>
              <p>
                Tokens enter through a mint. After that, every spend from the shared address
                declares one of three actions, each with its own script and its own checks.
              </p>
            </div>
            <div className={styles.panel}>
              <ActionTabs />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Modules</h3>
              <p className={styles.panelIntro}>
                CIP-113 fixes the plumbing. A module fixes the behavior: which transfer,
                third-party and issuance scripts a token uses, and how to build its transactions.
                Every programmable token belongs to one. The CIP calls them substandards.
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
                              row.production ? "badge--primary" : "badge--secondary",
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

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Upgradable without moving funds</h2>
              <p>
                The protocol and each token&apos;s rules can change. Holders&apos; addresses and
                policy IDs cannot.
              </p>
            </div>
            <div className={styles.areaGrid}>
              {UPGRADES.map(item => (
                <div key={item.title} className={styles.areaCard}>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <p className={styles.tradeoff}>
              For integrators, the protocol parameters UTxO and the token&apos;s registry node are
              the authority on current wiring, never a cached script hash. The upgrade authority
              recorded in the protocol parameters is the right subject for any trust assessment.{" "}
              <ExtLink href={`${CIP_SOURCE}#protocol-upgradability`}>Protocol upgradability</ExtLink>
            </p>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="start">
          <div className="container">
            <div className={home.devPanel}>
              <div className={home.devPanelCopy}>
                <div className={home.devPanelHeader}>
                  <h3>A token is one registry node</h3>
                  <p>Write the module, then register its scripts.</p>
                </div>
                <p className={styles.panelBody}>
                  Registration binds the node to the token. The registry rebuilds the issuance
                  policy from the node&apos;s minting logic credential and requires it to hash to{" "}
                  <code>key</code>, and that minting logic must run in the same transaction. So the
                  minting logic field cannot lie, and every other field is whatever that minting
                  logic approves.
                </p>
              </div>
              <div className={clsx(home.devPanelArt, home.devPanelArtLead)}>
                <div className={home.devCodeCard}>
                  <div className={home.codeBlock}>
                    <div className={home.codeHeader}>
                      <span className={home.codeDot} />
                      <span className={home.codeDot} />
                      <span className={home.codeDot} />
                      <span className={home.codeTitle}>RegistryNode</span>
                    </div>
                    <code className={styles.editorCode}>
                      {DATUM_LINES.map((line, i) => (
                        <EditorLine key={i} line={line} />
                      ))}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sourcesBlock}>
              <h2 className={styles.plainHeading}>Pick your starting point</h2>
              <div className={styles.sourceGrid}>
                <SourceCard
                  title="The specification"
                  body="CIP-113: the registry, the custody model, the actions and the upgrade rules, normative for every implementation."
                  href={CIP_URL}
                  linkLabel="Read CIP-113"
                />
                <SourceCard
                  title="On-chain contracts"
                  body="The Cardano Foundation's audited Aiken implementation of the standard: registry, custody, dispatcher, delegates and upgrades."
                  href={ONCHAIN_REPO}
                  linkLabel="Open the repository"
                />
                <SourceCard
                  title="CMTA reference"
                  body="A production module for tokenized securities. Audited, and recognized by CMTA as a smart contract for tokenized shares."
                  href={CMTA_REPO}
                  linkLabel="Open the repository"
                  dark
                />
                <SourceCard
                  title="Reference platform"
                  body="A Next.js frontend and Java backend to deploy, register, mint and transfer on testnets, with example modules to experiment with."
                  href={PLATFORM_REPO}
                  linkLabel="Open the repository"
                />
              </div>
              <p className={styles.deeperRow}>
                Go deeper:{" "}
                <ExtLink href={`${ONCHAIN_DOCS}/02-ARCHITECTURE.md`}>architecture</ExtLink>
                {" · "}
                <ExtLink href={`${ONCHAIN_DOCS}/09-DEVELOPING-MODULES.md`}>
                  writing a module
                </ExtLink>
                {" · "}
                <ExtLink href={`${ONCHAIN_REPO}/tree/main/documentation/audit`}>audit reports</ExtLink>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>For wallets and dApps</h3>
              <p className={styles.panelIntro}>
                From the ledger&apos;s side, programmable tokens are ordinary native assets at a
                script address. What changes is how you find them and how you build transactions
                that move them.
              </p>
              <div className={styles.integrate}>
                <div>
                  <h4>Wallets</h4>
                  <ol className={styles.numbered}>
                    {WALLET_STEPS.map(s => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4>dApps and DEXes, per transaction</h4>
                  <ol className={styles.numbered}>
                    {DAPP_STEPS.map(s => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className={styles.integrateNote}>
                    Steps 1 and 3 are the easy ones to miss. Neither shows up in a token&apos;s own
                    configuration: both belong to the deployment.
                  </p>
                </div>
              </div>
              <p className={styles.panelLinks}>
                <ExtLink href={`${ONCHAIN_DOCS}/08-INTEGRATION-GUIDES.md`}>
                  Integration guides
                  <ExternalArrow />
                </ExtLink>
                <ExtLink href={`${CIP_SOURCE}#implementing-programmable-tokens-in-defi-protocols`}>
                  DeFi integration in the CIP
                  <ExternalArrow />
                </ExtLink>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
