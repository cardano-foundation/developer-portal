import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { PageMetadata } from "@docusaurus/theme-common";
import clsx from "clsx";
import PageCTA from "@site/src/components/PageCTA";
import ExternalArrow from "@site/src/components/ExternalArrow";
import useCopyToClipboard from "@site/src/utils/useCopyToClipboard";
import { EXTERNAL_LINK_PROPS } from "@site/src/utils/externalLink";
import home from "../styles.module.css";
import styles from "./styles.module.css";

const TITLE = "Agentic Commerce on Cardano";
const DESCRIPTION =
  "Agentic commerce on Cardano with the x402 standard. Sell and pay for services over plain HTTP.";

/* Mirrors the official docs' install line; @x402/core rides along as a
   dependency of @x402/cardano. Express wiring lives in the template. */
const INSTALL_COMMAND = "npm install @x402/cardano";

/* The seller, tokenized by hand for the editor card (the homepage
   devCodeCard convention). Shape mirrors the official docs' Cardano
   setup at docs.x402.org/schemes/exact#cardano-setup, on preprod.
   Every line stays under 45 characters so nothing ever clips. */
const SELLER_LINES = [
  [
    { t: "v", x: "resourceServer" },
    { t: "p", x: "." },
    { t: "f", x: "register" },
    { t: "p", x: "(" },
    { t: "s", x: '"cardano:*"' },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "  " },
    { t: "k", x: "new" },
    { t: "p", x: " " },
    { t: "f", x: "ExactCardanoScheme" },
    { t: "p", x: "());" },
  ],
  [],
  [{ t: "c", x: "// One paid route" }],
  [
    { t: "s", x: '"GET /api/message"' },
    { t: "p", x: ": {" },
  ],
  [
    { t: "p", x: "  " },
    { t: "v", x: "accepts" },
    { t: "p", x: ": [{" },
  ],
  [
    { t: "p", x: "    " },
    { t: "v", x: "scheme" },
    { t: "p", x: ": " },
    { t: "s", x: '"exact"' },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "    " },
    { t: "v", x: "network" },
    { t: "p", x: ": " },
    { t: "s", x: '"cardano:preprod"' },
    { t: "p", x: "," },
  ],
  [
    { t: "p", x: "    " },
    { t: "v", x: "price" },
    { t: "p", x: ": { " },
    { t: "v", x: "amount" },
    { t: "p", x: ": " },
    { t: "s", x: '"100000"' },
    { t: "p", x: ", " },
    { t: "c", x: "// 0.10 USDM" },
  ],
  [
    { t: "p", x: "             " },
    { t: "v", x: "asset" },
    { t: "p", x: ": " },
    { t: "v", x: "USDM_PREPROD_ASSET" },
    { t: "p", x: " }," },
  ],
  [
    { t: "p", x: "    " },
    { t: "v", x: "payTo" },
    { t: "p", x: ": " },
    { t: "v", x: "SELLER_ADDRESS" },
    { t: "p", x: "," },
  ],
  [{ t: "p", x: "  }]," }],
  [{ t: "p", x: "}," }],
  [],
  [{ t: "c", x: "// The template wires the rest." }],
];

/* Areas around the payment layer, drawn from what other ecosystems'
   agentic-commerce hackathons and the wider industry treat as open.
   x402 and Masumi cover payment, identity, discovery and escrow, so none
   of these asks builders to rebuild them. */
const AREAS = [
  {
    title: "Spending control",
    body: "Agents spend on someone's behalf. Budgets, limits and approvals enforced on chain keep a person in control.",
  },
  {
    title: "Usage-based pricing",
    body: "Credits, subscriptions and metered sessions let agents pay for what they use, beyond a single request.",
  },
  {
    title: "Trust and reputation",
    body: "Agents need to judge a service before they pay it. Reputation and proof of good work can build on Masumi's identity and on-chain history.",
  },
  {
    title: "Privacy",
    body: "Agents act for people and businesses with details to protect. Build commerce that keeps those details private.",
  },
  {
    title: "Business operations",
    body: "Agents that pay invoices, manage treasury and settle with suppliers.",
  },
  {
    title: "New sellers",
    body: "Publishers, compute providers, devices and services on other networks can sell to agents per use.",
  },
];

