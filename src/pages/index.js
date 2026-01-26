import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import OpenStickyButton from "../components/buttons/openStickyButton";

/* ============================================
   DATA
   ============================================ */

// SDKs with language icons
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


/* ============================================
   COMPONENTS
   ============================================ */

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
              A builders manual for Cardano. Everything you need to build and scale
              your onchain app.
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
          {/* Large Smart Contracts Card */}
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

          {/* Native Tokens Card */}
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

          {/* Row 2: Three equal cards (4 cols each = 12 total) */}
          {/* Get Started Card */}
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

          {/* Integrate Payments Card */}
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

          {/* Transaction Metadata Card */}
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

          {/* Row 3: Two equal cards (6 cols each = 12 total) */}
          {/* Stake Pools Card */}
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

          {/* Governance Card */}
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
        <div className={styles.devBento}>
          {/* Left: SDK Card with header */}
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

          {/* Center: Code Block */}
          <div className={styles.devCodeCard}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeDot} />
                <span className={styles.codeDot} />
                <span className={styles.codeDot} />
                <span className={styles.codeTitle}>transaction.ts</span>
              </div>
              <code>
                <span className={styles.codeComment}>// Build and sign a transaction</span>
                <br />
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>tx</span> ={" "}
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>mesh</span>
                <br />
                {"  "}.
                <span className={styles.codeFunction}>txOut</span>(
                <span className={styles.codeString}>"addr..."</span>,{" "}
                <span className={styles.codeVariable}>assets</span>)
                <br />
                {"  "}.
                <span className={styles.codeFunction}>complete</span>();
                <br />
                <br />
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>wallet</span>.
                <span className={styles.codeFunction}>signTx</span>(
                <span className={styles.codeVariable}>tx</span>);
              </code>
            </div>
          </div>

          {/* Right: Help Stack */}
          <div className={styles.devHelpStack}>
            <Link
              to={useBaseUrl("docs/community/cardano-developer-community")}
              className={styles.helpCardSE}
            >
              <div className={styles.helpCardIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <div className={styles.helpCardText}>
                <span className={styles.helpCardTitle}>Community</span>
                <span className={styles.helpCardDesc}>Developer resources</span>
              </div>
              <span className={styles.helpCardArrow}>→</span>
            </Link>
            <a
              href="https://discord.com/invite/2nPUa5d7DE"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.helpCardDiscord}
            >
              <div className={styles.helpCardIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div className={styles.helpCardText}>
                <span className={styles.helpCardTitle}>Discord</span>
                <span className={styles.helpCardDesc}>Join community</span>
              </div>
              <span className={styles.helpCardArrow}>→</span>
            </a>
          </div>

          {/* Extras Row: Builder Tools & Cardano Apps */}
          <div className={styles.devExtrasRow}>
            <Link to={useBaseUrl("tools")} className={styles.extrasCard}>
              <div className={styles.extrasCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div className={styles.extrasCardText}>
                <span className={styles.extrasCardTitle}>Builder Tools</span>
                <span className={styles.extrasCardDesc}>APIs, indexers, and developer utilities</span>
              </div>
              <span className={styles.extrasCardArrow}>→</span>
            </Link>
            <a
              href="https://cardano.org/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.extrasCard}
            >
              <div className={styles.extrasCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div className={styles.extrasCardText}>
                <span className={styles.extrasCardTitle}>Cardano Apps</span>
                <span className={styles.extrasCardDesc}>Explore the ecosystem</span>
              </div>
              <span className={styles.extrasCardArrow}>↗</span>
            </a>
          </div>

          {/* Quickstart: Mesh JS */}
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
                  {copied ? "✓" : "Copy"}
                </button>
              </div>
              <a href="https://meshjs.dev/" target="_blank" rel="noopener noreferrer" className={styles.quickstartLink}>
                Docs ↗
              </a>
            </div>
          </div>

          {/* Quickstart 2: YACI DevKit */}
          <div className={styles.devQuickstartCard2}>
            <div className={styles.quickstartLeft}>
              <span className={styles.quickstartBadge2}>Devnet</span>
              <span className={styles.quickstartText}>Spin up a simulated devnet instantly</span>
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
                  {copied2 ? "✓" : "Copy"}
                </button>
              </div>
              <a href="https://devkit.yaci.xyz/" target="_blank" rel="noopener noreferrer" className={styles.quickstartLink}>
                Docs ↗
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
          {/* Smart Contracts Card */}
          <div className={styles.scLearnCard}>
            <img
              src={useBaseUrl("img/card-smart-contracts.svg")}
              alt=""
              className={styles.scLearnImage}
            />
            <div className={styles.scLearnOverlay} />
            <div className={styles.scLearnContent}>
              <span className={styles.scLearnBadge}>Learn</span>
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

          {/* Asteria Card */}
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
              <span className={styles.asteriaBadge}>Play</span>
              <h3>Asteria</h3>
              <p>Learn eUTxO by building bots that compete in a 2D space game</p>
              <span className={styles.asteriaLink}>Explore universe →</span>
            </div>
          </a>

          {/* CTF Challenge Card */}
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
              <span className={styles.scCTFBadge}>Challenge</span>
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
          {/* Hackathons Card */}
          <Link to={useBaseUrl("hackathons")} className={styles.ctaHackathons}>
            <img
              src={useBaseUrl("img/hackathons/hackathon.jpg")}
              alt=""
              className={styles.ctaHackathonsImage}
            />
            <div className={styles.ctaHackathonsOverlay} />
            <div className={styles.ctaHackathonsContent}>
              <span className={styles.ctaHackathonsBadge}>Events</span>
              <h3>Hackathons</h3>
              <p>Build, compete, and win prizes with developers worldwide</p>
              <span className={styles.ctaHackathonsLink}>View upcoming →</span>
            </div>
          </Link>

          {/* Events Card */}
          <a
            href="https://cardano.org/events/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaEvents}
          >
            <img
              src={useBaseUrl("img/meet-your-community.jpeg")}
              alt=""
              className={styles.ctaEventsImage}
            />
            <div className={styles.ctaEventsOverlay} />
            <div className={styles.ctaEventsContent}>
              <span className={styles.ctaEventsBadge}>Community</span>
              <h3>Cardano Events</h3>
              <p>Meet developers and community members at events worldwide</p>
              <span className={styles.ctaEventsLink}>Find events ↗</span>
            </div>
          </a>

          {/* Funding Card */}
          <Link to={useBaseUrl("docs/community/funding")} className={styles.ctaFunding}>
            <div className={styles.ctaFundingIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>Get Funded</h3>
            <p>Grants and funding opportunities to bring your ideas to life</p>
            <span className={styles.ctaFundingLink}>Explore grants →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MAIN PAGE
   ============================================ */

function Home() {
  return (
    <Layout description="Cardano Developer Portal - Build the future on Cardano">
      <Hero />
      <main>
        <BentoSection />
        <DeveloperSection />
        <SmartContractsSection />
        <CTASection />
      </main>
      <OpenStickyButton />
    </Layout>
  );
}

export default Home;
