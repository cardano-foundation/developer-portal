import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import ContributeButton from "@site/src/components/ContributeButton";
import ExternalArrow from "@site/src/components/ExternalArrow";
import { EXTERNAL_LINK_PROPS, isExternalHref, linkPropsFor } from "@site/src/utils/externalLink";
import useCopyToClipboard from "@site/src/utils/useCopyToClipboard";

/* --- DATA --- */

const sdks = [
  {
    name: "TypeScript",
    targetUrl: "tools/?tags=sdk&tags=typescript",
    icon: "img/icons/typescript-original.svg",
  },
  {
    name: "Python",
    targetUrl: "tools/?tags=sdk&tags=python",
    icon: "img/icons/python-original.svg",
  },
  {
    name: "Rust",
    targetUrl: "tools/?tags=sdk&tags=rust",
    icon: "img/icons/rust-original.svg",
  },
  {
    name: "Go",
    targetUrl: "tools/?tags=sdk&tags=golang",
    icon: "img/icons/go-original.svg",
  },
  {
    name: "Java",
    targetUrl: "tools/?tags=sdk&tags=java",
    icon: "img/icons/java-original.svg",
  },
  {
    name: "C",
    targetUrl: "tools/?tags=sdk&tags=c",
    icon: "img/icons/c-original.svg",
  },
  {
    name: "Swift",
    targetUrl: "tools/?tags=sdk&tags=swift",
    icon: "img/icons/swift-original.svg",
  },
];