/* Grounded in docs/05 pitch angles and masumi.network's why-Cardano
   page; every sentence is defensible as written. */
const CLAIMS = [
  {
    icon: "img/home/rebrand/icon-smart-contracts.svg",
    title: "Payments with rules",
    body: "A payment can go to a smart contract instead of an address, locking the funds under rules the seller declares, such as a delivery deadline, a refund window or a release condition. Masumi's escrow is one such contract, and the ledger enforces the rules before the funds can leave it.",
  },
  {
    icon: "img/home/rebrand/icon-native-tokens.svg",
    title: "Native stablecoins",
    body: "Stablecoins on Cardano are native assets and move under the same ledger rules as ADA. An agent paying in USDM makes a normal transfer, with no token smart contract in the path and no allowance to manage.",
  },
  {
    icon: "img/home/rebrand/icon-transaction-metadata.svg",
    title: "Deterministic transactions",
    body: "An agent sees exactly what a payment will do before it signs: the amount, the recipient and the exact fee are all in the transaction. Once signed, nothing can change it, and it lands exactly as written or not at all.",
  },
  {
    icon: "img/home/rebrand/icon-integrate-payments.svg",
    title: "Non-custodial facilitators",
    body: "Because the wallet signs the whole transaction, there is nothing left for the facilitator to change and no signature of its own to add. It holds no keys and no funds, and it can only verify and relay. Anyone can run one: the template's facilitator is about 100 lines.",
  },
];

const COMPARE_ROWS = [
  {
    feature: "Address payments",
    detail: "A direct payment to a wallet address.",
    href: "https://docs.x402.org/schemes/exact",
    cols: [true, true],
  },
  {
    feature: "Refunds",
    detail: "The payment waits in an on-chain escrow. If nothing is delivered, the buyer requests a refund before the deadline.",
    href: "https://www.masumi.network/dev/masumi/core-concepts/refunds-and-disputes",
    cols: [false, true],
  },
  {
    feature: "Decision logging",
    detail: "A hash of each job's input and output is stored on chain, so either side can prove what was delivered.",
    href: "https://www.masumi.network/dev/masumi/core-concepts/decision-logging",
    cols: [false, true],
  },
  {
    feature: "Discovery",
    detail: "An on-chain registry of agents, searchable through an API.",
    href: "https://www.masumi.network/dev/masumi/core-concepts/registry",
    cols: [false, true],
  },
  {
    feature: "Identity",
    detail: "Every registered agent gets an on-chain ID.",
    href: "https://www.masumi.network/dev/masumi/core-concepts/identity",
    cols: [false, true],
  },
];

const TOKEN_CLASS = {
  k: home.codeKeyword,
  v: home.codeVariable,
  f: home.codeFunction,
  c: home.codeComment,
};

