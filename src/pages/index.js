import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import OpenStickyButton from "../components/buttons/openStickyButton";

/* --- DATA --- */

const sdks = [
  {
    name: "TypeScript",
    targetUrl: "docs/get-started/client-sdks/typescript/overview",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    name: "Python",
    targetUrl: "docs/get-started/client-sdks/python/pycardano",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "Rust",
    targetUrl: "docs/get-started/client-sdks/rust/pallas",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  },
  {
    name: "Go",
    targetUrl: "docs/get-started/client-sdks/go/apollo",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
  },
  {
    name: "C#",
    targetUrl: "docs/get-started/client-sdks/csharp/cardanosharp-wallet",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  },
  {
    name: "Swift",
    targetUrl: "docs/get-started/client-sdks/swift/cardanokit",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  },
];


/* --- COMPONENTS --- */

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <img
          src={useBaseUrl("img/hero-smart-contracts.jpeg")}
          alt=""
          className={styles.heroBackgroundImage}
        />
        <div className={styles.heroOverlay} />
      </div>
      <div className={styles.heroGlow} />
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroCard}>
            <h1 className={styles.heroTitle}>Cardano developer resources</h1>
            <p className={styles.heroSubtitle}>
              From first transaction to production dApp and everything in
              between. Docs, tools, and SDKs for Cardano.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoSection() {
  return (
    <section className={styles.bento}>
      <div className="container">
        <div className={styles.bentoGrid}>
          {/* Smart Contracts */}
          <Link
            to={useBaseUrl("docs/build/smart-contracts/overview")}
            className={clsx(styles.bentoCard, styles.bentoLarge)}
          >
            <div className={styles.bentoCardContent}>
              <h3>Smart Contracts</h3>
              <p>Build secure dApps with Aiken. Leverage eUTxO for predictable execution and formal verification.</p>
              <span className={styles.bentoLink}>Start building →</span>
            </div>
            <img
              src={useBaseUrl("img/card-smart-contracts.svg")}
              alt=""
              className={styles.bentoCardImage}
            />
          </Link>

          {/* Native Tokens */}
          <Link
            to={useBaseUrl("docs/build/native-tokens/overview")}
            className={clsx(styles.bentoCard, styles.bentoMedium)}
          >
            <img
              src={useBaseUrl("img/card-native-tokens.svg")}
              alt=""
              className={styles.bentoCardImageTop}
            />
            <div className={styles.bentoCardContent}>
              <h3>Native Tokens</h3>
              <p>Mint tokens and NFTs without smart contracts. Multi-asset support built into the ledger.</p>
              <span className={styles.bentoLink}>Explore →</span>
            </div>
          </Link>

          {/* Get Started */}
          <Link
            to={useBaseUrl("docs/get-started/")}
            className={clsx(styles.bentoCard, styles.bentoThird, styles.bentoAccent)}
          >
            <img
              src={useBaseUrl("img/card-get-started.svg")}
              alt=""
              className={styles.bentoThirdImage}
            />
            <div className={styles.bentoThirdContent}>
              <h3>Get Started</h3>
              <p>New to Cardano? Start here with guides, tutorials, and everything you need.</p>
              <span className={styles.bentoLink}>Begin journey →</span>
            </div>
          </Link>

          {/* Integrate Payments */}
          <Link
            to={useBaseUrl("docs/build/integrate/overview")}
            className={clsx(styles.bentoCard, styles.bentoThird)}
          >
            <img
              src={useBaseUrl("img/card-integrate-cardano.svg")}
              alt=""
              className={styles.bentoThirdImage}
            />
            <div className={styles.bentoThirdContent}>
              <h3>Integrate Payments</h3>
              <p>Accept ADA and native tokens in your applications.</p>
              <span className={styles.bentoLink}>Learn more →</span>
            </div>
          </Link>

          {/* Transaction Metadata */}
          <Link
            to={useBaseUrl("docs/build/transaction-metadata/overview")}
            className={clsx(styles.bentoCard, styles.bentoThird)}
          >
            <img
              src={useBaseUrl("img/card-transaction-metadata.svg")}
              alt=""
              className={styles.bentoThirdImage}
            />
            <div className={styles.bentoThirdContent}>
              <h3>Transaction Metadata</h3>
              <p>Attach arbitrary data to transactions on-chain.</p>
              <span className={styles.bentoLink}>Learn more →</span>
            </div>
          </Link>

          {/* Stake Pools */}
          <Link
            to={useBaseUrl("docs/operate-a-stake-pool/")}
            className={clsx(styles.bentoCard, styles.bentoHalf)}
          >
            <img
              src={useBaseUrl("img/card-operate-a-stake-pool.svg")}
              alt=""
              className={styles.bentoHalfImage}
            />
            <div className={styles.bentoHalfContent}>
              <h3>Operate a Stake Pool</h3>
              <p>Run infrastructure and secure the network.</p>
              <span className={styles.bentoLink}>Get started →</span>
            </div>
          </Link>

          {/* Governance */}
          <Link
            to={useBaseUrl("docs/governance/")}
            className={clsx(styles.bentoCard, styles.bentoHalf)}
          >
            <img
              src={useBaseUrl("img/card-governance.svg")}
              alt=""
              className={styles.bentoHalfImage}
            />
            <div className={styles.bentoHalfContent}>
              <h3>Governance</h3>
              <p>Participate in Cardano's decentralized governance.</p>
              <span className={styles.bentoLink}>Learn more →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function DeveloperSection() {
  const [copied, setCopied] = React.useState(false);
  const [copied2, setCopied2] = React.useState(false);
  const command = "npx meshjs your-app-name";
  const command2 = "yaci-devkit up";

  const copyCommand = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCommand2 = () => {
    navigator.clipboard.writeText(command2);
    setCopied2(true);
    setTimeout(() => setCopied2(false), 2000);
  };

  return (
    <section className={styles.developer}>
      <div className="container">
        <div className={styles.devHeader}>
          <h2>Start Building</h2>
          <p>Everything you need to build on Cardano</p>
        </div>
        <div className={styles.devGrid}>
          {/* Quickstart */}
          <div className={styles.devQuickstartCard}>
            <div className={styles.quickstartLeft}>
              <span className={styles.quickstartBadge}>Quickstart</span>
              <span className={styles.quickstartText}>Bootstrap a dApp in seconds</span>
            </div>
            <div className={styles.quickstartRight}>
              <div className={styles.cliMockup}>
                <span className={styles.cliPrompt}>$</span>
                <code>{command}</code>
                <button
                  className={styles.copyBtn}
                  onClick={copyCommand}
                  aria-label="Copy command"
                >
                  {copied ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.copyIcon}><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.copyIcon}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  )}
                </button>
              </div>
              <a href="https://meshjs.dev/" target="_blank" rel="noopener noreferrer" className={styles.quickstartDocBtn} aria-label="MeshJS Docs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.quickstartDocIcon}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          </div>

          {/* Builder Tools */}
          <Link
            to={useBaseUrl("tools")}
            className={styles.devLinkCard}
          >
            <div className={styles.devLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className={styles.devLinkText}>
              <span className={styles.devLinkTitle}>Builder Tools</span>
              <span className={styles.devLinkDesc}>APIs, indexers, and utilities</span>
            </div>
            <span className={styles.devLinkArrow}>→</span>
          </Link>

          {/* Cardano Apps */}
          <a
            href="https://cardano.org/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.devLinkCard}
          >
            <div className={styles.devLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className={styles.devLinkText}>
              <span className={styles.devLinkTitle}>Cardano Apps</span>
              <span className={styles.devLinkDesc}>Explore the ecosystem</span>
            </div>
            <span className={styles.devLinkArrow}>↗</span>
          </a>

          {/* SDKs */}
          <div className={styles.devSdkCard}>
            <div className={styles.devSdkHeader}>
              <h2>Build in Your Language</h2>
              <p>Production-ready SDKs for every stack</p>
            </div>
            <div className={styles.sdkGrid}>
              {sdks.map((sdk, idx) => (
                <Link
                  key={idx}
                  to={useBaseUrl(sdk.targetUrl)}
                  className={styles.sdkItem}
                >
                  <img src={sdk.icon} alt="" />
                  <span>{sdk.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Code sample */}
          <div className={styles.devCodeCard}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeDot} />
                <span className={styles.codeDot} />
                <span className={styles.codeDot} />
                <span className={styles.codeTitle}>transaction.ts</span>
              </div>
              <code>
                <span className={styles.codeComment}>// Build a payment transaction</span>
                <br />
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>tx</span> ={" "}
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>txBuilder</span>
                <br />
                {"  "}.
                <span className={styles.codeFunction}>newTx</span>()
                <br />
                {"  "}.
                <span className={styles.codeFunction}>payToAddress</span>(
                <span className={styles.codeVariable}>address</span>,{" "}
                <span className={styles.codeFunction}>lovelace</span>(
                <span className={styles.codeVariable}>2_000_000n</span>))
                <br />
                {"  "}.
                <span className={styles.codeFunction}>build</span>();
                <br />
                <br />
                <span className={styles.codeComment}>// Sign and submit</span>
                <br />
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>txHash</span> ={" "}
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>wallet</span>.
                <span className={styles.codeFunction}>sign</span>().
                <span className={styles.codeFunction}>submit</span>();
              </code>
            </div>
          </div>

          {/* Community */}
          <Link
            to={useBaseUrl("docs/community/cardano-developer-community")}
            className={styles.devLinkCard}
          >
            <div className={styles.devLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className={styles.devLinkText}>
              <span className={styles.devLinkTitle}>Community</span>
              <span className={styles.devLinkDesc}>Connect with developers</span>
            </div>
            <span className={styles.devLinkArrow}>→</span>
          </Link>

          {/* Infrastructure */}
          <Link
            to={useBaseUrl("docs/get-started/infrastructure/overview")}
            className={styles.devLinkCard}
          >
            <div className={styles.devLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div className={styles.devLinkText}>
              <span className={styles.devLinkTitle}>Infrastructure</span>
              <span className={styles.devLinkDesc}>Nodes, APIs, and services</span>
            </div>
            <span className={styles.devLinkArrow}>→</span>
          </Link>

          {/* Devnet (YACI) */}
          <div className={styles.devQuickstartCard2}>
            <div className={styles.quickstartLeft}>
              <span className={styles.quickstartBadge2}>Devnet</span>
              <span className={styles.quickstartText}>Local development network, ready in one command</span>
            </div>
            <div className={styles.quickstartRight}>
              <div className={styles.cliMockup}>
                <span className={styles.cliPrompt}>$</span>
                <code>{command2}</code>
                <button
                  className={styles.copyBtn}
                  onClick={copyCommand2}
                  aria-label="Copy command"
                >
                  {copied2 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.copyIcon}><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.copyIcon}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  )}
                </button>
              </div>
              <a href="https://devkit.yaci.xyz/" target="_blank" rel="noopener noreferrer" className={styles.quickstartDocBtn} aria-label="YACI DevKit Docs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.quickstartDocIcon}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SmartContractsSection() {
  return (
    <section className={styles.smartContracts}>
      <div className="container">
        <div className={styles.scHeader}>
          <h2>From First Line to Production</h2>
          <p>Master smart contract development on Cardano</p>
        </div>
        <div className={styles.scGrid}>
          {/* Smart Contracts learn */}
          <div className={styles.scLearnCard}>
            <img
              src={useBaseUrl("img/card-smart-contracts.svg")}
              alt=""
              className={styles.scLearnImage}
            />
            <div className={styles.scLearnOverlay} />
            <div className={styles.scLearnContent}>
              <h3>Smart Contracts</h3>
              <p>Design patterns, libraries, and security best practices</p>
              <div className={styles.scLearnLinks}>
                <Link to={useBaseUrl("docs/build/smart-contracts/advanced/design-patterns/overview")}>
                  Patterns
                </Link>
                <Link to={useBaseUrl("docs/build/smart-contracts/languages/aiken/smart-contract-library")}>
                  Library
                </Link>
                <Link to={useBaseUrl("docs/build/smart-contracts/advanced/security/overview")}>
                  Security
                </Link>
              </div>
            </div>
          </div>

          {/* Asteria */}
          <a
            href="https://asteria.txpipe.io/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.asteriaCard}
          >
            <img
              src={useBaseUrl("img/asteria-game.jpg")}
              alt=""
              className={styles.asteriaImage}
            />
            <div className={styles.asteriaOverlay} />
            <div className={styles.asteriaContent}>
              <h3>Asteria</h3>
              <p>Learn development with eUTxOs by building bots that compete in a 2D space game</p>
              <span className={styles.asteriaLink}>Explore universe →</span>
            </div>
          </a>

          {/* CTF */}
          <Link
            to={useBaseUrl("docs/build/smart-contracts/advanced/security/ctf")}
            className={styles.scCTFCard}
          >
            <img
              src={useBaseUrl("img/cardano-ctf.jpeg")}
              alt=""
              className={styles.scCTFImage}
            />
            <div className={styles.scCTFOverlay} />
            <div className={styles.scCTFContent}>
              <h3>Cardano CTF</h3>
              <p>Find vulnerabilities, exploit contracts, earn rewards</p>
              <span className={styles.scCTFLink}>Start hacking →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaHeader}>
          <h2>Join the Ecosystem</h2>
          <p>Connect, build, and get funded</p>
        </div>
        <div className={styles.ctaRow}>
          {/* Hackathons */}
          <Link to={useBaseUrl("hackathons")} className={styles.ctaHackathons}>
            <img
              src={useBaseUrl("img/hackathons/hackathon.jpg")}
              alt=""
              className={styles.ctaHackathonsImage}
            />
            <div className={styles.ctaHackathonsOverlay} />
            <div className={styles.ctaHackathonsContent}>
              <h3>Hackathons</h3>
              <p>Build, compete, and win prizes with developers worldwide</p>
              <span className={styles.ctaHackathonsLink}>View upcoming →</span>
            </div>
          </Link>

          {/* Events */}
          <a
            href="https://cardano.org/events/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaEvents}
          >
            <img
              src={useBaseUrl("img/card-cardano-events.png")}
              alt=""
              className={styles.ctaEventsImage}
            />
            <div className={styles.ctaEventsOverlay} />
            <div className={styles.ctaEventsContent}>
              <h3>Cardano Events</h3>
              <p>Meet developers and community members at events worldwide</p>
              <span className={styles.ctaEventsLink}>Find events ↗</span>
            </div>
          </a>

          {/* Funding */}
          <Link to={useBaseUrl("docs/community/funding")} className={styles.ctaFunding}>
            <img
              src={useBaseUrl("img/card-get-funded.jpg")}
              alt=""
              className={styles.ctaFundingImage}
            />
            <div className={styles.ctaFundingOverlay} />
            <div className={styles.ctaFundingContent}>
              <h3>Get Funded</h3>
              <p>Grants and funding opportunities to bring your ideas to life</p>
              <span className={styles.ctaFundingLink}>Explore grants →</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function OfficeHoursSection() {
  return (
    <section className={styles.officeHours}>
      <div className="container">
        <div className={styles.officeHoursInner}>
          <div className={styles.officeHoursContent}>
            <span className={styles.officeHoursBadge}>Every week</span>
            <h2>Developer Office Hours</h2>
            <p>
              Get your questions answered live by Cardano Foundation engineers.
              Each session features a different topic followed by open Q&A. All
              recordings available on YouTube.
            </p>
            <div className={styles.officeHoursActions}>
              <a
                href="https://www.addevent.com/calendar/TG807216"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeHoursBtn}
              >
                Add to Calendar
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PLCuyQuWCJVQ3IZiQQvHtczEM-cFAqoHBr"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.officeHoursBtnSecondary}
              >
                Watch Recordings ↗
              </a>
            </div>
          </div>
          <div className={styles.officeHoursImageCard}>
            <img
              src={useBaseUrl("img/card-office-hours.png")}
              alt="Cardano Developers Calendar"
              className={styles.officeHoursImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- MAIN PAGE --- */

function Home() {
  return (
    <Layout description="Cardano Developer Portal - Build the future on Cardano">
      <Hero />
      <main>
        <BentoSection />
        <CTASection />
        <DeveloperSection />
        <SmartContractsSection />
        <OfficeHoursSection />
      </main>
      <OpenStickyButton />
    </Layout>
  );
}

export default Home;