/* --- COMPONENTS --- */

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground} aria-hidden="true">
        {[styles.heroArtLight, styles.heroArtDark].map((artClass) => (
          <div key={artClass} className={clsx(styles.heroArt, artClass)}>
            <span className={clsx(styles.heroCircle, styles.heroCircle1)} />
            <span className={clsx(styles.heroCircle, styles.heroCircle2)} />
            <span className={clsx(styles.heroCircle, styles.heroCircle3)} />
            <span className={clsx(styles.heroCircle, styles.heroCircle4)} />
            <span className={clsx(styles.heroCircle, styles.heroCircle5)} />
          </div>
        ))}
      </div>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>Cardano Developer Portal</h1>
          </div>
          <div className={styles.heroRight}>
            <p className={styles.heroSubtitle}>
              From the first transaction to the production dApp and everything
              in between. Docs, tools, and SDKs for Cardano.
            </p>
            <div className={styles.heroActions}>
              <Link to={useBaseUrl("docs/developers/")} className="button button--primary">
                Start Here
              </Link>
              <Link
                to={useBaseUrl("docs/developers/curriculum/start-building/ai-assisted-development/")}
                className="button button--outline button--primary"
              >
                Code with AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoSection() {
  const cards = [
    {
      title: "Native Tokens",
      body: "Mint tokens and NFTs without smart contracts. Multi-asset support built into the ledger.",
      cta: "Explore",
      to: "docs/developers/curriculum/native-tokens/overview",
      icon: "img/home/rebrand/icon-native-tokens.svg",
    },
    {
      title: "Smart Contracts",
      body: "Build dApps with Aiken and leverage the eUTxO model for predictable execution.",
      cta: "Start building",
      to: "docs/developers/curriculum/smart-contracts/overview",
      icon: "img/home/rebrand/icon-smart-contracts.svg",
    },
    {
      title: "Integrate Payments",
      body: "Accept ADA and native tokens in your applications.",
      cta: "Learn more",
      to: "docs/developers/curriculum/dapps/overview",
      icon: "img/home/rebrand/icon-integrate-payments.svg",
    },
    {
      title: "Transaction Metadata",
      body: "Attach arbitrary data to transactions on-chain.",
      cta: "Learn more",
      to: "docs/developers/curriculum/start-building/transaction-building#transaction-metadata",
      icon: "img/home/rebrand/icon-transaction-metadata.svg",
    },
    {
      title: "Operate a Stake Pool",
      body: "Run infrastructure and secure the network.",
      cta: "Get started",
      to: "docs/operators/",
      icon: "img/home/rebrand/icon-stake-pool.svg",
    },
    {
      title: "Governance",
      body: "Participate in Cardano's decentralized governance.",
      cta: "Learn more",
      to: "https://cardano.org/governance",
      icon: "img/home/rebrand/icon-governance.svg",
    },
  ];
  const baseUrl = useBaseUrl("/");
  const withBase = (to) => (to.startsWith("http") ? to : baseUrl + to);

  return (
    <section className={styles.bento}>
      <div className="container">
        <div className={clsx(styles.sectionHeader, styles.bentoHeader)}>
          <h2>Get started on Cardano</h2>
          <p>
            From native tokens to stake pools, the core concepts you need to
            build on Cardano.
          </p>
        </div>
        <div className={styles.bentoGrid}>
          {/* Start Here — large card with coil artwork */}
          <Link
            to={useBaseUrl("docs/developers/")}
            className={clsx(styles.bentoCard, styles.bentoLarge)}
          >
            <div className={styles.bentoCardContent}>
              <h3>Start Here</h3>
              <p>The 7-module path from zero to shipping, fundamentals through production.</p>
              <div className={styles.bentoCardFooter}>
                <span className={styles.bentoLink}>Start the Curriculum</span>
              </div>
            </div>
            <img
              src={useBaseUrl("img/home/rebrand/bento-start-here.webp")}
              alt=""
              className={styles.bentoLargeArt}
            />
          </Link>

          {cards.map((card) => (
            <Link
              key={card.title}
              to={withBase(card.to)}
              {...linkPropsFor(card.to)}
              className={clsx(styles.bentoCard, styles.bentoSmall)}
            >
              <img
                src={baseUrl + card.icon}
                alt=""
                className={styles.bentoIcon}
              />
              <div className={styles.bentoCardContent}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className={styles.bentoCardFooter}>
                  <span className={styles.bentoLink}>
                    {card.cta}
                    {isExternalHref(card.to) && <ExternalArrow />}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* CLI quickstart card: badge and one-line pitch on the left, a copyable
   command and a square docs link on the right. `prompt` renders the shell
   "$" and belongs only on commands that run in a shell (the AI-agents
   command is typed into the assistant, not a terminal). */
function QuickstartCard({ badge, text, command, prompt, docHref, docLabel, docExternal }) {
  const [copied, copy] = useCopyToClipboard(2000);
  const copyCommand = () => copy(command);

  const docIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.quickstartDocIcon}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
  );

  return (
    <div className={styles.devQuickstartCard}>
      <div className={styles.quickstartLeft}>
        <span className="badge badge--secondary">{badge}</span>
        <span className={styles.quickstartText}>{text}</span>
      </div>
      <div className={styles.quickstartRight}>
        <div className={styles.cliMockup}>
          {prompt && <span className={styles.cliPrompt}>$</span>}
          <code>{command}</code>
          <button
            type="button"
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
        {docExternal ? (
          <a href={docHref} {...EXTERNAL_LINK_PROPS} className={styles.quickstartDocBtn} aria-label={docLabel}>
            <ExternalArrow />
          </a>
        ) : (
          <Link to={docHref} className={styles.quickstartDocBtn} aria-label={docLabel}>
            {docIcon}
          </Link>
        )}
      </div>
    </div>
  );
}

/* One ecosystem destination. Only a destination that leaves the site gets a
   glyph, the external-link arrow; internal routes carry none. */
function EcosystemCard({ title, description, to, href, icon }) {
  const isExternal = Boolean(href);
  const Tag = isExternal ? "a" : Link;
  const linkProps = isExternal ? { href, ...EXTERNAL_LINK_PROPS } : { to };

  return (
    <Tag {...linkProps} className={styles.ecoCard}>
      <div className={styles.ecoCardTop}>
        <span className={styles.ecoCardIcon}>{icon}</span>
        {isExternal && (
          <span className={styles.ecoCardBadge} aria-hidden="true">
            <ExternalArrow />
          </span>
        )}
      </div>
      <span className={styles.ecoCardTitle}>{title}</span>
      <span className={styles.ecoCardDesc}>{description}</span>
    </Tag>
  );
}

const ecoIcons = {
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  apps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  infrastructure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function DeveloperSection() {
  const baseUrl = useBaseUrl("/");

  // Built from baseUrl rather than calling useBaseUrl per card: hooks cannot
  // run inside the map below.
  const ecosystem = [
    {
      title: "Builder Tools",
      description: "APIs, indexers, and utilities",
      to: baseUrl + "tools",
      icon: ecoIcons.tools,
    },
    {
      title: "Cardano Apps",
      description: "Explore the ecosystem",
      href: "https://cardano.org/apps/",
      icon: ecoIcons.apps,
    },
    {
      title: "Infrastructure",
      description: "Nodes, APIs, and services",
      to: baseUrl + "docs/developers/curriculum/production/connecting-to-the-chain",
      icon: ecoIcons.infrastructure,
    },
    {
      title: "Community",
      description: "Connect with developers",
      to: baseUrl + "docs/community/cardano-developer-community",
      icon: ecoIcons.community,
    },
  ];

  return (
    <section className={styles.developer}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Start Building</h2>
          <p>Everything you need to build on Cardano</p>
        </div>

        {/* Panel one: the code sample beside the SDK list. The copy leads in
            the markup and the artwork is moved left by CSS, so the heading is
            read before the sample it introduces. Nothing in the artwork is
            focusable, so visual and focus order stay in step. */}
        <div className={styles.devPanel}>
          <div className={styles.devPanelCopy}>
            <div className={styles.devPanelHeader}>
              <h3>Build in your language</h3>
              <p>Production-ready SDKs for every stack</p>
            </div>
            <div className={styles.sdkGrid}>
              {sdks.map((sdk) => (
                <Link
                  key={sdk.name}
                  to={baseUrl + sdk.targetUrl}
                  className={styles.sdkItem}
                >
                  <img
                    src={baseUrl + sdk.icon}
                    alt={`${sdk.name} logo`}
                  />
                  <span>{sdk.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={clsx(styles.devPanelArt, styles.devPanelArtLead)}>
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
                {"  "}.
                <span className={styles.codeFunction}>payToAddress</span>(
                <span className={styles.codeVariable}>address</span>,{" "}
                <span className={styles.codeFunction}>lovelace</span>(
                <span className={styles.codeVariable}>2_000_000n</span>))
                <br />
                {"  "}.
                <span className={styles.codeFunction}>build</span>();
                <br />
                <br />
                <span className={styles.codeComment}>// Sign and submit</span>
                <br />
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>signedTx</span> ={" "}
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>wallet</span>.
                <span className={styles.codeFunction}>sign</span>(
                <span className={styles.codeVariable}>tx</span>);
                <br />
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>txHash</span> ={" "}
                <span className={styles.codeKeyword}>await</span>{" "}
                <span className={styles.codeVariable}>wallet</span>.
                <span className={styles.codeFunction}>submit</span>(
                <span className={styles.codeVariable}>signedTx</span>);
              </code>
            </div>
          </div>
          </div>
        </div>

        {/* Panel two: the ecosystem destinations beside the two quickstarts.
            Copy leads visually and in the markup here, so no reordering. */}
        <div className={styles.devPanel}>
          <div className={styles.devPanelCopy}>
            <div className={styles.devPanelHeader}>
              <h3>Use Cardano&rsquo;s ecosystem</h3>
              <p>Directories, infrastructure, and the people building alongside you</p>
            </div>
            <div className={styles.ecoGrid}>
              {ecosystem.map((card) => (
                <EcosystemCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          <div className={styles.devPanelArt}>
            <div className={styles.quickstartStack}>
              <QuickstartCard
                badge="AI agents"
                text="Current Cardano context for your AI assistant"
                command="/plugin marketplace add cardano-foundation/cardano-dev-skills"
                docHref={baseUrl + "docs/developers/curriculum/start-building/ai-assisted-development"}
                docLabel="Set up your AI assistant"
              />
              <QuickstartCard
                badge="Devnet"
                text="Local development network, ready in one command"
                command="yaci-devkit up"
                prompt
                docHref="https://devkit.yaci.xyz/"
                docLabel="YACI DevKit Docs"
                docExternal
              />
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
        <div className={styles.sectionHeader}>
          <h2>From First Line to Production</h2>
          <p>Master smart contract development on Cardano</p>
        </div>
        <div className={styles.scGrid}>
          {/* Smart Contracts learn */}
          <div className={styles.prodCard}>
            <img
              src={useBaseUrl("img/home/rebrand/prod-smart-contracts.webp")}
              alt=""
              className={styles.scLearnImage}
            />
            <div className={styles.prodCardOverlay} />
            <div className={styles.prodCardContent}>
              <h3>Smart Contracts</h3>
              <p>Design patterns, examples, and security best practices</p>
              <div className={styles.scLearnLinks}>
                <Link className="button button--primary button--sm" to={useBaseUrl("docs/developers/curriculum/smart-contracts/advanced/design-patterns/overview")}>
                  Patterns
                </Link>
                <Link className="button button--primary button--sm" to={useBaseUrl("templates/contracts")}>
                  Examples
                </Link>
                <Link className="button button--primary button--sm" to={useBaseUrl("docs/developers/curriculum/smart-contracts/security/vulnerabilities/overview")}>
                  Security
                </Link>
              </div>
            </div>
          </div>

          {/* Asteria */}
          <a
            href="https://asteria.txpipe.io/"
            {...EXTERNAL_LINK_PROPS}
            className={styles.prodCard}
          >
            <img
              src={useBaseUrl("img/home/rebrand/prod-asteria.webp")}
              alt=""
              className={styles.asteriaImage}
            />
            <div className={styles.prodCardOverlay} />
            <div className={styles.prodCardContent}>
              <h3>Asteria</h3>
              <p>Learn development with eUTxOs by building bots that compete in a 2D space game</p>
              <span className={clsx("badge badge--primary", styles.prodChip)}>
                Explore universe <ExternalArrow />
              </span>
            </div>
          </a>

          {/* CTF */}
          <Link
            to={useBaseUrl("docs/developers/curriculum/smart-contracts/security/ctf")}
            className={styles.prodCard}
          >
            <img
              src={useBaseUrl("img/home/rebrand/prod-ctf.webp")}
              alt=""
              className={styles.scCTFImage}
            />
            <div className={styles.prodCardOverlay} />
            <div className={styles.prodCardContent}>
              <h3>Cardano CTF</h3>
              <p>Find vulnerabilities, exploit contracts, earn rewards</p>
              <span className={clsx("badge badge--primary", styles.prodChip)}>
                Start hacking
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const cards = [
    {
      title: "Talent Pool",
      body: "Hear about Cardano hackathons, jobs, and grants for developers",
      cta: "Join the pool",
      to: "talent",
      img: "img/home/rebrand/ecosystem-talent-pool.webp",
      alt: "Cardano developers",
      external: false,
    },
    {
      title: "Cardano Events",
      body: "Meet developers and community members at events worldwide",
      cta: "Find events",
      to: "https://cardano.org/events/",
      img: "img/home/rebrand/ecosystem-cardano-events.webp",
      alt: "Cardano community events",
      external: true,
    },
    {
      title: "Get Funded",
      body: "Grants and funding opportunities to bring your ideas to life",
      cta: "Explore grants",
      to: "docs/community/funding",
      img: "img/home/rebrand/ecosystem-get-funded.webp",
      alt: "Cardano funding and grants",
      external: false,
    },
  ];
  const baseUrl = useBaseUrl("/");

  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Join the Ecosystem</h2>
          <p>Connect, build, and get funded</p>
        </div>
        <div className={styles.ctaRow}>
          {cards.map((card) => {
            const inner = (
              <>
                <div className={styles.ctaCardMedia}>
                  <img
                    src={baseUrl + card.img}
                    alt={card.alt}
                    className={styles.ctaCardImage}
                  />
                </div>
                <div className={styles.ctaCardBody}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <span className={styles.ctaCardLink}>
                    {card.cta}
                    {card.external && <ExternalArrow />}
                  </span>
                </div>
              </>
            );
            return card.external ? (
              <a
                key={card.title}
                href={card.to}
                {...EXTERNAL_LINK_PROPS}
                className={styles.ctaCard}
              >
                {inner}
              </a>
            ) : (
              <Link key={card.title} to={baseUrl + card.to} className={styles.ctaCard}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* The banner artwork, exported straight from the design template: scattered
   brand dots as transparent webps, clipped to the banner frame at 2x so they
   scale with the banner height exactly. One export per theme, the same
   pattern the hero uses: the pair differs only where a ball must flip
   between near-navy (visible on the light ground) and a pale orb (visible
   on navy). */
function OfficeHoursArt() {
  return (
    <div className={styles.officeHoursArt} aria-hidden="true">
      <div className={styles.officeHoursArtLight} />
      <div className={styles.officeHoursArtDark} />
    </div>
  );
}

/* The Office Hours banner from the brand template: one rounded block, copy on
   the left, the circle-column artwork on the right. */
function OfficeHoursSection() {
  return (
    <section className={styles.officeHours}>
      <div className="container">
        <div className={styles.officeHoursBanner}>
          <OfficeHoursArt />
          <div className={styles.officeHoursContent}>
            <span className={clsx("badge badge--secondary", styles.officeHoursBadge)}>Weekly</span>
            <h2>Developer Office Hours</h2>
            <p>
              Get your questions answered live by Cardano Foundation engineers.
              Each session features a different topic followed by open Q&A.
            </p>
            <div className={styles.officeHoursActions}>
              <a
                href="https://www.addevent.com/calendar/TG807216"
                {...EXTERNAL_LINK_PROPS}
                className="button button--primary"
              >
                Add to calendar
                <ExternalArrow />
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PLCuyQuWCJVQ3IZiQQvHtczEM-cFAqoHBr"
                {...EXTERNAL_LINK_PROPS}
                className="button button--primary"
              >
                Watch recordings
                <ExternalArrow />
              </a>
            </div>
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
      <div className={styles.landing}>
        <Hero />
        <main>
          <BentoSection />
          <CTASection />
          <DeveloperSection />
          <SmartContractsSection />
          <OfficeHoursSection />
        </main>
        <ContributeButton />
      </div>
    </Layout>
  );
}

export default Home;