function EditorLine({ line }) {
  if (!line.length) return <>{"\n"}</>;
  return (
    <>
      {line.map((tok, i) =>
        tok.t === "p" ? (
          <React.Fragment key={i}>{tok.x}</React.Fragment>
        ) : tok.t === "s" ? (
          <span key={i} className={styles.codeString}>
            {tok.x}
          </span>
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

function CopyButton({ command }) {
  const [copied, copy] = useCopyToClipboard(2000);
  return (
    <button
      type="button"
      className={home.copyBtn}
      onClick={() => copy(command)}
      aria-label="Copy command"
    >
      {copied ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={home.copyIcon}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={home.copyIcon}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

/* The homepage QuickstartCard, reused verbatim so the two pages share one
   component language. */
function QuickstartCard({ badge, text, command, prompt, docHref, docLabel, docExternal }) {
  const docIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={home.quickstartDocIcon}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );

  return (
    <div className={home.devQuickstartCard}>
      <div className={home.quickstartLeft}>
        <span className="badge badge--secondary">{badge}</span>
        <span className={home.quickstartText}>{text}</span>
      </div>
      <div className={home.quickstartRight}>
        <div className={home.cliMockup}>
          {prompt && <span className={home.cliPrompt}>$</span>}
          <code>{command}</code>
          <CopyButton command={command} />
        </div>
        {docExternal ? (
          <a
            href={docHref}
            {...EXTERNAL_LINK_PROPS}
            className={home.quickstartDocBtn}
            aria-label={docLabel}
          >
            <ExternalArrow />
          </a>
        ) : (
          <Link to={docHref} className={home.quickstartDocBtn} aria-label={docLabel}>
            {docIcon}
          </Link>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ title, body, href, linkLabel, external, dark }) {
  const linkClass = clsx(styles.templateDoc, !external && styles.templateDocRight);
  return (
    <div className={clsx(styles.templateCard, dark && styles.templateCardDark)}>
      <h4>{title}</h4>
      <p>{body}</p>
      {external ? (
        <a href={href} {...EXTERNAL_LINK_PROPS} className={linkClass}>
          {linkLabel}
          <ExternalArrow />
        </a>
      ) : (
        <Link to={href} className={linkClass}>
          {linkLabel}
          <ExternalArrow />
        </Link>
      )}
    </div>
  );
}

export default function X402Page() {
  const baseUrl = useBaseUrl("/");
  const bandArt = useBaseUrl("img/talent/start-building-cubes.webp");

  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <PageMetadata image="img/x402-og.jpeg" />
      <main className={styles.page}>
        <section className={home.hero}>
          <div className={styles.heroRings} aria-hidden="true" />
          <div className="container">
            <div className={clsx(home.heroContent, styles.heroContentStacked)}>
              <div className={home.heroLeft}>
                <h1 className={home.heroTitle}>Agentic Commerce</h1>
              </div>
              <div className={clsx(home.heroRight, styles.heroStackedRight)}>
                <p className={home.heroSubtitle}>
                  x402 lets any service charge per request over plain HTTP, and lets agents pay
                  without accounts or API keys. Build internet-native payments on Cardano, with
                  everything you need on this page.
                </p>
                <div className={home.heroActions}>
                  <a className="button button--primary" href="#start">
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
                  <h2 className={styles.editorialTitle}>What is x402?</h2>
                  <div className={styles.editorialBody}>
                    <p>
                      x402 gives any website or API a built-in way to charge for a request.
                      The web reserved a status code for this in the 1990s, 402 Payment
                      Required, and x402 is the open standard that puts it to use. A server
                      answers a request with a price. The client pays on chain and retries
                      with proof of payment, and the server checks the proof and serves the
                      resource.
                    </p>
                    <p>
                      The standard is governed by the{" "}
                      <a href="https://www.x402.org" {...EXTERNAL_LINK_PROPS}>
                        x402 Foundation
                      </a>{" "}
                      under the Linux Foundation. Cardano has its own scheme in the x402
                      specification, published on npm as <code>@x402/cardano</code>.
                    </p>
                  </div>
                </div>
                <div className={styles.imageBox}>
                  <img
                    src={baseUrl + "img/x402/cf-x402-npm-card.jpg"}
                    alt="Cardano and x402: npm install @x402/cardano"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Why Cardano</h2>
              <p>
                Four properties of Cardano&apos;s ledger that matter for agentic payments.
              </p>
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
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>x402 goes further on Cardano</h3>
              <p className={styles.panelIntro}>
                Cardano&apos;s x402 scheme defines three transfer methods: a payment to an
                address, a lock in{" "}
                <a
                  href="https://www.masumi.network"
                  {...EXTERNAL_LINK_PROPS}
                  className={styles.inlineLink}
                >
                  Masumi
                </a>{" "}
                escrow, or a lock in any smart contract the seller declares.
              </p>
              <div className={styles.masumiBanner}>
                <span className={styles.masumiBannerMark}>
                  <img
                    src={baseUrl + "img/x402/x402-wordmark.svg"}
                    alt="x402"
                    className={styles.bannerLogo}
                  />
                  <span className={styles.bannerPlus}>+</span>
                  <img
                    src={baseUrl + "img/x402/masumi-wordmark.png"}
                    alt="Masumi"
                    className={clsx(styles.bannerLogo, styles.bannerLogoMasumi)}
                  />
                </span>
                <p className={styles.masumiBannerText}>
                  Masumi is a protocol for agentic commerce on Cardano. Its escrow is native to
                  the x402 scheme.
                </p>
              </div>
              <div className={styles.tableWrap}>
                <table className={clsx(styles.table, styles.compare)}>
                  <thead>
                    <tr>
                      <th />
                      <th className={styles.compareCol}>x402</th>
                      <th className={styles.compareCol}>x402 + Masumi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map(row => (
                      <tr key={row.feature}>
                        <td>
                          <a href={row.href} {...EXTERNAL_LINK_PROPS} className={styles.compareLink}>
                            {row.feature}
                          </a>
                          <span className={styles.compareDetail}>{row.detail}</span>
                        </td>
                        {row.cols.map((on, i) => (
                          <td key={i} className={styles.compareCell}>
                            {on ? (
                              <span
                                className={clsx(
                                  styles.tick,
                                  i === 1 ? styles.tickBrand : styles.tickNeutral,
                                )}
                              >
                                ✓
                              </span>
                            ) : (
                              <span className={styles.tickOff}>·</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.panelBodyWide}>
                A Masumi payment locks funds in escrow against job terms the seller signed. The
                x402 request ends at the lock. Result delivery, refunds and disputes then follow
                the Masumi escrow lifecycle, with every decision logged on chain.
              </p>
              <p className={styles.panelLinks}>
                <a
                  href="https://www.masumi.network/dev/masumi/core-concepts/x402"
                  {...EXTERNAL_LINK_PROPS}
                >
                  Masumi x402 concepts
                  <ExternalArrow />
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Beyond the payment</h2>
              <p>
                x402 handles the payment. Masumi adds agent identity, discovery and escrow. Build
                on both for what agentic commerce needs next.
              </p>
            </div>
            <div className={styles.areaGrid}>
              {AREAS.map(area => (
                <div key={area.title} className={styles.areaCard}>
                  <h4>{area.title}</h4>
                  <p>{area.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="start">
          <div className="container">
            <div className={home.devPanel}>
              <div className={home.devPanelCopy}>
                <div className={home.devPanelHeader}>
                  <h3>A paid route is a dozen lines</h3>
                  <p>Register the Cardano scheme, declare a price.</p>
                </div>
                <p className={styles.panelBody}>
                  The middleware, the client that pays and retries, and a local facilitator are
                  already wired in the Express template. The full reference, including the{" "}
                  <a
                    href="https://docs.x402.org/schemes/exact#cardano-setup"
                    {...EXTERNAL_LINK_PROPS}
                  >
                    Cardano setup
                  </a>
                  , is in the{" "}
                  <a href="https://docs.x402.org" {...EXTERNAL_LINK_PROPS}>
                    official x402 docs
                  </a>
                  .
                </p>
              </div>
              <div className={clsx(home.devPanelArt, home.devPanelArtLead)}>
                <div className={home.devCodeCard}>
                  <div className={home.codeBlock}>
                    <div className={home.codeHeader}>
                      <span className={home.codeDot} />
                      <span className={home.codeDot} />
                      <span className={home.codeDot} />
                      <span className={home.codeTitle}>seller.ts</span>
                    </div>
                    <code className={styles.editorCode}>
                      {SELLER_LINES.map((line, i) => (
                        <EditorLine key={i} line={line} />
                      ))}
                    </code>
                  </div>
                </div>
              </div>
              <div className={clsx(styles.panelFull, styles.qsScope)}>
                <QuickstartCard
                  badge="SDK"
                  text="Cardano package on npm"
                  command={INSTALL_COMMAND}
                  prompt
                  docHref="https://docs.x402.org/schemes/exact#cardano-setup"
                  docLabel="The Cardano setup in the official docs"
                  docExternal
                />
              </div>
            </div>

            <div className={styles.templatesBlock}>
              <h2 className={styles.plainHeading}>Pick your starting point</h2>
              <p className={styles.sectionLead}>
                Two templates to build from and one complete reference. Start from Express for a
                headless agent behind an API, from Next.js when a person pays in the browser. Both
                use TypeScript, the language of Cardano&apos;s x402 SDK.
              </p>
              <div className={styles.templateGrid}>
                <TemplateCard
                  title="Express starter"
                  body="Client, server and a local facilitator, ready to run in two terminals."
                  href="/templates/x402-express/"
                  linkLabel="View the template"
                />
                <TemplateCard
                  title="Next.js paywall"
                  body="Payment-gated routes behind a CIP-30 browser wallet paywall."
                  href="/templates/x402-next/"
                  linkLabel="View the template"
                />
                <TemplateCard
                  title="The complete demo"
                  body="A working app that runs the whole x402 flow and shows each step as a payment happens. Address payments and Masumi escrow, in ADA and USDM, with browser wallets."
                  href="https://github.com/cardano-foundation/x402-cardano-demo"
                  linkLabel="Open the repository"
                  external
                  dark
                />
              </div>
              <div className={clsx(styles.masumiBanner, styles.masumiPath)}>
                <span className={styles.masumiBannerMark}>
                  <img
                    src={baseUrl + "img/x402/masumi-wordmark.png"}
                    alt="Masumi"
                    className={clsx(styles.bannerLogo, styles.bannerLogoMasumi)}
                  />
                </span>
                <p className={styles.masumiBannerText}>
                  For agent services with escrow and an on-chain identity, start with Masumi. It
                  works with CrewAI, LangGraph and other agent frameworks.
                </p>
                <a
                  href="https://www.masumi.network/dev/masumi/documentation"
                  {...EXTERNAL_LINK_PROPS}
                  className={styles.masumiPathLink}
                >
                  Start with Masumi
                  <ExternalArrow />
                </a>
              </div>
              <p className={styles.slotNote}>
                The hosted facilitator URL and the support channel will be published here.
              </p>
              <p className={styles.deeperRow}>
                Go deeper:{" "}
                <a
                  href="https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_cardano.md"
                  {...EXTERNAL_LINK_PROPS}
                >
                  the exact scheme spec
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.anchorTarget)} id="agent">
          <div className="container">
            <div className={home.sectionHeader}>
              <h2>Your agent already knows how</h2>
              <p>
                Cardano Dev Skills covers the Cardano side, Masumi Skills the agent layer. For
                the x402 facts in one file, give your agent{" "}
                <a href={baseUrl + "x402/agent.md"}>agent.md</a>.
              </p>
            </div>
            <div className={clsx(home.bentoCard, styles.agentPanel)}>
              <div className={styles.agentHalf}>
                <img
                  src={baseUrl + "img/brand/cardano-horizontal-white.svg"}
                  alt="Cardano"
                  className={styles.agentMark}
                />
                <h3>Cardano Dev Skills</h3>
                <p>
                  Skills and docs for the whole Cardano toolchain, refreshed weekly, so your
                  agent builds from current facts.
                </p>
                <div className={styles.agentCardActions}>
                  <Link
                    className={clsx("button", styles.agentCta)}
                    to="/docs/developers/curriculum/start-building/ai-assisted-development/"
                  >
                    Set up your coding agent
                  </Link>
                </div>
              </div>
              <div className={styles.agentDivider} aria-hidden="true">
                <span>+</span>
              </div>
              <div className={clsx(styles.agentHalf, styles.agentHalfLight)}>
                <img
                  src={baseUrl + "img/x402/masumi-wordmark.png"}
                  alt="Masumi"
                  className={clsx(styles.agentMark, styles.agentMarkMasumi)}
                />
                <h3>Masumi Skills</h3>
                <p>
                  Masumi references for payments, registry and identity, so the same coding
                  agent can build the agent layer.
                </p>
                <div className={styles.agentCardActions}>
                  <a
                    className={clsx("button", styles.agentCta, styles.agentCtaDark)}
                    href="https://www.masumi.network/dev/masumi/documentation/integrations/masumi-skills"
                    {...EXTERNAL_LINK_PROPS}
                  >
                    Install from the Masumi docs
                    <ExternalArrow />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PageCTA
          title="Keep building on Cardano"
          description="Guides, tutorials, and templates for everything else."
          buttons={[
            { href: "/docs/developers/", label: "Get Started" },
            { href: "/templates/", label: "Browse Templates" },
          ]}
          art={bandArt}
        />
      </main>
    </Layout>
  );
}
